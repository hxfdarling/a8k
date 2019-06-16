import chalk from 'chalk';
import httpProxyMiddleware from 'http-proxy-middleware';
import getIp from 'internal-ip';

async function printInstructions(devServer) {
  const { host, port, https } = devServer;
  const protocol = https ? 'https://' : 'http://';
  const isAnyHost = host === '0.0.0.0';

  console.log();

  // eslint-disable-next-line max-len
  const getLocalAddress = color =>
    `${protocol}${isAnyHost ? 'localhost' : host}:${color ? chalk.bold(port) : port}`;
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
        proxyOptions = { ...proxy[context] };
        proxyOptions.context = correctedContext;
      }

      proxyOptions.logLevel = proxyOptions.logLevel || 'debug';

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

export { printInstructions, setProxy };
