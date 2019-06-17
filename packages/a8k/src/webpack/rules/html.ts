import path from 'path';
import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { BUILD_ENV, BUILD_TYPE } from '../../const';

export default (config: WebpackChain, context: A8k, { type, mini }) => {
  if (type === BUILD_TYPE.SERVER || type === BUILD_TYPE.STORYBOOK) {
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
      minimize: mini && context.internals.mode === BUILD_ENV.PRODUCTION,
    })
    .end()
    .use('@a8k/html-loader')
    .loader('@a8k/html-loader')
    .options({
      cacheDirectory: path.resolve(context.config.cache, '@a8k/html-loader'),
      minimize: mini && context.internals.mode === BUILD_ENV.PRODUCTION,
    })
    .end()
    .use('imt-nunjucks-loader')
    .loader('imt-nunjucks-loader')
    .options({
      // Other super important. This will be the base
      // directory in which webpack is going to find
      // the layout and any other file index.njk is calling.
      searchPaths: ['./src', './src/pages', './src/assets'].map((i) => context.resolve(i)),
    });
};
