const webpackMerge = require('webpack-merge');
const webpack = require('webpack');

const getBaseConfig = require('./common.config');
const { DEV } = require('../const');

module.exports = options => {
  const { distDir } = options;

  const config = webpackMerge(getBaseConfig(options), {
    mode: DEV,
    // entry: { 'react-hot-loader/patch': require.resolve('react-hot-loader/patch') },
    output: {
      path: distDir,
      filename: '[name].js',
    },
    optimization: {},
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
  });

  return config;
};
