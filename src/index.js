const shell = require('shelljs');
const { AsyncSeriesWaterfallHook } = require('tapable');

const buildInPlugins = require('./plugins');

class Imt {
  constructor(options = {}) {
    this.initHooks();
    this.options = options;
    let { proxy, defaultProxy } = options.parent;
    if (defaultProxy) {
      proxy = 'http://web-proxy.tencent.com:8080';
    }
    if (proxy) {
      const cmd = require('os').platform() === 'win32' ? 'set' : 'export';
      shell.exec(`${cmd} http_proxy=${proxy};${cmd} https_proxy=${proxy};`);
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
