const loaderUtils = require('loader-utils');
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

const NunjucksLoader = nunjucks.Loader.extend({
  // Based off of the Nunjucks 'FileSystemLoader'

  init(searchPaths, sourceFoundCallback) {
    this.sourceFoundCallback = sourceFoundCallback;
    if (searchPaths) {
      searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
      // For windows, convert to forward slashes
      this.searchPaths = searchPaths.map(path.normalize);
    } else {
      this.searchPaths = ['.'];
    }
  },

  getSource(name) {
    let fullpath = null;
    const paths = this.searchPaths;

    for (let i = 0; i < paths.length; i++) {
      const p = path.resolve(paths[i], name);
      // Only allow the current directory and anything
      // underneath it to be searched
      if (fs.existsSync(p)) {
        fullpath = p;
        break;
      }
    }

    if (!fullpath) {
      return null;
    }

    this.sourceFoundCallback(fullpath);

    return {
      src: fs.readFileSync(fullpath, 'utf-8'),
      path: fullpath,
      noCache: this.noCache,
    };
  },
});

module.exports = function(content) {
  this.cacheable();

  const callback = this.async();
  const opt = loaderUtils.getOptions(this);
  const dir = path.dirname(this.resource);

  const nunjucksSearchPaths = [dir, ...(opt.searchPaths || [])];
  const nunjucksContext = opt.context;

  const loader = new NunjucksLoader(nunjucksSearchPaths, p => {
    this.addDependency(p);
  });

  const nunjEnv = new nunjucks.Environment(loader);
  nunjucks.configure(null, { watch: false });

  const template = nunjucks.compile(content, nunjEnv);
  const html = template.render(nunjucksContext);

  callback(null, html);
};
