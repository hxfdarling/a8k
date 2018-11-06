const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const Service = require('../service');

const { DEV } = require('../const');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8080;
process.env.NODE_ENV = DEV;
class DevServer extends Service {
  _init() {
    const { options } = this;
    this.host = options.host || DEFAULT_HOST;
    this.port = options.port || DEFAULT_PORT;
    this.https = options.https || false;
  }

  getServerConfig() {
    return {
      // Enable gzip compression of generated files.
      compress: true,
      hot: true,
      quiet: true,
      https: this.https,
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
      const compiler = webpack(this.webpackConfig);
      const devServer = new WebpackDevServer(compiler, this.getServerConfig());
      // Launch WebpackDevServer.
      devServer.listen(this.port, this.host, err => {
        if (err) {
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
