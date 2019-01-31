const path = require('path');
const { error, warn } = require('./logger');

const cwd = process.cwd();

const defaultOptions = {
  dist: 'dist',
  cache: 'node_modules/.cache',
  publicPath: '',
  devServer: {},
  ssrDevServer: {},
};

/**
 * @typedef {Object} ImtConfig
 * @property {String} mode 模式，支持:single(单页面)、multi(多页面)
 * @property {Array<Object>} plugins 插件支持
 * @property {String} publicPath cdn路径,默认''
 * @property {Function<config,context>} webpackOverride 允许项目修改webpack配置
 */

module.exports = options => {
  let { proxy, defaultProxy } = options.parent || {};
  if (defaultProxy) {
    proxy = 'http://web-proxy.tencent.com:8080';
  }
  options.projectDir = cwd;
  options.proxy = proxy;
  let imtrc = {};
  try {
    try {
      imtrc = require(path.join(cwd, 'imtrc.js'));
    } catch (err) {
      try {
        imtrc = require(path.join(cwd, '.imtrc.js'));
      } catch (e) {
        throw err;
      }
      warn('.imtrc.js文件命名被移除，请重命名为imtrc.js');
    }
  } catch (e) {
    error('项目目录找不到`imtrc.js`配置文件，请确认已经正确初始化imtrc.js');
    error(e);
    process.exit(1);
  }

  options = Object.assign({}, defaultOptions, imtrc, options);

  options.dist = path.resolve(cwd, options.dist);
  options.cache = path.resolve(options.cache);

  options.imtPath = path.resolve(__dirname, '../../');

  if (options.ssrConfig) {
    options.ssrConfig = Object.assign(
      {
        // js存放地址
        dist: './node_modules/components',
        // html存放地址
        view: './app/views',
      },
      options.ssrConfig
    );
    const { ssrConfig, projectDir } = options;
    ssrConfig.dist = path.resolve(projectDir, ssrConfig.dist);
    ssrConfig.view = path.resolve(projectDir, ssrConfig.view);
  }
  return options;
};
