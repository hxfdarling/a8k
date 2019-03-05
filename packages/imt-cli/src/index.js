const { AsyncSeriesWaterfallHook } = require('tapable');

const buildInPlugins = require('./plugins');

class Imt {
  constructor(options = {}) {
    this.initHooks();
    this.options = options;
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
      beforeTest: new AsyncSeriesWaterfallHook(['context']),
      afterTest: new AsyncSeriesWaterfallHook(['context']),
      beforeRelease: new AsyncSeriesWaterfallHook(['context']),
      afterRelease: new AsyncSeriesWaterfallHook(['context']),
    };
  }
}
module.exports = Imt;
