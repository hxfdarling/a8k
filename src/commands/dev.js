const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk').default;
const Service = require('../Service');

const { DEV } = require('../const');

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

class DevServer extends Service {
  _init() {
    this.devServer = this.getServerConfig();
  }

  getServerConfig() {
    const {
      options,
      imtrc: { devServer = {} },
    } = this;
    const host = options.host || DEFAULT_HOST;
    const port = options.port || DEFAULT_PORT;
    const https = options.https || false;
    return {
      // Enable gzip compression of generated files.
      compress: true,
      hot: true,
      quiet: true,
      host,
      port,
      https,
      historyApiFallback: {
        disableDotRule: true,
      },
      ...devServer,
    };
  }

  async start() {
    await new Promise(resolve => {
      this.hooks.beforeDev.callAsync(this, resolve);
    });
    await new Promise(resolve => {
      try {
        this.webpackConfig.entry = prependEntry(this.webpackConfig.entry);
        const compiler = webpack(this.webpackConfig);
        const devServer = new WebpackDevServer(compiler, this.devServer);
        // Launch WebpackDevServer.
        devServer.listen(this.port, this.host, err => {
          if (err) {
            console.error(err);
            process.exit(1);
          }
          resolve();
        });

        ['SIGINT', 'SIGTERM'].forEach(sig => {
          process.on(sig, () => {
            devServer.close();
            process.exit();
          });
        });
      } catch (err) {
        console.log(chalk.red('Failed to compile.'));
        console.log();
        console.log(err.message || err);
        console.log();
        process.exit(1);
      }
    });

    await new Promise(resolve => {
      this.hooks.afterDev.callAsync(this, async () => {
        resolve();
      });
    });
  }
}

module.exports = (dir, options) => {
  process.env.IMT_SOURCE_MAP = true;
  return new DevServer(dir, options).start();
};
