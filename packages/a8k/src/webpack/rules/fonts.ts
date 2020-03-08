import { BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { IResolveWebpackConfigOptions } from '../../interface';

export default (configChain: WebpackChain, context: A8k, { type }: IResolveWebpackConfigOptions) => {
  configChain.module
    .rule('font')
    .test(/\.(eot|otf|ttf|woff|woff2)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: 10000,
      fallback: {
        loader: 'file-loader',
        options: {
          emitFile: type !== BUILD_TARGET.NODE,
          name: context.config.filenames.font,
        },
      },
    });
};
