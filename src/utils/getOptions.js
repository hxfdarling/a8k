const path = require('path');
const { error } = require('./logger');

const cwd = process.cwd();

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
    /** @type ImtConfig */
    imtrc = Object.assign({ publicPath: '' }, require(path.join(cwd, '.imtrc.js')));
  } catch (e) {
    error('项目目录找不到`.imtrc.js`配置文件，请确认已经正确初始化.imtrc.js');
    error(e);
    process.exit(1);
  }
  Object.assign(options, imtrc);
  options.dist = path.resolve(cwd, options.dist || 'dist');
  options.cache = path.resolve(options.cache || 'node_modules/.cache');
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
