const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const Service = require('../service');
const getServerConfig = require('../webpack/devServer.config');

const { info } = require('../utils/logger');
const { DEV } = require('../const');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8080;

process.env.NODE_ENV = DEV;
class DevServer extends Service {
  constructor(dir, options) {
    super(dir, options);

    this.host = options.host || DEFAULT_HOST;
    this.port = options.port || DEFAULT_PORT;
  }

  async start() {
    await new Promise(resolve => {
      this.hooks.beforeDev.callAsync(this, resolve);
    });

    await new Promise(resolve => {
      const compiler = webpack(this.webpackConfig);
      const devServer = new WebpackDevServer(compiler, getServerConfig());
      // Launch WebpackDevServer.
      devServer.listen(this.port, this.host, err => {
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
        console.log(chalk.green(`http://${this.host}:${this.port}`));
        resolve();
      });
    });
  }
}

module.exports = (dir, options) => {
  return new DevServer(dir, options).start();
};
