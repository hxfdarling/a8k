import { TYPE_SERVER } from '../../const';

module.exports = (config, context, { type }, filename) => {
  const isSSR = TYPE_SERVER === type;
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
