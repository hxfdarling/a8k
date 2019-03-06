import { TYPE_SERVER } from '../../const';

module.exports = (config, context, { type }, filename) => {
  console.log('TCL: filename', filename);
  const isSSR = type === TYPE_SERVER;
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
