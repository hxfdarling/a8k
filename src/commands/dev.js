const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk').default;
const Service = require('../service');

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
    const {
      options,
      imtrc: { devServer = {} },
    } = this;
    this.host = options.host || devServer.host || DEFAULT_HOST;
    this.port = options.port || devServer.port || DEFAULT_PORT;
    this.https = options.https || devServer.https || false;
  }

  getServerConfig() {
    return {
      // Enable gzip compression of generated files.
      compress: true,
      hot: true,
      quiet: true,
      https: this.https,
      // clientLogLevel: 'none',
      historyApiFallback: {
        disableDotRule: true,
      },
      // before(app, server) {
      //   console.log('-----');
      // },
    };
  }

  async start() {
    await new Promise(resolve => {
      this.hooks.beforeDev.callAsync(this, resolve);
    });

    await new Promise(resolve => {
      this.webpackConfig.entry = prependEntry(this.webpackConfig.entry);
      try {
        const compiler = webpack(this.webpackConfig);
        const devServer = new WebpackDevServer(compiler, this.getServerConfig());
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
        // console.log(chalk.green(`http://${this.host}:${this.port}`));
        resolve();
      });
    });
  }
}

module.exports = (dir, options) => {
  process.env.IMT_SOURCE_MAP = true;
  return new DevServer(dir, options).start();
};
