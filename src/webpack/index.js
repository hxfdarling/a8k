const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { DEV, PROD } = require('../const');

const smp = new SpeedMeasurePlugin();

module.exports = service => {
  const {
    options: { analyzer },
  } = service;

  let config;
  switch (process.env.NODE_ENV) {
    case DEV:
      config = require('./dev.config')(service);
      break;
    case PROD:
      config = require('./prod.config')(service);
      break;
    default:
  }

  if (analyzer) {
    config.plugins.push(new BundleAnalyzerPlugin());
    return smp.wrap(config);
  }
  return config;
};
