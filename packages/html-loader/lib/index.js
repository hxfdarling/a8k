/* eslint-disable no-inner-declarations */
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
  const self = this;

  const options = loaderUtils.getOptions(self) || {};
  validateOptions(schema, options, 'html inline assets loader');

  self.cacheable && self.cacheable();
  const callback = self.async();

  const publicPath = self._compilation.options.output.publicPath || '';
  const baseDir = path.dirname(self.resource);
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
            self.emitError(new Error(`not found file: ${file} \n in ${baseDir} or ${rootDir}`));
            return;
          }
        }
        const isMiniFile = /\.min\.(js|css)$/.test(filepath);
        self.addDependency(filepath);
        const buffer = await fs.readFile(filepath);
        const loaderContext = { resourcePath: filepath };
        async function processScript() {
          let result = buffer.toString();
          // 只需要转换未压缩的JS
          if (!noParse && !isMiniFile) {
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
          if (inline) {
            node.attrs = [];
            node.childNodes = [{ nodeName: '#text', value: result, parentNode: node }];
          } else {
            // 添加主域重试需要标记
            const url = loaderUtils.interpolateName(loaderContext, filenames.js, {
              content: result,
            });
            result = `var ${varName}=${varName}||{};\n${varName}["${url}"]=true;${result}`;
            self.emitFile(url, result);
            node.attrs = node.attrs.map(i => {
              if (isLink(i)) {
                i.value = [publicPath.replace(/\/$/, ''), url].join(publicPath ? '/' : '');
              }
              return i;
            });
          }
        }
        function processStyle() {
          const result = buffer.toString();
          if (inline) {
            node.nodeName = 'style';
            node.tagName = 'style';
            node.attrs = [{ name: 'type', value: 'text/css' }];
            node.childNodes = [{ nodeName: '#text', value: result, parentNode: node }];
          } else {
            const url = loaderUtils.interpolateName(loaderContext, filenames.css, {
              content: result,
            });
            self.emitFile(url, result);
            node.attrs = node.attrs.map(i => {
              if (isLink(i)) {
                i.value = [publicPath.replace(/\/$/, ''), url].join(publicPath ? '/' : '');
              }
              return i;
            });
          }
        }
        function processHtml() {
          const result = buffer.toString();
          const htmlDom = parse5.parseFragment(result);
          const { childNodes } = node.parentNode;
          childNodes.splice(childNodes.indexOf(node), 1, ...htmlDom.childNodes);
        }
        function processImage() {
          // 图片资源
          const loaderContext = { resourcePath: filepath };
          const url = loaderUtils.interpolateName(loaderContext, filenames.image, {
            content: buffer,
          });
          self.emitFile(url, buffer);
          node.attrs = node.attrs.map(i => {
            if (isLink(i)) {
              i.value = [publicPath.replace(/\/$/, ''), url].join(publicPath ? '/' : '');
            }
            return i;
          });
        }

        switch (true) {
          case isScript(node):
            await processScript();
            break;
          case isStyle(node):
            processStyle();
            break;
          case isHtml(node):
            processHtml();
            break;
          default:
            processImage();
            break;
        }
      } catch (e) {
        console.error(e);
        console.log('---------------@a8k/html-loader error---------------------');
        console.log(self.resourcePath);
        console.error(`process "${node.tagName}" error\n`, node.attrs);
        console.log('---------------------------------------------------------');
        throw e;
      }
    })
  );

  content = parse5.serialize(root);

  callback(null, content);
};
