/* eslint-disable global-require */

const fs = require('fs-extra');
const path = require('path');
const loaderUtils = require('loader-utils');
const queryParse = require('query-parse');

const validateOptions = require('schema-utils');

const crypto = require('crypto');
const parse5 = require('parse5');
const schema = require('./options.json');
const babel = require('./utils/babel');
const cache = require('./utils/cache');

const htmlParse = require('./utils/htmlParse');
const { getLink, isLink, isStyle, isHtml, isScript } = require('./utils/helpers');

const varName = '__JS_RETRY__';
module.exports = async function(content) {
  const options = loaderUtils.getOptions(this) || {};
  validateOptions(schema, options, 'html inline assets loader');

  this.cacheable && this.cacheable();
  const callback = this.async();

  const publicPath = this._compilation.options.output.publicPath || '';
  const baseDir = path.dirname(this.resource);
  const { root, list: nodes } = htmlParse(content);

  // html 转换
  await Promise.all(
    nodes.map(async node => {
      const link = getLink(node);
      const temp = link.value.split('?');
      const query = queryParse.toObject(temp[1] || '');
      Object.keys(query).forEach(key => {
        if (query[key] === '') {
          query[key] = true;
        }
      });
      const { _inline: inline, _dist: dist, _noparse: noParse } = query;
      let result = '';
      const needInclude = !dist || (dist && process.env.NODE_ENV === 'production');
      // 只有生产模式需要
      if (!needInclude) {
        const { childNodes } = node.parentNode;
        childNodes.splice(childNodes.indexOf(node), 1);
        return;
      }
      // url的资源不处理
      if (/^(\/\/|http:|https:)/.test(link.value)) {
        return;
      }
      const file = path.resolve(baseDir, temp[0]);
      if (!fs.existsSync(file)) {
        this.emitError(new Error(`not found file: ${temp[0]} \nin ${this.resource}`));
        return;
      }
      const isMiniFile = /\.min\.(js|css)$/.test(file);
      this.addDependency(file);
      result = (await fs.readFile(file)).toString();
      // 只需要转换未压缩的JS
      if (!noParse && !isMiniFile && isScript(node)) {
        if (options.cacheDirectory) {
          result = await cache({
            cacheDirectory: options.cacheDirectory,
            options,
            source: result,
            // eslint-disable-next-line no-shadow
            transform: (source, options) => {
              return babel(source, options);
            },
          });
        } else {
          result = await babel(result, options);
        }
      }
      // only js/css/html support inline
      if (inline || isHtml(node)) {
        if (isScript(node)) {
          node.attrs = [];
          node.childNodes = [{ nodeName: '#text', value: result, parentNode: node }];
        } else if (isStyle(node)) {
          node.nodeName = 'style';
          node.tagName = 'style';
          node.attrs = [{ name: 'type', value: 'text/css' }];
          node.childNodes = [{ nodeName: '#text', value: result, parentNode: node }];
        } else if (isHtml(node)) {
          const htmlDom = parse5.parseFragment(result);
          const { childNodes } = node.parentNode;
          childNodes.splice(childNodes.indexOf(node), 1, ...htmlDom.childNodes);
        } else {
          const msg = `\nonly js/css support inline:${JSON.stringify(
            { tagName: node.tagName, attrs: node.attrs },
            null,
            2
          )}`;
          this.emitWarning(msg);
        }
      } else {
        const Hash = crypto.createHash('md5');
        Hash.update(result);
        const hash = Hash.digest('hex').substr(0, 6);
        const newFileName = `${path.basename(file).split('.')[0]}_${hash}${path.extname(file)}`;
        const newUrl = [publicPath.replace(/\/$/, ''), newFileName].join(publicPath ? '/' : '');
        if (isScript(node)) {
          // 添加主域重试需要标记
          result = `var ${varName}=${varName}||{};\n${varName}["${newFileName}"]=true;${result}`;
        }
        this.emitFile(newFileName, result);

        node.attrs = node.attrs.map(i => {
          if (isLink(i)) {
            i.value = newUrl;
          }
          return i;
        });
      }
    })
  );

  content = parse5.serialize(root);

  callback(null, content);
};
