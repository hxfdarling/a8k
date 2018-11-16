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
  getServerConfig() {
    const {
      options,
      imtrc: { devServer = {} },
    } = this;

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

  async start() {
    await new Promise(resolve => {
      this.hooks.beforeDev.callAsync(this, resolve);
    });
    await new Promise(resolve => {
      try {
        this.webpackConfig.entry = prependEntry(this.webpackConfig.entry);
        const compiler = webpack(this.webpackConfig);
        const { devServer } = this.options;
        const server = new WebpackDevServer(compiler, devServer);
        // Launch WebpackDevServer.
        server.listen(devServer.port, devServer.host, err => {
          if (err) {
            console.error(err);
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
  options.type = DEV;
  return new DevServer(dir, options).start();
};
