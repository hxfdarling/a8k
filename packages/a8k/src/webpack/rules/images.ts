import { BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '../..';

export default (config: WebpackChain, context: A8k, { type }, filename: string) => {
  const isSSR = type === BUILD_TARGET.NODE;
  config.module
    .rule('image')
    .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/])
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: 10000,
      fallback: {
        loader: 'file-loader',
        options: {
          emitFile: !isSSR,
          name: filename,
        },
      },
    });

  // 项目外svg 直接拷贝过来
  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .exclude.add(context.resolve('src'))
    .end()
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: 10000,
      fallback: {
        loader: 'file-loader',
        options: {
          emitFile: !isSSR,
          name: filename,
        },
      },
    });
  // svg 直接inline
  config.module
    .rule('svg-inline')
    .test(/\.(svg)(\?.*)?$/)
    .include.add(context.resolve('src'))
    .end()
    .use('svg-inline-loader')
    .loader('svg-inline-loader')
    .options({
      classPrefix: true,
    });
};
