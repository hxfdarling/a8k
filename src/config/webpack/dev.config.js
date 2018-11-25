const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
// const WebpackBar = require('webpackbar');

const getBaseConfig = require('./common.config');
const { DEV } = require('../../const');
const SSRPlugin = require('./plugins/ssr-plugin');

module.exports = options => {
  const { dist, projectDir, eslint, ssr } = options;

  const config = webpackMerge(getBaseConfig(options), {
    mode: DEV,
    output: {
      path: dist,
      filename: '[name].js',
    },
    module: {
      rules: [
        eslint && {
          test: /\.(js|mjs|jsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                emitError: false,
                failOnError: false,
                failOnWarning: false,
                quit: true,
                cache: path.resolve(options.cache, 'eslint-loader'),
                formatter: require.resolve('eslint-friendly-formatter'),
                // 要求项目安装eslint，babel-eslint依赖，目的是让vscode 也提示eslint错误
                eslintPath: path.resolve(projectDir, 'node_modules', 'eslint'),
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: [path.resolve(projectDir, 'src')],
        },
      ].filter(Boolean),
    },
    optimization: {
      minimizer: [],
      runtimeChunk: true,
    },
    plugins: [
      // new WebpackBar({
      //   profile: options.analyzer,
      // }),
      ssr && new SSRPlugin(options),
      new webpack.HotModuleReplacementPlugin(),
    ].filter(Boolean),
  });

  return config;
};
