const fs = require('fs-extra');
const webpack = require('webpack');
const path = require('path');
const Service = require('../Service');

// const { logWithSpinner, stopSpinner } = require('../utils/spinner');
const { done } = require('../utils/logger');
const { PROD, SSR } = require('../const');

process.env.NODE_ENV = PROD;
class Build extends Service {
  init() {
    this.options.ssrConfig = Object.assign(
      {
        // js存放地址
        distDir: './node_modules/components',
        // html存放地址
        viewDir: './app/views',
      },
      this.options.ssrConfig
    );
    const { ssrConfig, projectDir } = this.options;
    ssrConfig.distDir = path.resolve(projectDir, ssrConfig.distDir);
    ssrConfig.viewDir = path.resolve(projectDir, ssrConfig.viewDir);
  }

  async build() {
    const { ssrConfig } = this.options;
    await new Promise(resolve => {
      this.hooks.beforeSSRBuild.callAsync(this, resolve);
    });
    fs.emptyDirSync(ssrConfig.distDir);
    fs.emptyDirSync(ssrConfig.viewDir);
    await new Promise(resolve => {
      webpack(this.webpackConfig, (err, stats) => {
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
      this.hooks.afterSSRBuild.callAsync(this, async () => {
        resolve();
      });
    });
  }
}
module.exports = (dir, options) => {
  options.type = SSR;
  new Build(dir, options).build();
};
