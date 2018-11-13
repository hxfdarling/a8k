/* eslint-disable no-continue,no-restricted-syntax */
const { ConcatSource } = require('webpack-sources');
const { ModuleFilenameHelpers } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const attrParse = require('./attributesParser');
const { SCRIPT } = require('./const');

const varName = '__JS_RETRY__';

/**
 * @typedef {Object} PluginOptions
 * @property {String} retryPublicPath 重试加载地址，例如://fudao.qq.com/pc
 * @property {Boolean?} entryOnly default false
 * @property {string|RegExp|Array?} test
 * @property {string|RegExp|Array?} include
 * @property {string|RegExp|Array?} exclude
 */

class RetryPlugin {
  constructor(options) {
    if (arguments.length > 1) {
      throw new Error('Retry only takes one argument (pass an options object)');
    }
    if (!options || options.retryPublicPath === undefined) {
      throw new Error('Retry need options.retryPublicPath');
    }

    /** @type {PluginOptions} */
    this.options = Object.assign({}, options);
  }

  genReportCode() {
    return `
<script>
var ${varName}={};
function __retryPlugin(event){
  var isRetry = this.hasAttribute('retry');
  var isStyle = this.tagName==='LINK';
  var isError = event.type==='error';
  var src = this.href||this.src;
  if(isError){
    if(isRetry){
      console.log('【加载失败】【retry】',src);
    }else{
      console.log('【加载失败】',src);
      if(isStyle){
        console.log('需要重新加载style');
        var retryPublicPath  = "${this.options.retryPublicPath}";
        var hwpPublicPath = "${this.hwpPublicPath}";
        var src = this.href;

        if(retryPublicPath){
          retryPublicPath += '/';
          retryPublicPath = retryPublicPath.replace(/\\/\\/$/, '/');
        }
        src = src.replace(hwpPublicPath, '').replace(/^\\//, '');

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href= retryPublicPath + src;
        link.setAttribute('retry','');
        this.parentNode.insertBefore(link,this.nextSibling);
      }
    }
  }else{
    if(isRetry){
      console.log('【加载成功】【retry】',src);
    }else{
      console.log('【加载成功】',src);
    }
  }
}
</script>
`;
  }

  getRetryUrl(src) {
    let { retryPublicPath } = this.options;

    if (retryPublicPath) {
      retryPublicPath += '/';
      retryPublicPath = retryPublicPath.replace(/\/\/$/, '/');
    }

    const value = src.replace(this.hwpPublicPath, '').replace(/^\//, '');
    return retryPublicPath + value;
  }

  registerHwpHooks(compilation) {
    // HtmlWebpackPlugin >= 4
    const hooks = HtmlWebpackPlugin.getHooks(compilation);
    hooks.beforeAssetTagGeneration.tapAsync('retry', (pluginArgs, callback) => {
      this.hwpPublicPath = pluginArgs.assets.publicPath;
      console.log('​registerHwpHooks -> this.hwpPublicPath', this.hwpPublicPath);
      callback(null, pluginArgs);
    });

    hooks.alterAssetTags.tap('retry', ({ assetTags }) => {
      const code = '__retryPlugin.call(this,event)';
      assetTags.styles.map(tag => {
        tag.attributes.onerror = code;
        tag.attributes.onload = code;
      });
      assetTags.scripts.map(tag => {
        tag.attributes.onerror = code;
        tag.attributes.onload = code;
      });
    });
    hooks.beforeEmit.tapAsync('retry', (pluginArgs, callback) => {
      let { html } = pluginArgs;
      html = html.replace('<head>', `<head>${this.genReportCode()}`);
      const scripts = attrParse(html).filter(tag => tag.name === SCRIPT);

      scripts.reverse();
      html = [html];
      scripts.forEach(tag => {
        const { attrs } = tag;
        let url = '';
        attrs.map(attr => {
          if (attr.name === 'src') {
            attr.value = this.getRetryUrl(attr.value);
            url = attr.value;
          }
        });

        let code = '';

        if (url) {
          const filename = path.basename(url);
          const script = `\\x3Cscript type="text/javascript" ${attrs
            .map(i => `${i.name}="${i.value}"`)
            .join(' ')} retry>\\x3C/script>`;
          code = `<script>if(!__JS_RETRY__["${filename}"]){document.write('${script}');}</script>`;
        } else {
          throw Error('not found url');
        }

        const x = html.pop();
        html.push(x.substr(tag.end));
        html.push(code);
        html.push(x.substr(0, tag.end));
      });
      html.reverse();
      html = html.join('');

      pluginArgs.html = html;
      callback(null, pluginArgs);
    });
  }

  apply(compiler) {
    const { options } = this;
    const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, options);

    compiler.hooks.compilation.tap('retryPluginHtmlWebpackPluginHooks', this.registerHwpHooks.bind(this));
    compiler.hooks.compilation.tap('retryPlugin', compilation => {
      compilation.hooks.optimizeChunkAssets.tap('retryPlugin', chunks => {
        for (const chunk of chunks) {
          if (options.entryOnly && !chunk.canBeInitial()) {
            continue;
          }
          for (const file of chunk.files) {
            if (!matchObject(file)) {
              continue;
            }

            let basename;
            let filename = file;

            const querySplit = filename.indexOf('?');

            if (querySplit >= 0) {
              filename = filename.substr(0, querySplit);
            }

            const lastSlashIndex = filename.lastIndexOf('/');

            if (lastSlashIndex === -1) {
              basename = filename;
            } else {
              basename = filename.substr(lastSlashIndex + 1);
            }

            // 只有js需要标记
            if (!/.js$/.test(filename)) {
              continue;
            }
            const code = `var ${varName}=${varName}||{};\n${varName}["${basename}"]=true;`;

            compilation.assets[file] = new ConcatSource(code, '\n', compilation.assets[file]);
          }
        }
      });
    });
  }
}

module.exports = RetryPlugin;
