const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const getBaseConfig = require('./base.config');

module.exports = imtBuild => {
  const {
    projectDir,
    options: { port },
  } = imtBuild;
  const config = webpackMerge(getBaseConfig(imtBuild), {
    mode: 'development',
    entry: { 'react-hot-loader/patch': 'react-hot-loader/patch' },
    output: {
      publicPath: '',
      path: path.join(projectDir, 'dev'),
      filename: '[name].js',
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
    optimization: {},
    devServer: {
      port,
      hot: true,
      inline: true,
    },
  });

  return config;
};
