const fs = require('fs-extra');
const webpack = require('webpack');
const chalk = require('chalk').default;
const ora = require('ora');
const Imt = require('../index.js');
const { info, error } = require('../utils/logger');
const { PROD } = require('../const');
const getOptions = require('../utils/getOptions');
const getWebpackConfig = require('../config/webpack/index.js');

process.env.NODE_ENV = PROD;

module.exports = async argv => {
  info('start building.');
  const spinner = ora('building').start();
  const start = Date.now();
  const options = getOptions(argv);
  options.type = PROD;

  const imt = new Imt(options);

  await new Promise(resolve => {
    imt.hooks.beforeBuild.callAsync(imt, resolve);
  });
  spinner.info('clean dist dir.');
  spinner.start();
  fs.emptyDirSync(options.distDir);
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
  spinner.succeed(chalk.green(`Build complete in ${parseInt((Date.now() - start) / 1000, 10)}s`));
};
