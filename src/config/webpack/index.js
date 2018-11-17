const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { DEV, PROD, SSR } = require('../../const');

const smp = new SpeedMeasurePlugin();

/**
 * @typedef {Object} ConfigOptions
 * @property {String} projectDir
 * @property {Boolean} sourceMap
 * @property {String} publicPath
 * @property {String} distDir
 * @property {String} mode
 * @property {Boolean} analyzer
 */
/**
 * @param {ConfigOptions} options
 */
module.exports = options => {
  // 开发模式需要sourceMap
  if (process.env.NODE_ENV === DEV) {
    options.sourceMap = true;
  }

  const { analyzer, useSmp, type } = options;

  let config;
  switch (type) {
    case DEV:
      config = require('./dev.config')(options);
      break;
    case PROD:
      config = require('./prod.config')(options);
      break;
    case SSR:
      config = require('./ssr.config')(options);
      break;
    default:
      break;
  }

  if (analyzer) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  if (useSmp) {
    config = smp.wrap(config);
  }

  const { webpackOverride } = options;
  if (webpackOverride) {
    const temp = webpackOverride(config, options);
    if (temp !== undefined) {
      config = temp;
    }
  }

  return config;
};
