import { A8kConfig } from './interface';
import { PROJECT_MODE } from './const';

const config: A8kConfig = {
  mode: PROJECT_MODE.MULTI,
  entry: {},
  dist: 'dist',
  pagesDir: './src/pages',
  template: './src/assets/template.html',
  cacheBase: '',
  cache: 'node_modules/.cache',
  publicPath: '',
  devServer: {
    host: '0.0.0.0',
    port: 8899,
    // disable webpack-dev-server inline client, use a8k client
    inline: false,
    disableHostCheck: true,
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
    // by listening to the compiler events with `compiler.hooks[...].tap` calls
    // above.
    quiet: true,
    overlay: false,
    headers: {
      'access-control-allow-origin': '*',
    },
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      disableDotRule: true,
    },

    // By default files from `contentBase` will not trigger a page reload.
    watchContentBase: true,

    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: '/',
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
  } as any,
  ssr: false,
  ssrConfig: {
    // js存放地址
    dist: './.a8k/entry',
    // html存放地址
    view: './.a8k/view',
  },
  ssrDevServer: {
    host: 'localhost',
    contentBase: '',
    https: false,
    port: '',
  },

  escheck: true,
} as A8kConfig;
export default config;
