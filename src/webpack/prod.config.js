const webpackMerge = require('webpack-merge');
const webpack = require('webpack');

// plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const LodashPlugin = require('lodash-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');

// config
const getBaseConfig = require('./common.config');
const { PROD } = require('../const');

const configureCleanWebpack = ({ distDir: root }) => {
  return {
    root,
    verbose: true,
    dry: false,
  };
};

const configureTerser = ({ sourceMap }) => {
  return {
    cache: true,
    parallel: true,
    sourceMap,
  };
};

const configureOptimizeCSS = ({ sourceMap }) => {
  return {
    cssProcessorOptions: {
      map: sourceMap
        ? {
          inline: false,
          annotation: true,
        }
        : false,
      safe: true,
      discardComments: true,
    },
  };
};
const configureWebapp = ({ webappConfig }) => {
  return webappConfig;
};
module.exports = options => {
  const { sourceMap, publicPath, distDir } = options;
  const config = webpackMerge(getBaseConfig(options), {
    mode: PROD,
    devtool: sourceMap ? 'source-map' : 'none',
    output: {
      publicPath,
      path: distDir,
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
      minimizer: [
        new TerserPlugin(configureTerser(options)),
        new OptimizeCSSAssetsPlugin(configureOptimizeCSS(options)),
      ],
    },
    plugins: [
      // 支持lodash包 按需引用
      new LodashPlugin(),
      new CleanWebpackPlugin('*', configureCleanWebpack(options)),
      new MiniCssExtractPlugin({
        filename: '[name]_[contenthash].css',
      }),

      new webpack.HashedModuleIdsPlugin({
        hashDigestLength: 6,
      }),
    ],
  });
  if (options.webappConfig) {
    config.plugins.push(
      new WebappWebpackPlugin(configureWebapp(options)),
      // 微信QQ分享图标支持
      new class {
        apply(compiler) {
          compiler.hooks.make.tapAsync('A', (compilation, callback) => {
            compilation.hooks.webappWebpackPluginBeforeEmit.tapAsync('B', (result, _callback) => {
              const { html } = result;
              const reg = /<link rel="apple-touch-icon" sizes="152x152" href="([^"]*)">/;
              const url = html.match(reg)[1];
              result.html = `<meta itemprop="image" content="${url}" />${result.html}`;
              return _callback(null, result);
            });
            return callback();
          });
        }
      }()
    );
  }
  return config;
};
