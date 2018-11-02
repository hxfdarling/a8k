const shell = require('shelljs');
const path = require('path');
const { AsyncSeriesWaterfallHook } = require('tapable');

const defaultPlugins = [
  {
    /**
     *
     *
     * @param {Imt} imt
     */
    apply() {},
  },
];
class Imt {
  constructor(options = {}) {
    this.clidir = path.resolve(__dirname, '../');
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
    this.plugins = [...defaultPlugins, ...(options.plugins || [])];
    this.plugins.forEach(plugin => {
      plugin.apply(this);
    });
  }

  initHooks() {
    this.hooks = {
      beforeCreate: new AsyncSeriesWaterfallHook(['options']),
      afterCreate: new AsyncSeriesWaterfallHook(['options']),
    };
  }
}
module.exports = Imt;
