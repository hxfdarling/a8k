import { BUILD_ENV, BUILD_TARGET, PROJECT_MODE } from './const';
import WebpackDevServer from 'webpack-dev-server';

interface A8kOptions {
  cliArgs: Array<string>;
  cliPath: string;
  baseDir: string;
  debug: boolean;
  configFile: string;
  inspect: boolean;
}
type SsrConfig =
  | false
  | {
      contentBase: string;
      https: boolean;
      port: string;
      host: string;
      entryPath: string; // SSR文件输出目录
      viewPath: string; // SSR模板文件输出目录
      routesPath: string; // 路由文件路径
      entry: undefined | string[];
    };
type CssModules =
  | boolean
  | {
      mode?: string;
      localIdentName?: string;
      context?: string;
      hashPrefix?: string;
    };
type EsCheck =
  | boolean
  | {
      ecmaVersion?: string;
      baseDir?: string;
      module?: boolean;
      allowHashBang?: boolean;
      exclude?: Array<string>;
    };
interface A8kConfig {
  type: string; // 项目类型，例如react项目、vue项目
  mode: PROJECT_MODE; // 项目模式，单页面多页面

  template: string; // html模板路径
  initEntry: string[]; //配置每个页面额外的入口文件
  entry: any; // 自定义入口文件
  pagesPath: string;
  publicPath: string; //资源的公共路径（CDN、站点路径）
  dist: any; // 静态资源输出目录
  cacheDirectory: any; //缓存目录

  // feature
  extractCss: boolean; // mini-css-extract-plugin
  escheck: EsCheck;
  cssModules: CssModules;
  //服务器渲染配置
  ssrConfig: SsrConfig;
  crossOrigin: boolean; // 是否跨域加载css、JavaScript
  retry: any; //主域重试
  sri: boolean;

  ssrDevServer: any;
  devServer: WebpackDevServer.Configuration; // webpack-dev-server配置
  chainWebpack: Function | undefined;
  envs: { [key: string]: any }; // 配置的.env环境文件
  plugins: Array<string>; // a8k插件
  webpackOverride: Function | undefined; // 直接修改webapck配置文件
  babel: {
    include: Array<string | RegExp>;
    exclude: Array<string | RegExp>;
  };
  filenames: {
    js: string;
    css: string;
    font: string;
    image: string;
    file: string;
    chunk: string;
  };
  ignorePages: Array<string>;
}

interface Internals {
  mode: BUILD_ENV; // production/development
}

interface ICommandOptions {
  watch?: boolean;
  sourceMap?: boolean;
  cssSourceMap?: boolean;
  mini?: boolean;
  silent?: boolean;
  analyzer?: boolean;
  eslint?: boolean;
  stylelint?: boolean;
}

interface IResolveWebpackConfigOptions extends ICommandOptions {
  type: BUILD_TARGET; // 目标是浏览器还是node
  mode?: BUILD_ENV; // 是生产模式还是开发模式
  watch?: boolean; // ssr模式监听
  ssr?: boolean; // ssr模式
}
