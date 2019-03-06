import logger from '@onepack/cli-utils/logger';
import chalk from 'chalk';
import httpProxyMiddleware from 'http-proxy-middleware';
import getIp from 'internal-ip';

const DEFAULT_HOST = '0.0.0.0';

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

function getServerConfig(context, options) {
  const { devServer, ssrDevServer } = context.config;
  const { host, port, ...reset } = devServer;
  const config = {
    https: false,
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
      logger.error('如需要调试直出，请配置 ssrDevServer:{port:xxx} 端口信息');
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
export { printInstructions, getServerConfig };
