const shell = require('shelljs');

const { AsyncSeriesWaterfallHook } = require('tapable');

const defaultPlugins = [
  {
    /**
     *
     *
     * @param {Imt} imt
     */
    apply(imt) {
      imt.hooks.beforeCreate.tapPromise('tset', async () => {
        console.log('xx');
      });
    },
  },
];
class Imt {
  constructor(options = {}) {
    this.initHooks();

    this.proxy = options.proxy;
    if (this.proxy) {
      shell.exec(`export http_proxy=${this.proxy};export https_proxy=${this.proxy};`);
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
