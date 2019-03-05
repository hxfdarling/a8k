import fs from 'fs-extra';
import webpack from 'webpack';

import { logWithSpinner, stopSpinner } from '@onepack/cli-utils/spinner';
import getWebpackConfig from '../config/webpack/index.js';
import { DEV, PROD, SSR } from '../const';
import Imt from '../index.js';
import getOptions from '../utils/load-config';
import { error, info } from '../utils/logger';

process.env.NODE_ENV = PROD;
async function buildSSR(options, imt) {
  info('build ssr');

  options.type = SSR;

  const { hooks } = imt;

  await new Promise(resolve => {
    hooks.beforeSSRBuild.callAsync(imt, resolve);
  });
  fs.emptyDirSync(options.ssrConfig.dist);
  fs.emptyDirSync(options.ssrConfig.view);
  logWithSpinner('clean ssr dist dir.');
  stopSpinner();
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
}

export default async argv => {
  info('build frontend');
  const options = getOptions(argv);
  if (options.dev) {
    process.env.NODE_ENV = DEV;
  }
  options.type = PROD;
  const imt = new Imt(options);
  const { silent } = options;
  if (silent) {
    process.noDeprecation = true;
  }
  await new Promise(resolve => {
    imt.hooks.beforeBuild.callAsync(imt, resolve);
  });
  logWithSpinner('clean frontend dist dir.');
  stopSpinner();

  fs.emptyDirSync(options.dist);
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

  if (options.ssrConfig) {
    await buildSSR(options, imt);
  }
};
