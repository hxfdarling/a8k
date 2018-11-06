const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { DEV, PROD } = require('../const');

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
  const { analyzer, useSmp } = options;

  let config;
  switch (process.env.NODE_ENV) {
    case DEV:
      config = require('./dev.config')(options);
      break;
    case PROD:
      config = require('./prod.config')(options);
      break;
    default:
  }

  if (analyzer) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }
  if (useSmp) {
    return smp.wrap(config);
  }
  return config;
};
