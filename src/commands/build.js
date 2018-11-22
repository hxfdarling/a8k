const fs = require('fs-extra');
const webpack = require('webpack');
const path = require('path');
const prettyMs = require('pretty-ms');
const chalk = require('chalk').default;
const Imt = require('../index.js');
const { error } = require('../utils/logger');
const { PROD, SSR } = require('../const');
const getOptions = require('../utils/getOptions');
const getWebpackConfig = require('../config/webpack/index.js');
const { logWithSpinner, stopSpinner } = require('../utils/spinner');

process.env.NODE_ENV = PROD;
async function buildSSR(options, imt) {
  logWithSpinner('ssr building');
  if (!options.silent) {
    stopSpinner();
  }
  const start = Date.now();
  options.type = SSR;
  options.ssrConfig = Object.assign(
    {
      // js存放地址
      distDir: './node_modules/components',
      // html存放地址
      viewDir: './app/views',
    },
    options.ssrConfig
  );
  const { ssrConfig, projectDir } = options;
  ssrConfig.distDir = path.resolve(projectDir, ssrConfig.distDir);
  ssrConfig.viewDir = path.resolve(projectDir, ssrConfig.viewDir);
  const { hooks } = imt;

  await new Promise(resolve => {
    hooks.beforeSSRBuild.callAsync(imt, resolve);
  });
  fs.emptyDirSync(ssrConfig.distDir);
  fs.emptyDirSync(ssrConfig.viewDir);
  await new Promise(resolve => {
    const webpackConfig = getWebpackConfig(options);
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      if (stats.hasErrors()) {
        process.exit(1);
      }

      resolve();
    });
  });

  await new Promise(resolve => {
    hooks.afterSSRBuild.callAsync(imt, async () => {
      resolve();
    });
  });
  stopSpinner();
  console.log(chalk.green.bold(`Built successfully in ${prettyMs(Date.now() - start)}!`));
}

module.exports = async argv => {
  const start = Date.now();
  const options = getOptions(argv);
  options.type = PROD;
  const imt = new Imt(options);
  const { silent } = options;
  if (silent) {
    process.noDeprecation = true;
  }
  await new Promise(resolve => {
    imt.hooks.beforeBuild.callAsync(imt, resolve);
  });
  logWithSpinner('clean dist dir.');
  if (!silent) {
    stopSpinner();
  }

  fs.emptyDirSync(options.distDir);
  if (silent) {
    logWithSpinner('completing.');
  }
  await new Promise(resolve => {
    const webpackConfig = getWebpackConfig(options);
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        error(err);
        process.exit(1);
      }
      if (stats.hasErrors()) {
        process.exit(1);
      }
      resolve();
    });
  });

  await new Promise(resolve => {
    imt.hooks.afterBuild.callAsync(imt, async () => {
      resolve();
    });
  });
  stopSpinner();
  console.log(chalk.green.bold(`Built successfully in ${prettyMs(Date.now() - start)}!`));

  if (options.ssrConfig) {
    await buildSSR(options, imt);
  }
};
