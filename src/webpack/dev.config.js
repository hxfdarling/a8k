// const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const getBaseConfig = require('./common.config');
const { DEV } = require('../const');

module.exports = service => {
  const config = webpackMerge(getBaseConfig(service), {
    mode: DEV,
    // entry: { 'react-hot-loader/patch': require.resolve('react-hot-loader/patch') },
    output: {
      publicPath: process.env.IMT_ENV_PUBLIC_PATH,
      path: process.env.IMT_ENV_DIST_DIR,
      filename: '[name].js',
    },
    // plugins: [new webpack.HotModuleReplacementPlugin()],
    optimization: {},
  });

  return config;
};
