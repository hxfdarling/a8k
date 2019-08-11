import loadConfig from '@a8k/cli-utils/load-config';
import { logger } from '@a8k/common';
import { BUILD_ENV } from '@a8k/common/lib/constants';
import path from 'path';
import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { IResolveWebpackConfigOptions } from '../../interface';
import { genCssModulesName } from './utils';

const testMap = {
  css: /\.(css)$/,
  sass: /\.(scss)$/,
  less: /\.(less)$/,
};
let warnOnce = false;
export class GenerateLoaders {
  public rule: WebpackChain.Rule;
  public context: A8k;
  public options: IResolveWebpackConfigOptions;
  public cacheDirectory: string;
  constructor(rule: WebpackChain.Rule, context: A8k, options: IResolveWebpackConfigOptions) {
    this.cacheDirectory = path.join(context.config.cacheDirectory, 'cache-loader-css');
    this.rule = rule;
    this.context = context;
    this.options = options;
  }
  public value() {
    return this.rule;
  }
  public addLessLoader(options = {}): GenerateLoaders {
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
  public addSassLoader(options: any = {}): GenerateLoaders {
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
        ...options,
      })
      .end();
    return this;
  }
  public addPostCssLoader(options: any = {}): GenerateLoaders {
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
              // "postcss-custom-properties": "^6.3.1", 该版本支持下面的语法
              // --primary: var(--customPrimary, var(--green)); 语法处理存在bug
              // 'custom-properties': false,
            },
          }),
          // require('postcss-custom-properties'),
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
        ...options,
      })
      .end();
    return this;
  }
  public addCssLoader(
    options: {
      importLoaders?: number;
      sourceMap?: boolean;
      modules?: boolean;
      [key: string]: any;
    } = {}
  ): GenerateLoaders {
    let modules = this.context.config.cssModules;
    if (modules) {
      if (modules === true) {
        modules = {};
      }
      if (modules.localIdentName && !warnOnce) {
        warnOnce = true;
        logger.warn(`you can't override cssModules.localIdentName`);
      }
      modules = { ...modules, localIdentName: genCssModulesName(this.context) };
    }
    this.rule = this.rule
      .use('css-loader')
      .loader('css-loader')
      .options({
        modules,
        ...options,
      })
      .end();
    return this;
  }
  public addBaseLoader(): GenerateLoaders {
    const {
      context,
      cacheDirectory,
      options: { sourceMap, extractCss },
    } = this;

    if (!extractCss) {
      this.rule = this.rule
        .use('style-loader')
        .loader('style-loader')
        .options({
          // https://github.com/webpack-contrib/style-loader/issues/107
        })
        .end();
    } else {
      const MiniCssExtractPlugin = require('mini-css-extract-plugin');
      this.rule = this.rule
        .use('MiniCssExtractPlugin.loader')
        .loader(MiniCssExtractPlugin.loader)
        .options({
          hmr: context.internals.mode === BUILD_ENV.DEVELOPMENT,
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
      .end();

    return this;
  }
}

export default (
  type: 'sass' | 'less' | 'css',
  configChain: WebpackChain,
  context: A8k,
  options: IResolveWebpackConfigOptions
) => {
  const modules = context.config.cssModules;
  const rule = configChain.module.rule(type).test(testMap[type]);
  const gen = new GenerateLoaders(rule, context, options);
  gen.addBaseLoader();

  let noModuleGen;
  if (modules) {
    // 如果是css modules模式，理论上只需要处理src目录下面的
    // 其他目录比如node_modules不需要转换为css modules
    gen.rule.include.add(context.resolve('src'));
    noModuleGen = new GenerateLoaders(
      configChain.module.rule(type + '-no-modules').test(testMap[type]),
      context,
      options
    );
    noModuleGen.rule.exclude.add(context.resolve('src'));
    noModuleGen.addBaseLoader();
  }

  switch (type) {
    case 'css':
      gen
        .addCssLoader({
          importLoaders: 1,
        })
        .addPostCssLoader();
      if (noModuleGen) {
        noModuleGen
          .addCssLoader({
            importLoaders: 1,
            modules: false,
          })
          .addPostCssLoader();
      }
      break;
    case 'sass':
      gen
        .addCssLoader({
          importLoaders: 2,
        })
        .addPostCssLoader()
        .addSassLoader();
      if (noModuleGen) {
        noModuleGen
          .addCssLoader({
            importLoaders: 2,
            modules: false,
          })
          .addPostCssLoader()
          .addSassLoader();
      }
      break;
    case 'less':
      gen
        .addCssLoader({
          importLoaders: 2,
        })
        .addPostCssLoader()
        .addLessLoader();
      if (noModuleGen) {
        noModuleGen
          .addCssLoader({
            importLoaders: 2,
            modules: false,
          })
          .addPostCssLoader()
          .addLessLoader();
      }
      break;
  }
};
