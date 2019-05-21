import loadConfig from '@a8k/cli-utils/load-config';
import logger from '@a8k/cli-utils/logger';
import path from 'path';
import WebpackChain from 'webpack-chain';
import { ENV_PROD, TYPE_SERVER } from '../../const';
import A8k from '../..';

export default (
  config: WebpackChain,
  context: A8k,
  { type, ssr, cssSourceMap, sourceMap },
  filename: string
) => {
  if (type === TYPE_SERVER) {
    // 服务端渲染，直接忽略css
    config.module
      .rule('css')
      .test(/\.(scss|css)$/)
      .use('ignore-loader')
      .loader('ignore-loader');
    return;
  }

  const hasPostCSSConfig = loadConfig.resolveSync({
    files: [
      'postcss.config.js',
      'package.json',
      '.postcssrc',
      '.postcssrc.js',
      '.postcssrc.yaml',
      '.postcssrc.json',
    ],
    packageKey: 'postcss',
    cwd: context.options.baseDir,
  });
  let postCssConfig = {};
  if (hasPostCSSConfig) {
    logger.debug(`Applying custom PostCSS config at ${hasPostCSSConfig}`);
  } else {
    logger.debug('Applying buildint PostCSS config');
    postCssConfig = {
      plugins: [
        require('postcss-preset-env')({
          autoprefixer: {
            // flexbox: 'no-2009',// 修复不支持-webkit-box语法
          },
          stage: 3,
          features: {
            // --primary: var(--customPrimary, var(--green)); 语法处理存在bug
            'custom-properties': false,
          },
          browsers: [
            'Firefox >= 20',
            'Safari >= 6',
            'Explorer >= 9',
            'Chrome >= 21',
            'Android >= 4.0',
          ],
        }),
        require('postcss-custom-properties'),
        // stone-ui 中有用到
        require('postcss-color-function'),
      ].filter(Boolean),
    };
  }

  const rule = config.module
    .rule('css')
    .test(/\.(scss|css)$/)
    .use('cache-loader')
    .loader('cache-loader')
    .options({
      cacheDirectory: path.join(context.config.cache, 'cache-loader-css'),
    })
    .end()
    .use('css-loader')
    .loader('css-loader')
    .options({
      importLoaders: 2,
      sourceMap,
    })
    .end()
    .use('postcss-loader')
    .loader('postcss-loader')
    .options({
      sourceMap,
      ...postCssConfig,
    })
    .end()
    .use('sass-loader')
    .loader('sass-loader')
    .options({
      implementation: require('sass'),
      includePaths: [
        // 支持绝对路径查找
        context.resolve('src'),
      ],
      sourceMap,
    })
    .end();

  // 生产模式和服务器渲染调试时，开启这个模式防止样式抖动
  const needExtraCss = context.internals.mode === ENV_PROD || ssr;

  if (!needExtraCss) {
    rule
      .use('style-loader')
      .before('cache-loader')
      .loader('style-loader')
      .options({
        // https://github.com/webpack-contrib/style-loader/issues/107
        singleton: !cssSourceMap,
        sourceMap,
      })
      .end();
  } else {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');

    rule
      .use('MiniCssExtractPlugin.loader')
      .before('cache-loader')
      .loader(MiniCssExtractPlugin.loader)
      .options({
        publicPath: context.config.publicPath,
        sourceMap,
      })
      .end();

    MiniCssExtractPlugin.__expression = "require('mini-css-extract-plugin')";
    config.plugin('mini-css-extract-plugin').use(MiniCssExtractPlugin, [{ filename }]);
  }
};
