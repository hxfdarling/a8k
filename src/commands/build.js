const fs = require('fs-extra');
const webpack = require('webpack');
const chalk = require('chalk').default;
const Imt = require('../index.js');
const { info, error } = require('../utils/logger');
const { PROD } = require('../const');
const getOptions = require('../utils/getOptions');
const getWebpackConfig = require('../config/webpack/index.js');
const { logWithSpinner, stopSpinner } = require('../utils/spinner');

process.env.NODE_ENV = PROD;

module.exports = async argv => {
  info('start building.');

  const start = Date.now();
  const options = getOptions(argv);
  options.type = PROD;

  const imt = new Imt(options);

  await new Promise(resolve => {
    imt.hooks.beforeBuild.callAsync(imt, resolve);
  });
  logWithSpinner('clean dist dir.');
  stopSpinner();

  fs.emptyDirSync(options.distDir);
  // logWithSpinner('webpack completing.');
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
  logWithSpinner(chalk.green(`Build complete in ${parseInt((Date.now() - start) / 1000, 10)}s`));
  stopSpinner();
};
