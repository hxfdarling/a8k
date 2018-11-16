const chalk = require('chalk');
const path = require('path');

const getWebpackConfig = require('./config/webpack');

const Imt = require('.');
const { DEV } = require('./const');

const cwd = process.cwd();

/**
 * @typedef {Object} ImtConfig
 * @property {String} mode 模式，支持:single(单页面)、multi(多页面)
 * @property {Array<Object>} plugins 插件支持
 * @property {String} publicPath cdn路径,默认''
 * @property {Function<config,context>} webpackOverride 允许项目修改webpack配置
 */

class Service extends Imt {
  constructor(dir, options) {
    super(options);
    if (!dir) {
      dir = cwd;
    } else {
      dir = path.resolve(cwd, dir);
    }
    this.options.cacheDir = path.resolve(options.cacheDir);
    this.options.projectDir = dir;

    try {
      /** @type ImtConfig */
      this.imtrc = { publicPath: '', mode: 'single', ...require(path.join(dir, '.imtrc.js')) };
    } catch (e) {
      console.log(chalk.error('项目目录找不到`.imrc.js`配置文件，无法继续构建'));
      console.error(e);
      process.exit(1);
    }

    this.options.distDir = path.resolve(dir, this.imtrc.dist || options.dist || 'dist');

    Object.assign(this.options, this.imtrc);
    this.init();
    this.getWebpackConfig();
  }

  init() {}

  getWebpackConfig() {
    const { sourceMap } = this.options;
    const configOptions = {
      ...this.options,
      // 开发模式需要sourceMap
      sourceMap: sourceMap || process.env.NODE_ENV === DEV,
    };
    this.webpackConfig = getWebpackConfig(configOptions);
    const { webpackOverride } = this.imtrc;
    if (webpackOverride) {
      const temp = webpackOverride(this.webpackConfig, this);
      if (temp !== undefined) {
        this.webpackConfig = temp;
      }
    }
  }
}

module.exports = Service;
