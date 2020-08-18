/* eslint-disable no-inner-declarations */
/* eslint-disable global-require */
const path = require('path');
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');

const schema = require('./options.json');
const defaultFilenames = {
  js: '[name]_[contenthash].[ext]',
  css: '[name]_[contenthash].[ext]',
  image: '[name]_[hash].[ext]',
};
const transform = require('./utils/transform');

module.exports = async function(content) {
  const self = this;

  const options = loaderUtils.getOptions(self) || {};
  validateOptions(schema, options, 'html inline assets loader');

  self.cacheable && self.cacheable();
  const callback = self.async();

  const publicPath = self._compilation.options.output.publicPath || '';
  const baseDir = path.dirname(self.resource);

  let { filenames = {} } = options;
  filenames = { ...defaultFilenames, ...filenames };
  // 不支持 chunkhash
  Object.keys(filenames).forEach(key => {
    filenames[key] = filenames[key].replace('[chunkhash]', '[contenthash]');
  });

  content = await transform(
    content,
    {
      baseDir,
      publicPath,
      ...options,
      filenames,
    },
    {
      emitFile(file, content) {
        self.emitFile(file, content);
      },
    }
  );

  callback(null, content);
};
