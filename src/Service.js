const chalk = require('chalk');
const path = require('path');

const getConfig = require('./webpack');

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

    this.cacheDir = path.resolve(options.cacheDir);

    this.projectDir = dir;
    // 开发者模式 dist 目录默认 dev，生产模式默认 dist（可配置)
    this.distDir = path.resolve(dir, options.dist || 'dev');

    this.pkg = require(path.join(dir, 'package.json'));

    try {
      /** @type ImtConfig */
      this.imtrc = { publicPath: '', mode: 'single', ...require(path.join(dir, '.imtrc.js')) };
    } catch (e) {
      console.log(chalk.error('项目目录找不到`.imrc.js`配置文件，无法继续构建'));
      console.error(e);
      process.exit(1);
    }
    this._init();
    this.getWebpackConfig();
  }

  _init() {}

  getWebpackConfig() {
    const { analyzer, sourceMap } = this.options;
    const configOptions = {
      ...this.options,
      projectDir: this.projectDir,
      sourceMap: sourceMap || process.env.NODE_ENV === DEV,
      publicPath: this.imtrc.publicPath,
      distDir: this.distDir,
      mode: this.imtrc.mode,
      analyzer,
      webappConfig: this.imtrc.webappConfig,
      ignorePages: this.imtrc.ignorePages,
      cacheDir: this.cacheDir,
      devServer: this.devServer,
    };
    this.webpackConfig = getConfig(configOptions);
    const { webpackOverride } = this.imtrc;
    if (webpackOverride) {
      webpackOverride(this.webpackConfig, this);
    }
  }
}

module.exports = Service;
