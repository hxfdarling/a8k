import { BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '../..';

export default (config: WebpackChain, context: A8k, { type }, filename: string) => {
  config.module
    .rule('font')
    .test(/\.(eot|otf|ttf|woff|woff2)(\?.*)?$/)
    .use('file-loader')
    .loader('file-loader')
    .options({
      emitFile: type !== BUILD_TARGET.NODE,
      name: filename,
    });
};
