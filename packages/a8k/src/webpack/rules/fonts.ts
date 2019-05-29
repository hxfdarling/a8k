import WebpackChain from 'webpack-chain';
import A8k from '../..';

export default (config: WebpackChain, context: A8k, options, filename: string) => {
  config.module
    .rule('font')
    .test(/\.(eot|otf|ttf|woff|woff2)(\?.*)?$/)
    .use('file-loader')
    .loader('file-loader')
    .options({
      name: filename,
    });
};
