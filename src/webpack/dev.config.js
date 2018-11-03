// const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const getBaseConfig = require('./common.config');
const { DEV } = require('../const');

module.exports = options => {
  const { publicPath, distDir } = options;

  const config = webpackMerge(getBaseConfig(options), {
    mode: DEV,
    // entry: { 'react-hot-loader/patch': require.resolve('react-hot-loader/patch') },
    output: {
      publicPath,
      path: distDir,
      filename: '[name].js',
    },
    // plugins: [new webpack.HotModuleReplacementPlugin()],
    optimization: {},
  });

  return config;
};
