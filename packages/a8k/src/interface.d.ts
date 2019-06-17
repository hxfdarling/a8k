import { BUILD_ENV, BUILD_TYPE, PROJECT_MODE } from './const';
import WebpackDevServer from 'webpack-dev-server';

interface A8kOptions {
  cliArgs: Array<string>;
  cliPath: string;
  baseDir: string;
  debug: boolean;
  configFile: string;
  inspectWebpack: boolean;
}

interface A8kConfig {
  type: string; // 项目类型，例如react项目、vue项目
  mode: PROJECT_MODE; // 项目模式，单页面多页面
  entry: any; //配置每个页面额外的入口文件
  dist: any; //构建文件输出目录
  cacheBase: any; //缓存根目录
  cache: any; //缓存目录
  pagesDir: string;
  template: string; // html模板路径
  devServer: WebpackDevServer.Configuration; // webpack-dev-server配置
  ssr: boolean;
  ssrConfig: {
    dist: string;
    view: string;
    entry?: {
      [key: string]: string;
    };
  }; //服务器渲染配置
  ssrDevServer: { contentBase: string; https: boolean; port: string; host: string };
  chainWebpack: Function;
  envs: any; // 配置的.env环境文件
  publicPath: string; //资源的公共路径（CDN、站点路径）
  plugins: Array<string>; // a8k插件
  webpackOverride: Function; // 直接修改webapck配置文件
  crossOrigin: boolean; // 是否跨域加载css、JavaScript
  retry: any; //主域重试
  babel: {
    include: Array<string | RegExp>;
    exclude: Array<string | RegExp>;
  };
  filenames: {
    js: string;
    css: string;
    font: string;
    image: string;
    chunk: string;
  };
  ignorePages: Array<string>;
  sri: boolean;
  escheck:
    | boolean
    | {
        ecmaVersion?: string;
        baseDir?: string;
        module?: boolean;
        allowHashBang?: boolean;
        exclude?: Array<string>;
      };

  // [key: string]: any;
}

interface Internals {
  mode: BUILD_ENV; // production/development
}

interface ICommandOptions {
  sourceMap?: boolean;
  cssSourceMap?: boolean;
  mini?: boolean;
  silent?: boolean;
  analyzer?: boolean;
  eslint?: boolean;
  stylelint?: boolean;
}

interface IResolveWebpackConfigOptions extends ICommandOptions {
  type: BUILD_TYPE;
  mode?: BUILD_ENV;
  watch?: boolean;
  ssr?: boolean;
}
