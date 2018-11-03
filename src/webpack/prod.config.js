const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const path = require('path');
const getBaseConfig = require('./common.config');
const { PROD } = require('../const');

const { env } = process;
// Configure Clean webpack
const configureCleanWebpack = () => {
  return {
    root: env.IMT_ENV_DIST_DIR,
    verbose: true,
    dry: false,
  };
};

module.exports = service => {
  const config = webpackMerge(getBaseConfig(service), {
    mode: PROD,
    output: {
      publicPath: env.IMT_ENV_PUBLIC_PATH,
      path: env.IMT_ENV_DIST_DIR,
      filename: '[name]_[chunkhash].js',
    },
    optimization: {
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      // splitChunks: {
      //   chunks: 'all',
      //   name: false,
      // },
      // Keep the runtime chunk seperated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      runtimeChunk: true,
    },
    plugins: [
      new CleanWebpackPlugin('*', configureCleanWebpack()),
      new MiniCssExtractPlugin({
        filename: '[name]_[contenthash].css',
      }),
      new webpack.HashedModuleIdsPlugin({
        hashDigestLength: 6,
      }),
    ],
  });

  return config;
};
