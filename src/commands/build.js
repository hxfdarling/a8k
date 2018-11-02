const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const { AsyncSeriesWaterfallHook } = require('tapable');
const webpack = require('webpack');

const getConfig = require('../webpack');
const { logWithSpinner, stopSpinner } = require('../utils/spinner');
const { done } = require('../utils/logger');
const Imt = require('../');

const cwd = process.cwd();
class ImtBuild extends Imt {
  constructor(dir, options) {
    super(options);

    if (!dir) {
      dir = cwd;
    } else {
      dir = path.join(cwd, dir);
    }

    this.projectDir = dir;
    this.projectName = path.basename(dir);
    this.distDir = options.dist;
    this.env = options.env || 'production'; // 默认模式
    process.env.NODE_ENV = this.env;
    this.imtConfig = require(path.join(dir, 'package.json')).imt || { mode: 'single' };
    try {
      this.imtrc = require(path.join(dir, '.imtrc.js'));
    } catch (e) {
      this.imtrc = {};
      console.log(chalk.warn('项目目录找不到`.imrc.js`配置文件，将使用默认构建配置'));
    }
    this.webpackConfig = getConfig(this.env, this);
  }

  initHooks() {
    this.hooks = {
      beforeBuild: new AsyncSeriesWaterfallHook(['context']),
      afterBuild: new AsyncSeriesWaterfallHook(['context']),
    };
  }

  async build() {
    logWithSpinner(`building ${this.env}`);

    await new Promise(resolve => {
      this.hooks.beforeBuild.callAsync(this, resolve);
    });
    fs.emptyDirSync(this.distDir);
    console.log(this.webpackConfig);
    await new Promise((resolve, reject) => {
      webpack(this.webpackConfig, (err, stats) => {
        stopSpinner(false);
        const info = stats.toString({
          colors: true,
        });
        console.log(info);

        if (err) {
          return reject(err);
        }
        if (stats.hasErrors()) {
          return reject(new Error('Build failed with errors.'));
        }

        done('Build complete. Watching for changes...');
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

module.exports = (...args) => {
  return new ImtBuild(...args).build();
};
