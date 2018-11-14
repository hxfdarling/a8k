/* eslint-disable no-continue,no-restricted-syntax */
const { ConcatSource } = require('webpack-sources');
const { ModuleFilenameHelpers } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const attrParse = require('./attributesParser');
const { SCRIPT } = require('./const');
const MainTemplatePlugin = require('./mainTemplatePlugin');

const varName = '__JS_RETRY__';

/**
 * @typedef {Object} PluginOptions
 * @property {String} retryPublicPath 重试加载地址，例如://fudao.qq.com/pc
 * @property {Boolean?} entryOnly default false
 * @property {String|RegExp|Array?} test
 * @property {String|RegExp|Array?} include
 * @property {String|RegExp|Array?} exclude
 * @property {String|Number} JS_SUCC_MSID JS成功
 * @property {String|Number} JS_FAIL_MSID JS失败
 * @property {String|Number} CSS_SUCC_MSID CSS成功
 * @property {String|Number} CSS_FAIL_MSID CSS失败
 * @property {String|Number} JS_RETRY_SUCC_MSID JS重试成功
 * @property {String|Number} JS_RETRY_FAIL_MSID JS重试失败
 * @property {String|Number} CSS_RETRY_SUCC_MSID CSS重试成功
 * @property {String|Number} CSS_RETRY_FAIL_MSID CSS重试失败
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
    this.options = Object.assign(
      {
        JS_SUCC_MSID: '',
        JS_FAIL_MSID: '',
        CSS_SUCC_MSID: '',
        CSS_FAIL_MSID: '',

        JS_RETRY_SUCC_MSID: '',
        JS_RETRY_FAIL_MSID: '',
        CSS_RETRY_SUCC_MSID: '',
        CSS_RETRY_FAIL_MSID: '',
      },
      options
    );
  }

  genBadJsCode() {
    const {
      JS_SUCC_MSID = '',
      JS_FAIL_MSID = '',
      CSS_SUCC_MSID = '',
      CSS_FAIL_MSID = '',

      JS_RETRY_SUCC_MSID = '',
      JS_RETRY_FAIL_MSID = '',
      CSS_RETRY_SUCC_MSID = '',
      CSS_RETRY_FAIL_MSID = '',
    } = this.options;
    return `
  var JS_SUCC_MSID = "${JS_SUCC_MSID}";
  var JS_FAIL_MSID = "${JS_FAIL_MSID}";
  var CSS_SUCC_MSID = "${CSS_SUCC_MSID}";
  var CSS_FAIL_MSID = "${CSS_FAIL_MSID}"

  var JS_RETRY_SUCC_MSID = "${JS_RETRY_SUCC_MSID}";
  var JS_RETRY_FAIL_MSID = "${JS_RETRY_FAIL_MSID}";
  var CSS_RETRY_SUCC_MSID = "${CSS_RETRY_SUCC_MSID}";
  var CSS_RETRY_FAIL_MSID = "${CSS_RETRY_FAIL_MSID}";

  var BADJS_LEVEL = ${this.options.badjsLevel || 2};

  var report = function(data){
    console.log(data);
    setTimeout(function(){
      window.BJ_REPORT&&window.BJ_REPORT.report(data)
    },2000);
  }
`;
  }

  genRetryCode(jsComplete = '') {
    return `
  ${this.genBadJsCode()}

  var isRetry = this.hasAttribute('retry');
  // 只有异步的js走这个重试逻辑，同步的都是采用document.write
  var isAsync = this.hasAttribute('isAsync');
  var isStyle = this.tagName==='LINK';
  var isError = event.type==='error'||event.type==='timeout';
  var src = this.href||this.src;

  var retryPublicPath  = "${this.options.retryPublicPath}";
  var hwpPublicPath = "${this.publicPath}";

  if(retryPublicPath){
    retryPublicPath += '/';
    retryPublicPath = retryPublicPath.replace(/\\/\\/$/, '/');
  }
  var newSrc = retryPublicPath + src.replace(hwpPublicPath, '').replace(/^\\//, '');

  if(isError){
    if(isRetry){
      report({
        level: BADJS_LEVEL||2,
        msg: this.tagName + ' retry load fail: ' + src,
        ext: {
          msid: isStyle?CSS_RETRY_FAIL_MSID:JS_RETRY_FAIL_MSID,
        },
      });
    }else{
      if(isStyle){
        // link style 重新加载
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href= newSrc;
        link.setAttribute('retry','');
        this.parentNode.insertBefore(link,this.nextSibling);
      }else if(isAsync){
        // js 重新加载
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
      
        script.charset = 'utf-8';
        script.timeout = 120;
        script.src = newSrc;
        if (script.src.indexOf(window.location.origin + '/') !== 0) {
          script.crossOrigin = 'anonymous';
        }
        var _timeout_ = setTimeout(function() {
          script.onerror({ type: 'timeout', target: script });
        }, 120000);
        script.onerror = function(event){
          script.onerror = script.onload = null;
          clearTimeout(_timeout_);
          ${jsComplete}
          report({
            level: BADJS_LEVEL||2,
            msg: this.tagName + ' retry load fail: ' + this.src,
            ext: {
              msid: JS_RETRY_SUCC_MSID,
            },
          });
        }
        script.onload = function(event){
          script.onerror = script.onload = null;
          clearTimeout(_timeout_);
          ${jsComplete}
          report({
            level: BADJS_LEVEL||2,
            msg: this.tagName + ' retry load success: ' + this.src,
            ext: {
              msid: JS_SUCC_MSID,
            },
          });
        }
        head.appendChild(script);
      }
      report({
        level: BADJS_LEVEL||2,
        msg: this.tagName + ' load fail: ' + src,
        ext: {
          msid: isStyle?CSS_FAIL_MSID:JS_FAIL_MSID,
        },
      });
    }
  }else{
    if(isRetry){
      report({
        level: BADJS_LEVEL||2,
        msg: this.tagName + ' load fail: ' + src,
        ext: {
          msid: isStyle?CSS_RETRY_SUCC_MSID:JS_RETRY_SUCC_MSID,
        },
      });
    }else{
      report({
        level: BADJS_LEVEL||2,
        msg: this.tagName + ' load success: ' + src,
        ext: {
          msid: isStyle?CSS_SUCC_MSID:JS_SUCC_MSID,
        },
      });
    }
  }
`;
  }

  genReportCode() {
    return `
<script>
var ${varName}={};
function __retryPlugin(event){
${this.genRetryCode()}
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

    const value = src.replace(this.publicPath, '').replace(/^\//, '');
    return retryPublicPath + value;
  }

  registerHwpHooks(compilation) {
    // HtmlWebpackPlugin >= 4
    const hooks = HtmlWebpackPlugin.getHooks(compilation);
    hooks.beforeAssetTagGeneration.tapAsync('retry', (pluginArgs, callback) => {
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

  registerMTP(compiler, compilation) {
    const plugin = new MainTemplatePlugin(this, compilation);
    if (plugin.apply) {
      plugin.apply(compilation.mainTemplate);
    } else {
      compilation.mainTemplate.apply(plugin);
    }
  }

  apply(compiler) {
    const { options } = this;
    this.publicPath = compiler.options.output.publicPath;
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
    // eslint-disable-next-line
    compiler.hooks.afterPlugins.tap('retryPlugin', compiler => {
      compiler.hooks.thisCompilation.tap('retryPlugin', this.registerMTP.bind(this, compiler));
    });
  }
}

module.exports = RetryPlugin;
