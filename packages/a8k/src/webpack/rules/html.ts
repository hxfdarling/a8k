import { BUILD_ENV, BUILD_TARGET } from '@a8k/common/lib/constants';
import path from 'path';
import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { IResolveWebpackConfigOptions } from '../../interface';

export default (configChain: WebpackChain, context: A8k, { type, mini }: IResolveWebpackConfigOptions) => {
  if (type === BUILD_TARGET.NODE || type === BUILD_TARGET.STORYBOOK) {
    return;
  }
  const {
    internals: { mode },
    config: { cacheDirectory, envs },
  } = context;
  const needMini = mini && mode === BUILD_ENV.PRODUCTION;
  configChain.module
    // 部分json文件只需要使用路径
    .rule('html')
    .test(/\.(html|njk|nunjucks)$/)
    .use('html-loader')
    .loader('html-loader')
    .options({
      removeComments: false,
      removeAttributeQuotes: false,
      minimize: needMini,
    })
    .end()
    .use('@a8k/html-loader')
    .loader('@a8k/html-loader')
    .options({
      rootDir: context.resolve('src'),
      cacheDirectory: path.resolve(cacheDirectory, '@a8k/html-loader'),
      minimize: needMini,
      filenames: context.config.filenames,
    })
    .end()
    .use('nunjucks-loader')
    .loader('@a8k/nunjucks-loader')
    .options({
      context: {
        ...process.env, // 添加nunjucks模板参数
        envs,
        mode,
      },
      // Other super important. This will be the base
      // directory in which webpack is going to find
      // the layout and any other file index.njk is calling.
      searchPaths: ['./src', './src/pages', './src/assets'].map(i => context.resolve(i)),
    });
};
