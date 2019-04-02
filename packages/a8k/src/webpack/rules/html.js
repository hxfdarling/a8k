import path from 'path';
import { ENV_PROD, TYPE_SERVER } from '../../const';

module.exports = (config, context, { type, mini }) => {
  if (type === TYPE_SERVER) {
    return;
  }
  config.module
    // 部分json文件只需要使用路径
    .rule('html')
    .test(/\.(html|njk|nunjucks)$/)
    .use('html-loader')
    .loader('html-loader')
    .options({
      removeComments: false,
      minimize: mini && context.internals.mode === ENV_PROD,
    })
    .end()
    .use('@a8k/html-loader')
    .loader('@a8k/html-loader')
    .options({
      cacheDirectory: path.resolve(context.config.cache, '@a8k/html-loader'),
      minimize: mini && context.internals.mode === ENV_PROD,
    })
    .end()
    .use('imt-nunjucks-loader')
    .loader('imt-nunjucks-loader')
    .options({
      // Other super important. This will be the base
      // directory in which webpack is going to find
      // the layout and any other file index.njk is calling.
      searchPaths: ['./src', './src/pages', './src/assets'].map(i => context.resolve(i)),
    });
};
