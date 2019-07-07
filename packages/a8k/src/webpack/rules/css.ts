import { BUILD_ENV, BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { IResolveWebpackConfigOptions } from '../../interface';
import generateLoaders from './generate-loaders';

export default (configChain: WebpackChain, context: A8k, options: IResolveWebpackConfigOptions) => {
  const { type, ssr } = options;
  const { config, internals } = context;
  // 生产模式和服务器渲染调试时，开启这个模式防止样式抖动
  const extractCss = config.extractCss && (internals.mode === BUILD_ENV.PRODUCTION || !!ssr);

  if (type === BUILD_TARGET.NODE && !config.cssModules) {
    // 服务端渲染，直接忽略css
    configChain.module
      .rule('css-sass-less')
      .test(/\.(css|scss|less)$/)
      .use('ignore-loader')
      .loader('ignore-loader');
    return;
  }

  // css rule
  generateLoaders('css', configChain, context, options, extractCss);

  // sass rule
  generateLoaders('sass', configChain, context, options, extractCss);

  // less rule
  generateLoaders('less', configChain, context, options, extractCss);

  if (extractCss) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    MiniCssExtractPlugin.__expression = "require('mini-css-extract-plugin')";
    configChain.plugin('mini-css-extract-plugin').use(MiniCssExtractPlugin, [
      {
        filename: config.filenames.css,
      },
    ]);
  }
};
