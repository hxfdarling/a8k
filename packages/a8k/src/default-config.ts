import { PROJECT_MODE, SERVER_ENTRY_DIR, SERVER_ROUTES, SERVER_VIEW_DIR } from '@a8k/common/lib/constants';
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
  historyApiFallback: false,
  // By default files from `contentBase` will not trigger a page reload.
  watchContentBase: false,
  // It is important to tell WebpackDevServer to use the same "root" path
  // as we specified in the config. In development, we always serve from /.
  publicPath: '/',
  // Don't show server directory information
  serveIndex: false,
} as any;
const config: A8kConfig = {
  type: '',
  mode: PROJECT_MODE.MULTI,

  template: './src/common/template.html',
  initEntry: [],
  entry: null,
  pagesPath: './src/pages',
  dist: './.a8k/static',
  publicPath: '/',
  cacheDirectory: './.a8k/.cache',

  // feature
  extractCss: true,
  escheck: false,
  cssModules: false,
  ssrConfig: false,
  crossOrigin: true,
  retry: false,
  sri: false,

  devServer,
  ssrDevServer: {},
  babel: {
    include: [],
    exclude: [],
  },
  chainWebpack: undefined,
  webpackOverride: undefined,
  filenames: {} as any,
  plugins: [],
  ignorePages: [],
  envs: {},
} as A8kConfig;
export const ssrConfig = {
  host: 'localhost',
  contentBase: '',
  https: false,
  port: '',
  // js存放地址
  entryPath: SERVER_ENTRY_DIR,
  // html存放地址
  viewPath: SERVER_VIEW_DIR,
  // 直出路由文件地址
  routesPath: SERVER_ROUTES,
};
export default config;
