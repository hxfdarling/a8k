const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const getBaseConfig = require('./base.config');

module.exports = imtBuild => {
  const {
    projectDir,
    distDir,
    imtrc: { cdn = '' },
  } = imtBuild;
  const config = webpackMerge(getBaseConfig(imtBuild), {
    mode: 'production',
    output: {
      path: path.resolve(projectDir, distDir),
      publicPath: cdn,
      filename: '[name]_[chunkhash].js',
    },
    optimization: {
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      // Keep the runtime chunk seperated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      runtimeChunk: true,
    },
    plugins: [
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
