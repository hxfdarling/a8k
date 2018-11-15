const fs = require('fs-extra');
const webpack = require('webpack');
const Service = require('../Service');

// const { logWithSpinner, stopSpinner } = require('../utils/spinner');
const { done } = require('../utils/logger');
const { PROD } = require('../const');

process.env.NODE_ENV = PROD;
class Build extends Service {
  async build() {
    await new Promise(resolve => {
      this.hooks.beforeBuild.callAsync(this, resolve);
    });
    fs.emptyDirSync(this.options.distDir);
    await new Promise(resolve => {
      webpack(this.webpackConfig, (err, stats) => {
        // stopSpinner(false);
        if (err) {
          console.log(err);
          process.exit(1);
        }
        if (stats.hasErrors()) {
          process.exit(1);
        }

        done('Build complete.');
        resolve();
      });
    });

    await new Promise(resolve => {
      this.hooks.afterBuild.callAsync(this, async () => {
        resolve();
      });
    });
  }
}
module.exports = (dir, options) => {
  options.type = PROD;
  new Build(dir, options).build();
};
