const shell = require('shelljs');
const { AsyncSeriesWaterfallHook } = require('tapable');

const buildInPlugins = require('./plugins');

class Imt {
  constructor(options = {}) {
    this.initHooks();
    this.options = options;
    this.proxy = options.proxy;
    if (this.proxy) {
      shell.exec(`export http_proxy=${this.proxy};export https_proxy=${this.proxy};`);
    }
    if (options.defaultProxy) {
      shell.exec(
        'export http_proxy=http://web-proxy.tencent.com:8080;export https_proxy=http://web-proxy.tencent.com:8080;'
      );
    }
    this.plugins = [...buildInPlugins, ...(options.plugins || [])];
    this.plugins.forEach(plugin => {
      plugin.apply(this);
    });
  }

  initHooks() {
    this.hooks = {
      beforeCreate: new AsyncSeriesWaterfallHook(['context']),
      afterCreate: new AsyncSeriesWaterfallHook(['context']),
      beforeDev: new AsyncSeriesWaterfallHook(['context']),
      afterDev: new AsyncSeriesWaterfallHook(['context']),
      beforeBuild: new AsyncSeriesWaterfallHook(['context']),
      afterBuild: new AsyncSeriesWaterfallHook(['context']),
      beforeSSRBuild: new AsyncSeriesWaterfallHook(['context']),
      afterSSRBuild: new AsyncSeriesWaterfallHook(['context']),
    };
  }
}
module.exports = Imt;
