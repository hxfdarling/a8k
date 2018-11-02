const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const { AsyncSeriesWaterfallHook } = require('tapable');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const getServerConfig = require('./webpack/devServer.config');

const getConfig = require('./webpack');
const { logWithSpinner, stopSpinner } = require('./utils/spinner');
const { done, info } = require('./utils/logger');
const Imt = require('.');

const host = process.env.HOST || '127.0.0.1';

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
    if (options.dist) {
      this.distDir = path.join(this.projectDir, options.dist);
    }
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
      beforeDev: new AsyncSeriesWaterfallHook(['context']),
      afterDev: new AsyncSeriesWaterfallHook(['context']),
    };
  }

  async dev() {
    const { port } = this.options;
    await new Promise(resolve => {
      this.hooks.beforeDev.callAsync(this, resolve);
    });

    await new Promise(resolve => {
      const compiler = webpack(this.webpackConfig);
      const devServer = new WebpackDevServer(compiler, getServerConfig());
      // Launch WebpackDevServer.
      devServer.listen(port, host, err => {
        if (err) {
          process.exit(1);
        }
        resolve();
      });

      info('Starting the development server...\n');

      ['SIGINT', 'SIGTERM'].forEach(sig => {
        process.on(sig, () => {
          devServer.close();
          process.exit();
        });
      });
    });

    await new Promise(resolve => {
      this.hooks.afterDev.callAsync(this, async () => {
        console.log(chalk.green(`http://${host}:${port}`));
        resolve();
      });
    });
  }

  async build() {
    logWithSpinner(`building ${this.env}`);

    await new Promise(resolve => {
      this.hooks.beforeBuild.callAsync(this, resolve);
    });
    fs.emptyDirSync(this.distDir);
    await new Promise((resolve, reject) => {
      webpack(this.webpackConfig, (err, stats) => {
        stopSpinner(false);
        console.log(
          stats.toString({
            colors: true,
          })
        );

        if (err) {
          return reject(err);
        }
        if (stats.hasErrors()) {
          return reject(new Error('Build failed with errors.'));
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

module.exports = ImtBuild;
