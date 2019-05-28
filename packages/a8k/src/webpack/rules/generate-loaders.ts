import loadConfig from '@a8k/cli-utils/load-config';
import logger from '@a8k/cli-utils/logger';
import path from 'path';
import WebpackChain from 'webpack-chain';
import A8k from '../..';

const testMap = {
  css: /\.(css)$/,
  sass: /\.(scss)$/,
  less: /\.(less)$/,
};

export class GenerateLoaders {
  rule: WebpackChain.Rule;
  context: A8k;
  options: { type: string; ssr: boolean; cssSourceMap: boolean; sourceMap: boolean };
  cacheDirectory: string;
  constructor(rule: WebpackChain.Rule, context: A8k, options) {
    this.cacheDirectory = path.join(context.config.cache, 'cache-loader-css');
    this.rule = rule;
    this.context = context;
    this.options = options;
  }
  value() {
    return this.rule;
  }
  addLessLoader(options = {}): GenerateLoaders {
    const {
      context,
      options: { sourceMap },
    } = this;
    this.rule = this.rule
      .use('less-loader')
      .loader('less-loader')
      .options({
        paths: [
          // 支持绝对路径查找
          context.resolve('src'),
          context.resolve('node_modules'),
        ],
        // Enable Inline JavaScript
        javascriptEnabled: true,
        sourceMap,
        ...options,
      })
      .end();
    return this;
  }
  addSassLoader(): GenerateLoaders {
    const {
      context,
      options: { sourceMap },
    } = this;
    this.rule = this.rule
      .use('sass-loader')
      .loader('sass-loader')
      .options({
        implementation: require('sass'),
        includePaths: [
          // 支持绝对路径查找,项目与项目目录
          context.resolve('src'),
          context.resolve('node_modules'),
        ],
        sourceMap,
      })
      .end();
    return this;
  }
  addPostCssLoader(): GenerateLoaders {
    const {
      context,
      options: { sourceMap },
    } = this;
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
    this.rule = this.rule
      .use('postcss-loader')
      .loader('postcss-loader')
      .options({
        sourceMap,
        ...postCssConfig,
      })
      .end();
    return this;
  }

  addBaseLoader({
    importLoaders,
    needExtraCss,
  }: {
    importLoaders: number;
    needExtraCss: boolean;
  }): GenerateLoaders {
    const {
      context,
      cacheDirectory,
      options: { sourceMap, cssSourceMap },
    } = this;

    if (!needExtraCss) {
      this.rule = this.rule
        .use('style-loader')
        .loader('style-loader')
        .options({
          // https://github.com/webpack-contrib/style-loader/issues/107
          singleton: !cssSourceMap,
          sourceMap,
        })
        .end();
    } else {
      const MiniCssExtractPlugin = require('mini-css-extract-plugin');
      this.rule = this.rule
        .use('MiniCssExtractPlugin.loader')
        .loader(MiniCssExtractPlugin.loader)
        .options({
          publicPath: context.config.publicPath,
          sourceMap,
        })
        .end();
    }

    this.rule = this.rule
      .use('cache-loader')
      .loader('cache-loader')
      .options({
        cacheDirectory,
      })
      .end()
      .use('css-loader')
      .loader('css-loader')
      .options({
        importLoaders,
        sourceMap,
      })
      .end();

    return this;
  }
}

export default (
  type: 'sass' | 'less' | 'css',
  config: WebpackChain,
  context: A8k,
  options,
  needExtraCss: boolean
) => {
  const rule = config.module.rule(type).test(testMap[type]);
  const gen = new GenerateLoaders(rule, context, options);

  switch (type) {
    case 'css':
      gen
        .addBaseLoader({
          needExtraCss,
          importLoaders: 1,
        })
        .addPostCssLoader();
      break;
    case 'sass':
      gen
        .addBaseLoader({
          needExtraCss,
          importLoaders: 2,
        })
        .addPostCssLoader()
        .addSassLoader();
      break;
    case 'less':
      gen
        .addBaseLoader({
          needExtraCss,
          importLoaders: 2,
        })
        .addPostCssLoader()
        .addLessLoader();
      break;
  }
};
