import { PROJECT_MODE } from './const';

interface A8kOptions {
  cliArgs: Array<string>;
  cliPath: string;
  baseDir: string;
  debug?: boolean;
  configFile?: string;
  inspectWebpack?: boolean;
}
interface A8kConfig {
  mode: PROJECT_MODE; // 项目模式，单页面多页面
  entry: any; //配置每个页面额外的入口文件
  dist: any; //构建文件输出目录
  cacheBase: any; //缓存根目录
  cache: any; //缓存目录
  ssrConfig: any; //服务器渲染配置
  devServer: any; // webpack-dev-server配置
  ssrDevServer: { contentBase: string; https: boolean; port: string; host: string };
  host: string; // 调试域名
  port: string; // 调试端口
  chainWebpack: Function;
  envs: any; // 配置的.env环境文件
  publicPath: string; //资源的公共路径（CDN、站点路径）
  plugins: Array<string>; // a8k插件
  webpackOverride: Function; // 直接修改webapck配置文件
  crossOrigin: boolean; // 是否跨域加载css、JavaScript
  retry: any; //主域重试
  babel: { include: Array<string | RegExp>; exclude: Array<string | RegExp> };
  filenames: {
    js: string;
    css: string;
    font: string;
    image: string;
    chunk: string;
  };
  ignorePages: Array<string>;
  pagesDir: string;
  // [key: string]: any;
}

interface Internals {
  mode: string; // production/development
}
