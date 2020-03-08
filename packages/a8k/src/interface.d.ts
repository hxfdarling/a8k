import { BUILD_ENV, BUILD_TARGET, PROJECT_MODE } from './const';
import WebpackDevServer from 'webpack-dev-server';

interface A8kOptions {
  cliArgs: Array<string>; // 命令参数
  cliPath: string; // cli 路径目录
  baseDir: string; // 项目根目录
  debug: boolean; // debug模式，会打印debug级别日志
  configFile: string; // 自定义配置文件
  inspect: boolean; // 需要导出webpack config文件
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
      entry: undefined | string[]; // 自定义服务器渲染页面
    };
type CssModules =
  | boolean
  | {
      mode?: string;
      localIdentName?: string; // 该项不被可修改
      context?: string;
      hashPrefix?: string;
    };
type EsCheck =
  | boolean
  | {
      ecmaVersion?: string; // 默认: es5
      baseDir?: string; // 检测目录
      module?: boolean; // 是否支持import
      allowHashBang?: boolean;
      exclude?: Array<string>; // 排除文件
    };
interface A8kConfig {
  type: string; // 项目类型，例如react项目、vue项目
  mode: PROJECT_MODE; // 项目模式，单页面多页面

  template: string; // html模板路径
  initEntry: string[]; // 配置每个页面额外的入口文件
  entry: any; // 自定义入口文件
  pagesPath: string;
  publicPath: string; // 资源的公共路径（CDN、站点路径）
  dist: any; // 静态资源输出目录
  cacheDirectory: any; // 缓存目录

  // feature
  extractCss: boolean; // mini-css-extract-plugin
  escheck: EsCheck;
  cssModules: CssModules;
  // 服务器渲染配置
  ssrConfig: SsrConfig;
  crossOrigin: boolean; // 是否跨域加载css、JavaScript
  retry: any; // 主域重试
  sri: boolean; // 子资源完整性校验

  ssrDevServer: any; // 废弃，请使用ssrConfig
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
  watch?: boolean; // 启动watch模式，构建结束后不会退出，文件变化会重新触发构建
  sourceMap?: boolean; // 是否开启sourceMap
  cssSourceMap?: boolean; // 是否使用css sourceMap，这个造成 FOUC
  mini?: boolean; // 是否启动压缩
  silent?: boolean; // 是否静默不输出webpack构建日志
  analyzer?: boolean; // 是否输出bundle分析
  eslint?: boolean; // 是否启动dev eslint
  stylelint?: boolean; // 是否启用dev stylelint
}

interface IResolveWebpackConfigOptions extends ICommandOptions {
  type: BUILD_TARGET; // 目标是浏览器还是node
  mode?: BUILD_ENV; // 是生产模式还是开发模式
  watch?: boolean; // ssr模式监听
  ssr?: boolean; // ssr模式
  extractCss?: boolean; // 是否需要extract css
}
