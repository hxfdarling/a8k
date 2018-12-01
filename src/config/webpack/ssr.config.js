const webpackMerge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const getBaseConfig = require('./common.config');
const { PROD } = require('../../const');

module.exports = options => {
  const { publicPath, ssrConfig } = options;
  const isDevMode = options.watch;
  const { host, port } = options.devServer;
  const isAnyHost = host === '0.0.0.0';
  const reallyHost = isAnyHost ? 'localhost' : host;
  const devSrcUrl = `//${reallyHost}:${port}/`;
  const config = webpackMerge(getBaseConfig(options), {
    mode: PROD,
    target: 'node',
    devtool: 'source-map',
    watch: options.watch,
    output: {
      publicPath: isDevMode ? devSrcUrl : publicPath,
      path: ssrConfig.dist,
      filename: '[name].js',
      libraryTarget: 'commonjs2',
    },
    entry: ssrConfig.entry,
    externals: [
      nodeExternals({
        // 注意如果存在src下面其他目录的绝对引用，都需要添加到这里
        whitelist: [/^components/, /^assets/, /^pages/, /^@tencent/, /\.(scss|css)$/],
        // modulesFromFile:true
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: require.resolve('ignore-loader'),
        },
      ],
    },
    optimization: {
      splitChunks: false,
      minimizer: [],
      runtimeChunk: false,
    },
    plugins: [],
  });
  return config;
};
