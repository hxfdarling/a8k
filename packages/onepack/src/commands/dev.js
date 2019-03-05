const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk').default;
const httpProxyMiddleware = require('http-proxy-middleware');

const getIp = require('internal-ip');
const os = require('os');
const prettyMs = require('pretty-ms');

const { clearConsole } = require('../utils/logger');
const formatWebpackMessages = require('../utils/formatWebpackMessages');
const Imt = require('../index.js');

const { DEV, SSR } = require('../const');
const getOptions = require('../utils/load-config');
const getWebpackConfig = require('../config/webpack');
const { info, error } = require('../utils/logger');

const DEFAULT_HOST = '0.0.0.0';

const DEFAULT_PORT = 8080;
process.env.NODE_ENV = DEV;

const isInteractive = process.stdout.isTTY;

async function printInstructions(devServer) {
  const { host, port, https } = devServer;
  const protocol = https ? 'https://' : 'http://';
  const isAnyHost = host === '0.0.0.0';

  console.log();

  // eslint-disable-next-line max-len
  const getLocalAddress = color => `${protocol}${isAnyHost ? 'localhost' : host}:${color ? chalk.bold(port) : port}`;
  console.log(`  ${chalk.green('Local:')}            ${getLocalAddress(true)}`);

  const ip = await getIp.v4();
  if (ip) {
    console.log(`  ${chalk.green('On Your Network:')}  ${protocol}${ip}:${port}`);
  }
  console.log();
}

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
function setProxy(app, proxy) {
  if (!Array.isArray(proxy)) {
    proxy = Object.keys(proxy).map(context => {
      let proxyOptions;
      // For backwards compatibility reasons.
      const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

      if (typeof proxy[context] === 'string') {
        proxyOptions = {
          context: correctedContext,
          target: proxy[context],
        };
      } else {
        proxyOptions = Object.assign({}, proxy[context]);
        proxyOptions.context = correctedContext;
      }

      proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

      return proxyOptions;
    });
  }

  const getProxyMiddleware = proxyConfig => {
    const context = proxyConfig.context || proxyConfig.path;
    // It is possible to use the `bypass` method without a `target`.
    // However, the proxy middleware has no use in this case, and will fail to instantiate.
    if (proxyConfig.target) {
      return httpProxyMiddleware(context, proxyConfig);
    }
  };
  proxy.forEach(proxyConfigOrCallback => {
    let proxyConfig;
    let proxyMiddleware;

    if (typeof proxyConfigOrCallback === 'function') {
      proxyConfig = proxyConfigOrCallback();
    } else {
      proxyConfig = proxyConfigOrCallback;
    }

    proxyMiddleware = getProxyMiddleware(proxyConfig);

    app.use((req, res, next) => {
      if (typeof proxyConfigOrCallback === 'function') {
        const newProxyConfig = proxyConfigOrCallback();

        if (newProxyConfig !== proxyConfig) {
          proxyConfig = newProxyConfig;
          proxyMiddleware = getProxyMiddleware(proxyConfig);
        }
      }

      const bypass = typeof proxyConfig.bypass === 'function';

      const bypassUrl = (bypass && proxyConfig.bypass(req, res, proxyConfig)) || false;

      if (bypassUrl) {
        req.url = bypassUrl;

        next();
      } else if (proxyMiddleware) {
        return proxyMiddleware(req, res, next);
      } else {
        next();
      }
    });
  });
}
function getServerConfig(options) {
  const { devServer, ssrDevServer } = options;
  const { host, port, ...reset } = devServer;
  const config = {
    host: options.host || host || DEFAULT_HOST,
    port: options.port || port || DEFAULT_PORT,
    https: options.https || false,
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
    quiet: true,
    overlay: false,
    headers: {
      'access-control-allow-origin': '*',
    },
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      disableDotRule: true,
    },
    ...reset,
  };
  if (options.ssr) {
    // eslint-disable-next-line no-shadow
    const { contentBase, https, port, host = DEFAULT_HOST } = ssrDevServer;
    if (!port) {
      error('如需要调试直出，请在.imtrc.js中配置 ssrDevServer:{port:xxx} 端口信息');
      process.exit(-1);
    }
    const {
      ssrConfig: { entry },
    } = options;
    config.before = app => {
      const protocol = https ? 'https://' : 'http://';
      const ssrHost = host === '0.0.0.0' ? 'localhost' : host;
      const proxy = {};
      Object.keys(entry).forEach(key => {
        const pageName = entry[key].split('/');
        const file = `/${pageName[pageName.length - 2]}.html`;
        proxy[file] = {
          target: `${protocol + ssrHost}:${port}${contentBase || ''}`,
          secure: false,
        };
      });
      setProxy(app, proxy);
    };
  }

  return config;
}

module.exports = async argv => {
  info('starting dev server.');
  const options = getOptions(argv);
  options.type = DEV;
  const devServer = getServerConfig(options);
  options.devServer = devServer;
  const imt = new Imt(options);
  const { hooks } = imt;

  await new Promise(resolve => {
    hooks.beforeDev.callAsync(imt, resolve);
  });
  if (options.ssr) {
    info('starting ssr watch.');
    const ssrOptions = Object.assign({}, options, { type: SSR, watch: true });
    const webpackConfig = getWebpackConfig(ssrOptions);
    webpack(webpackConfig, () => {});
  }

  await new Promise(resolve => {
    try {
      const webpackConfig = getWebpackConfig(options);
      webpackConfig.entry = prependEntry(webpackConfig.entry);
      const compiler = webpack(webpackConfig);
      let startCompilerTime = Date.now();

      compiler.hooks.invalid.tap('invalid', (filename, ctime) => {
        startCompilerTime = Date.now();
        if (isInteractive) {
          clearConsole();
        }
        const d = new Date(ctime);
        const leftpad = v => (v > 9 ? v : `0${v}`);
        const prettyPath = p => p.replace(os.homedir(), '~');
        console.log(
          chalk.cyan(
            `[${leftpad(d.getHours())}:${leftpad(d.getMinutes())}:${leftpad(
              d.getSeconds()
            )}] Rebuilding due to changes made in ${prettyPath(filename)}`
          )
        );
      });

      let isFirstCompile = true;

      // "done" event fires when Webpack has finished recompiling the bundle.
      // Whether or not you have warnings or errors, you will get this event.
      compiler.hooks.done.tap('done', stats => {
        if (isInteractive) {
          clearConsole();
        }
        const messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
        const isSuccessful = !messages.errors.length && !messages.warnings.length;
        if (isSuccessful) {
          console.log(
            chalk.green(`Compiled successfully in ${prettyMs(Date.now() - startCompilerTime)}`)
          );
        }
        if (isSuccessful && isFirstCompile) {
          printInstructions(devServer);
        }
        isFirstCompile = false;

        // If errors exist, only show errors.
        if (messages.errors.length) {
          // Only keep the first error. Others are often indicative
          // of the same problem, but confuse the reader with noise.
          if (messages.errors.length > 1) {
            messages.errors.length = 1;
          }
          console.log(chalk.red('Failed to compile.\n'));
          console.log(messages.errors.join('\n\n'));
          return;
        }

        // Show warnings if no errors were found.
        if (messages.warnings.length) {
          console.log(chalk.yellow('Compiled with warnings.\n'));
          console.log(messages.warnings.join('\n\n'));

          // Teach some ESLint tricks.
          console.log(
            `\nSearch for the ${chalk.underline(
              chalk.yellow('keywords')
            )} to learn more about each warning.`
          );
          console.log(
            `To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`
          );
        }
      });

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
};
