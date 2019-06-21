import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { BUILD_ENV, BUILD_TARGET } from '../../const';
import { IResolveWebpackConfigOptions } from '../../interface';
import generateLoaders from './generate-loaders';

export default (
  config: WebpackChain,
  context: A8k,
  options: IResolveWebpackConfigOptions,
  filename: string
) => {
  const { type, ssr } = options;
  // 生产模式和服务器渲染调试时，开启这个模式防止样式抖动
  const needExtraCss = context.internals.mode === BUILD_ENV.PRODUCTION || ssr;

  if (type === BUILD_TARGET.NODE) {
    // 服务端渲染，直接忽略css
    config.module
      .rule('css-sass-less')
      .test(/\.(css|scss|less)$/)
      .use('ignore-loader')
      .loader('ignore-loader');
    return;
  }

  // css rule
  generateLoaders('css', config, context, options, needExtraCss);

  // sass rule
  generateLoaders('sass', config, context, options, needExtraCss);

  // less rule
  generateLoaders('less', config, context, options, needExtraCss);

  if (needExtraCss) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    MiniCssExtractPlugin.__expression = "require('mini-css-extract-plugin')";
    config.plugin('mini-css-extract-plugin').use(MiniCssExtractPlugin, [{ filename }]);
  }
};
