import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { BUILD_TARGET } from '../../const';

export default (config: WebpackChain, context: A8k, { type }, filename: string) => {
  const isSSR = BUILD_TARGET.NODE === type;
  config.module
    // 部分json文件只需要使用路径
    .rule('json')
    .test(/\.(path\.json)$/)
    .type('javascript/auto')
    .use('file-loader')
    .loader('file-loader')
    .options({
      emitFile: !isSSR,
      name: filename,
    });

  config.module
    // 其它文件直接拷贝
    .rule('file')
    .test(/\.(mp3|pdf)$/)
    .use('file-loader')
    .loader('file-loader')
    .options({
      emitFile: !isSSR,
      name: filename,
    });
};
