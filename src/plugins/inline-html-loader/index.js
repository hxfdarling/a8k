const loaderUtils = require('loader-utils');
const queryParse = require('query-parse');
const fs = require('fs');
const path = require('path');
const { transform } = require('@babel/core');
const attrParse = require('./lib/attributesParser');

function getCode(file) {
  return new Promise(resolve => {
    if (fs.existsSync(file)) {
      fs.readFile(file, (err, data) => {
        resolve(data.toString());
      });
    } else {
      throw Error(`${file} not found`);
    }
  });
}
module.exports = async function(content) {
  this.cacheable && this.cacheable();
  const callback = this.async();

  const webpackConfig = this._compiler.parentCompilation.options;
  const { publicPath } = webpackConfig.output;

  const babelOptions = {
    minified: process.env.NODE_ENV !== 'development',
    presets: [require.resolve('@babel/preset-env')],
  };
  const { resource } = this;

  const dir = path.dirname(resource);
  const tags = attrParse(content).filter(tag => {
    const link = tag.attrs.find(i => i.name === 'src' || i.name === 'href');
    if (loaderUtils.isUrlRequest(link.value, dir)) {
      return true;
    }
  });

  await Promise.all(
    tags.map(async tag => {
      const link = tag.attrs.find(i => i.name === 'src' || i.name === 'href');
      const temp = link.value.split('?');
      const query = queryParse.toObject(temp[1] || '');
      Object.keys(query).forEach(key => {
        if (query[key] === '') {
          query[key] = true;
        }
      });

      let code = '<!--inline-html-loader-->';
      const file = path.resolve(dir, temp[0]);
      code = await getCode(file, tag);

      if (query._inline) {
        if (tag.name === 'script') {
          code = transform(code, babelOptions).code;
          code = `<script>${code}</script>`;
        } else if (tag.name === 'link') {
          code = `<style type="text/css" >${code}</style>`;
        }
      } else {
        let sourceMap = '';
        if (tag.name === 'script') {
          const tr = transform(code, babelOptions);
          code = tr.code;
          sourceMap = tr.sourceMap;
        }

        const crypto = require('crypto');
        const Hash = crypto.createHash('md5');
        Hash.update(code);
        const hash = Hash.digest('hex').substr(0, 6);
        const newFileName = `${path.basename(file).split('.')[0]}_${hash}${path.extname(file)}`;

        this.emitFile(newFileName, code, sourceMap);
        const newUrl = path.join(publicPath, newFileName);
        if (tag.name === 'script') {
          code = `<script src=${newUrl}></script>`;
        } else {
          code = `<link ref="stylesheet" href="${newUrl}"/>`;
        }
      }
      tag.code = code;
    })
  );

  tags.reverse();
  content = [content];
  tags.forEach(tag => {
    const x = content.pop();
    content.push(x.substr(tag.end));
    content.push(tag.code);
    content.push(x.substr(0, tag.start));
  });
  content.reverse();
  content = content.join('');

  callback(null, content);
};
