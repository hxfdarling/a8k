const chalk = require('chalk').default;
const path = require('path');

const cwd = process.cwd();

/**
 * @typedef {Object} ImtConfig
 * @property {String} mode 模式，支持:single(单页面)、multi(多页面)
 * @property {Array<Object>} plugins 插件支持
 * @property {String} publicPath cdn路径,默认''
 * @property {Function<config,context>} webpackOverride 允许项目修改webpack配置
 */

function clearPrototype(obj) {
  const newOjb = {};
  Object.keys(obj).forEach(key => {
    newOjb[key] = obj[key];
  });
  obj = newOjb;
  return obj;
}

module.exports = options => {
  options = clearPrototype(options);
  options.projectDir = cwd;
  let imtrc = {};
  try {
    /** @type ImtConfig */
    imtrc = Object.assign({ publicPath: '' }, require(path.join(cwd, '.imtrc.js')));
  } catch (e) {
    console.log(chalk.red('项目目录找不到`.imtrc.js`配置文件，请确认已经正确初始化.imtrc.js'));
    console.error(e);
    process.exit(1);
  }
  options.distDir = path.resolve(cwd, imtrc.dist || options.dist || 'dist');
  if (options.cacheDir) {
    options.cacheDir = path.resolve(options.cacheDir);
  }
  Object.assign(options, imtrc);
  return options;
};
