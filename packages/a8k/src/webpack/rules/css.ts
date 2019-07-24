import { BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { IResolveWebpackConfigOptions } from '../../interface';
import generateLoaders from './generate-loaders';

export default (configChain: WebpackChain, context: A8k, options: IResolveWebpackConfigOptions) => {
  const { type } = options;
  const { config } = context;
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
  generateLoaders('css', configChain, context, options);

  // sass rule
  generateLoaders('sass', configChain, context, options);

  // less rule
  generateLoaders('less', configChain, context, options);

  if (options.extractCss) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    MiniCssExtractPlugin.__expression = "require('mini-css-extract-plugin')";
    configChain.plugin('mini-css-extract-plugin').use(MiniCssExtractPlugin, [
      {
        filename: config.filenames.css,
      },
    ]);
  }
};
