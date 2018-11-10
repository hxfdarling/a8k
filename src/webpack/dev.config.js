const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');

const getBaseConfig = require('./common.config');
const { DEV } = require('../const');

module.exports = options => {
  const { distDir, projectDir } = options;

  const config = webpackMerge(getBaseConfig(options), {
    mode: DEV,
    output: {
      path: distDir,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                formatter: require.resolve('eslint-friendly-formatter'),
                // 要求项目安装eslint，babel-eslint依赖，目的是让vscode 也提示eslint错误
                eslintPath: path.resolve(projectDir, 'node_modules', 'eslint'),
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: [path.resolve(projectDir, 'src')],
        },
      ],
    },
    optimization: {},
    plugins: [new webpack.HotModuleReplacementPlugin()],
  });

  return config;
};
