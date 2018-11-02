const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { DEV, PROD } = require('../const');

const smp = new SpeedMeasurePlugin();

module.exports = (type, options) => {
  const {
    options: { analyzer },
  } = options;
  let config;
  switch (type) {
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
    return smp.wrap(config);
  }
  return config;
};
