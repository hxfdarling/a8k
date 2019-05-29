import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { BUILD_TYPE } from '../../const';

export default (config: WebpackChain, context: A8k, { type }, filename: string) => {
  const isSSR = type === BUILD_TYPE.SERVER;
  config.module
    .rule('image')
    .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/])
    .use('file-loader')
    .loader('file-loader')
    .options({
      emitFile: !isSSR,
      name: filename,
    });

  // 项目外svg 直接拷贝过来
  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .exclude.add(context.resolve('src'))
    .end()
    .use('file-loader')
    .loader('file-loader')
    .options({
      emitFile: !isSSR,
      name: filename,
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
