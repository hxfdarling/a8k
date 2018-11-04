const loaderUtils = require('loader-utils');
const queryParse = require('query-parse');
const fs = require('fs');
const path = require('path');
const attrParse = require('./lib/attributesParser');

function getCode(file, tag) {
  let code = '';
  return new Promise(resolve => {
    if (fs.existsSync(file)) {
      fs.readFile(file, (err, data) => {
        if (tag.name === 'script') {
          // TODO: babel 编译
          code = `<script>${data.toString()}</script>`;
        } else if (tag.name === 'link') {
          code = `<style type="text/css" >${data.toString()}</style>`;
        }
        resolve(code);
      });
    } else {
      throw Error(`${file} not found`);
    }
  });
}
module.exports = async function(content) {
  this.cacheable && this.cacheable();
  const callback = this.async();
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
      if (query._inline) {
        const file = path.resolve(dir, temp[0]);
        code = await getCode(file, tag);
      } else {
        // TODO: 支持自动拷贝文件到dist目录
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
