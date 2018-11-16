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
    return smp.wrap(config);
  }
  return config;
};
