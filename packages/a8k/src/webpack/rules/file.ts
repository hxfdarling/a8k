import { BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '../..';

export default (configChain: WebpackChain, context: A8k, { type }) => {
  const isSSR = BUILD_TARGET.NODE === type;
  const filename = context.config.filenames.file;
  configChain.module
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

  configChain.module
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
