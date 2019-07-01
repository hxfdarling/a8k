import { BUILD_ENV, BUILD_TARGET, ENV_PROD } from '@a8k/common/lib/constants';
import path from 'path';
import WebpackChain from 'webpack-chain';
import A8k from '..';
import { IResolveWebpackConfigOptions } from '../interface';

export default (
  configChain: WebpackChain,
  context: A8k,
  { type, mini, sourceMap }: IResolveWebpackConfigOptions
) => {
  configChain.optimization.minimize(false);

  if (context.internals.mode === BUILD_ENV.PRODUCTION && mini) {
    configChain.optimization.set('moduleIds', 'hashed');
  } else {
    configChain.optimization.set('moduleIds', 'named');
  }

  if (type === BUILD_TARGET.BROWSER || type === BUILD_TARGET.STORYBOOK) {
    configChain.optimization.splitChunks({
      // Automatically split vendor and commons
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366

      chunks: 'all',
      minSize: 30000, // 提高缓存利用率，这需要在http2/spdy
      maxSize: 0,
      minChunks: 3,
      maxAsyncRequests: 6,
      maxInitialRequests: 6,
      automaticNameDelimiter: '~',
      // 避免由于添加页面造成不必要的缓存失效
      name: context.internals.mode !== ENV_PROD,
      cacheGroups: {
        polyfill: {
          test: /[\\/]node_modules[\\/](core-js|@babel|regenerator-runtime)/,
          name: 'polyfill',
          priority: 70,
          minChunks: 1,
          reuseExistingChunk: true,
        },
        vendor: {
          test: ({ resource }: any) => {
            if (resource) {
              const include = [/[\\/]node_modules[\\/]/].every(reg => {
                return reg.test(resource);
              });
              const exclude = [/[\\/]node_modules[\\/](react|redux|antd|@ant-design)/].some(reg => {
                return reg.test(resource);
              });
              return include && !exclude;
            }
            return false;
          },
          name: 'vendor',
          priority: 50,
          minChunks: 2,
          reuseExistingChunk: true,
        },
        react: {
          test({ resource }: any) {
            return /[\\/]node_modules[\\/](react|redux)/.test(resource);
          },
          name: 'react',
          priority: 20,
          minChunks: 1,
          reuseExistingChunk: true,
        },
        antd: {
          test: /[\\/]node_modules[\\/](antd|@ant-design)/,
          name: 'antd',
          priority: 15,
          minChunks: 1,
          reuseExistingChunk: true,
        },
      },
    });
    // Keep the runtime chunk seperated to enable long term caching
    configChain.optimization.runtimeChunk('single');

    if (context.internals.mode === BUILD_ENV.PRODUCTION && mini) {
      configChain.optimization.minimize(true);
    }
    const TerserPlugin = require('terser-webpack-plugin');
    TerserPlugin.__expression = "require('terser-webpack-plugin'";
    const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
    OptimizeCSSAssetsPlugin.__expression = "require('optimize-css-assets-webpack-plugin')";
    configChain.optimization
      .minimizer('js')
      .use(TerserPlugin, [
        {
          cache: path.resolve(context.config.cacheDirectory, 'terser-webpack-plugin'),
          parallel: true,
          sourceMap,
          terserOptions: {
            compress: {
              // 删除所有的 `console` 语句
              drop_console: true,
            },
          },
        },
      ])
      .end();

    configChain.optimization
      .minimizer('css')
      .use(OptimizeCSSAssetsPlugin, [
        {
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
        },
      ])
      .end();
  }
};
