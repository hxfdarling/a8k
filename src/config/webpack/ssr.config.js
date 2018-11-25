const webpackMerge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const getBaseConfig = require('./common.config');
const { PROD } = require('../../const');

module.exports = options => {
  const { publicPath, ssrConfig } = options;

  const config = webpackMerge(getBaseConfig(options), {
    mode: PROD,
    target: 'node',
    devtool: 'source-map',
    output: {
      publicPath,
      path: ssrConfig.distDir,
      filename: '[name].js',
      libraryTarget: 'commonjs2',
    },
    entry: ssrConfig.entry,
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.(svg|gif|png|jpe?g|eot|woff|ttf|ogg|mp3|pdf)$/,
          loader: require.resolve('ignore-loader'),
        },
      ],
    },
    optimization: {
      minimizer: [],
      runtimeChunk: false,
    },
    plugins: [],
  });
  return config;
};
