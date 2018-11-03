const chalk = require('chalk');
const path = require('path');

const getConfig = require('../webpack');

const Imt = require('..');

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

    this.projectDir = dir;
    // 开发者模式 dist 目录默认 dev，生产模式默认 dist（可配置)
    this.distDir = path.resolve(dir, options.dist || 'dev');

    try {
      /** @type ImtConfig */
      this.imtrc = { publicPath: '', mode: 'single', ...require(path.join(dir, '.imtrc.js')) };
    } catch (e) {
      console.log(chalk.error('项目目录找不到`.imrc.js`配置文件，无法继续构建'));
      process.exit(1);
    }

    process.env.IMT_ENV_PROJECT_DIR = this.projectDir;
    process.env.IMT_ENV_DIST_DIR = this.distDir;
    process.env.IMT_ENV_PUBLIC_PATH = this.imtrc.publicPath;
    process.env.IMT_ENV_MODE = this.imtrc.mode;

    this.webpackConfig = getConfig(this);
    const { webpackOverride } = this.imtrc;
    if (webpackOverride) {
      webpackOverride(this.webpackConfig, this);
    }
  }
}

module.exports = Service;
