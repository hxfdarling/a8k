/* eslint-disable global-require */

const fs = require('fs-extra');
const path = require('path');
const loaderUtils = require('loader-utils');
const queryParse = require('query-parse');
const validateOptions = require('schema-utils');
const parse5 = require('parse5');

const schema = require('./options.json');
const babel = require('./utils/babel');
const cache = require('./utils/cache');

const htmlParse = require('./utils/htmlParse');
const { getLink, isLink, isStyle, isHtml, isScript } = require('./utils/helpers');

const varName = '__JS_RETRY__';
const defaultFilenames = {
  js: '[name]_[contenthash].[ext]',
  css: '[name]_[contenthash].[ext]',
  image: '[name]_[hash].[ext]',
};
module.exports = async function(content) {
  const options = loaderUtils.getOptions(this) || {};
  validateOptions(schema, options, 'html inline assets loader');

  this.cacheable && this.cacheable();
  const callback = this.async();

  const publicPath = this._compilation.options.output.publicPath || '';
  const baseDir = path.dirname(this.resource);
  const { rootDir } = options;
  const { root, list: nodes } = htmlParse(content, options);

  let { filenames = {} } = options;
  filenames = { ...defaultFilenames, ...filenames };
  // 不支持 chunkhash
  Object.keys(filenames).forEach(key => {
    filenames[key] = filenames[key].replace('[chunkhash]', '[contenthash]');
  });

  // html 转换
  await Promise.all(
    nodes.map(async node => {
      const link = getLink(node);
      try {
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
        // url的资源不处理,没有值也不处理
        if (!link.value || /^(\/\/|https?:|data:;base64)/.test(link.value)) {
          return;
        }
        const file = temp[0];
        let filepath = path.join(baseDir, file);
        if (!fs.existsSync(filepath)) {
          // 绝对路径支持~
          const absoluteFile = path.join(rootDir, file.replace(/^~/, ''));
          if (fs.existsSync(absoluteFile)) {
            filepath = absoluteFile;
          } else {
            this.emitError(new Error(`not found file: ${file} \n in ${baseDir} or ${rootDir}`));
            return;
          }
        }
        const isMiniFile = /\.min\.(js|css)$/.test(filepath);
        this.addDependency(filepath);
        result = (await fs.readFile(filepath)).toString();
        // 只需要转换未压缩的JS
        if (!noParse && !isMiniFile && isScript(node)) {
          if (options.cacheDirectory) {
            result = await cache({
              cacheDirectory: options.cacheDirectory,
              options,
              source: result,
              // eslint-disable-next-line no-shadow
              transform: (source, options) => {
                return babel(filepath, source, options);
              },
            });
          } else {
            result = await babel(filepath, result, options);
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
          let url = '';
          const loaderContext = { resourcePath: filepath };
          if (isScript(node)) {
            // 添加主域重试需要标记
            url = loaderUtils.interpolateName(loaderContext, filenames.js, {
              content: result,
            });
            result = `var ${varName}=${varName}||{};\n${varName}["${url}"]=true;${result}`;
          } else if (isStyle(node)) {
            url = loaderUtils.interpolateName(loaderContext, filenames.css, {
              content: result,
            });
          } else {
            url = loaderUtils.interpolateName(loaderContext, filenames.image, {
              content: result,
            });
          }

          this.emitFile(url, result);

          node.attrs = node.attrs.map(i => {
            if (isLink(i)) {
              i.value = [publicPath.replace(/\/$/, ''), url].join(publicPath ? '/' : '');
            }
            return i;
          });
        }
      } catch (e) {
        console.error(e);
        console.log('---------------@a8k/html-loader error---------------------');
        console.log(this.resourcePath);
        console.error(`process "${node.tagName}" error\n`, node.attrs);
        console.log('---------------------------------------------------------');
        throw e;
      }
    })
  );

  content = parse5.serialize(root);

  callback(null, content);
};
