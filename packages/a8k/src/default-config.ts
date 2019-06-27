import { PROJECT_MODE } from '@a8k/common/lib/constants';
import WebpackDevServer from 'webpack-dev-server';
import { A8kConfig } from './interface';
const devServer: WebpackDevServer.Configuration = {
  host: '0.0.0.0',
  port: 8899,
  // use webpack-dev-server client
  inline: true,
  disableHostCheck: true,
  // not use https
  https: false,
  // Enable gzip compression of generated files.
  compress: true,
  // we need info in compile
  clientLogLevel: 'info',
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
  watchContentBase: false,
  // It is important to tell WebpackDevServer to use the same "root" path
  // as we specified in the config. In development, we always serve from /.
  publicPath: '/',
};
const config: A8kConfig = {
  mode: PROJECT_MODE.MULTI,
  entry: {},
  dist: './.a8k/static',
  pagesDir: './src/pages',
  template: './src/common/template.html',
  cacheBase: '',
  cache: './.a8k/.cache',
  publicPath: '',
  devServer,
  cssModules: false,
  ssrConfig: false,
  escheck: true,
} as A8kConfig;
export const ssrConfig = {
  host: 'localhost',
  contentBase: '',
  https: false,
  port: '',
  // js存放地址
  dist: './.a8k/server/entry',
  // html存放地址
  view: './.a8k/server/view',
};
export default config;
