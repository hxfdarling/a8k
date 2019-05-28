import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { ENV_PROD, TYPE_SERVER } from '../../const';
import GenCss from './gen-css';

export default (config: WebpackChain, context: A8k, options, filename: string) => {
  const { type, ssr } = options;
  // 生产模式和服务器渲染调试时，开启这个模式防止样式抖动
  const needExtraCss = context.internals.mode === ENV_PROD || ssr;

  if (type === TYPE_SERVER) {
    // 服务端渲染，直接忽略css
    config.module
      .rule('css-sass-less')
      .test(/\.(css|scss|less)$/)
      .use('ignore-loader')
      .loader('ignore-loader');
    return;
  }

  new GenCss(config.module.rule('css').test(/\.css$/), context, options)
    .addBaseLoader({
      needExtraCss,
      importLoaders: 1,
    })
    .addPostCssLoader();

  new GenCss(config.module.rule('sass').test(/\.(scss)$/), context, options)
    .addBaseLoader({
      needExtraCss,
      importLoaders: 2,
    })
    .addPostCssLoader()
    .addSassLoader();

  if (needExtraCss) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    MiniCssExtractPlugin.__expression = "require('mini-css-extract-plugin')";
    config.plugin('mini-css-extract-plugin').use(MiniCssExtractPlugin, [{ filename }]);
  }
};
