const fs = require('fs-extra');
const webpack = require('webpack');
const path = require('path');
const Imt = require('../index.js');
const getOptions = require('../utils/getOptions');
const getWebpackConfig = require('../config/webpack');

const { logWithSpinner, stopSpinner } = require('../utils/spinner');
const { error } = require('../utils/logger');
const { PROD, SSR } = require('../const');

process.env.NODE_ENV = PROD;
module.exports = async argv => {
  logWithSpinner('ssr building.');
  const start = Date.now();
  const options = getOptions(argv);
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

  if (!ssrConfig.entry || !Object.keys(ssrConfig.entry).length) {
    error('not found ssrConfig.entry in .imtrc.js');
    process.exit(1);
  }

  const imt = new Imt(options);
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
  logWithSpinner(`ssr build complete in ${parseInt(Date.now() - start, 10) / 1000}s.`);
  stopSpinner();
};
