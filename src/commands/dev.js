const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk').default;
const Imt = require('../index.js');

const { DEV } = require('../const');
const getOptions = require('../utils/getOptions');
const getWebpackConfig = require('../config/webpack');
const { info, error } = require('../utils/logger');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8080;
process.env.NODE_ENV = DEV;

const prependEntry = entry => {
  const entries = [require.resolve('../utils/webpackHotDevClient')];
  if (typeof entry === 'function') {
    return () => Promise.resolve(entry()).then(prependEntry);
  }

  if (typeof entry === 'object' && !Array.isArray(entry)) {
    const clone = {};

    Object.keys(entry).forEach(key => {
      clone[key] = entries.concat(entry[key]);
    });

    return clone;
  }

  return entries.concat(entry);
};

function getServerConfig(options) {
  const { devServer } = options;
  return {
    // Enable gzip compression of generated files.
    compress: true,
    hot: true,
    quiet: true,
    host: options.host || DEFAULT_HOST,
    port: options.port || DEFAULT_PORT,
    https: options.https || false,
    historyApiFallback: {
      disableDotRule: true,
    },
    ...devServer,
  };
}

module.exports = async argv => {
  info('starting dev server.');
  const options = getOptions(argv);
  options.type = DEV;
  options.devServer = getServerConfig(options);

  const imt = new Imt(options);
  const { hooks } = imt;

  await new Promise(resolve => {
    hooks.beforeDev.callAsync(imt, resolve);
  });
  await new Promise(resolve => {
    try {
      const webpackConfig = getWebpackConfig(options);
      webpackConfig.entry = prependEntry(webpackConfig.entry);
      const compiler = webpack(webpackConfig);
      const { devServer } = options;
      const server = new WebpackDevServer(compiler, devServer);
      // Launch WebpackDevServer.
      server.listen(devServer.port, devServer.host, err => {
        if (err) {
          error(err);
          process.exit(1);
        }
        resolve();
      });

      ['SIGINT', 'SIGTERM'].forEach(sig => {
        process.on(sig, () => {
          server.close();
          process.exit();
        });
      });
    } catch (err) {
      info(chalk.red('Failed to compile.'));
      error(err.message || err);
      process.exit(1);
    }
  });

  await new Promise(resolve => {
    hooks.afterDev.callAsync(imt, async () => {
      resolve();
    });
  });
  // done('dev server started.');
  // info('building...');
};
