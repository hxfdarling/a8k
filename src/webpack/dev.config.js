const path = require('path');
// const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const getBaseConfig = require('./base.config');

module.exports = imtBuild => {
  const { projectDir } = imtBuild;
  const config = webpackMerge(getBaseConfig(imtBuild), {
    mode: 'development',
    // entry: { 'react-hot-loader/patch': require.resolve('react-hot-loader/patch') },
    output: {
      publicPath: '',
      path: path.join(projectDir, 'dev'),
      filename: '[name].js',
    },
    // plugins: [new webpack.HotModuleReplacementPlugin()],
    optimization: {},
  });

  return config;
};
