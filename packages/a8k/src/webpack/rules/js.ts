import loadConfig from '@a8k/cli-utils/load-config';
import { logger } from '@a8k/common';
import { BUILD_ENV, BUILD_TARGET } from '@a8k/common/lib/constants';
import path from 'path';
import WebpackChain from 'webpack-chain';
import A8k from '../..';
import { IResolveWebpackConfigOptions } from '../../interface';
import { genCssModulesName } from './utils';

export default (
  configChain: WebpackChain,
  context: A8k,
  { type }: IResolveWebpackConfigOptions
) => {
  const { babel: { include = [], exclude = [] } = {}, cssModules, cacheDirectory } = context.config;
  const { mode } = context.internals;

  // TODO 需要抽离成插件？
  // 加载 imui 里的 // @require '.css'
  configChain.module
    .rule('imui')
    .test(/\.js$/)
    .include.add(context.resolve('node_modules/imui'))
    .end()
    .use('comment-require-loader')
    .loader('comment-require-loader')
    .options({});

  let rule = configChain.module
    .rule('js')
    .test(/\.(js|mjs|jsx)$/)
    .include // 热重载插件需要被编译
    .add(context.resolve('src'))
    .add(context.resolve('node_modules/lodash-es/'));
  // 开发模式注入的代码,需要编译，否则 ie 下面不支持const语法
  // .add(path.resolve(require.resolve('@a8k/dev-utils/webpackHotDevClient'), '../'))
  // .add(/strip-ansi|chalk|ansi-styles|ansi-regex/);

  // 自定义babel处理内容
  include.forEach(i => (rule = rule.add(i)));

  rule = rule
    .end()
    // 忽略哪些压缩的文件
    .exclude.add(/(.|_)min\.js$/);

  // 自定义babel忽略内容
  exclude.forEach(i => (rule = rule.add(i)));

  const res = loadConfig.loadSync({
    files: ['babel.config.js', '.babelrc.js', '.babelrc', 'package.json'],
    cwd: context.options.baseDir,
    packageKey: 'babel',
  });
  const babelrc = !!res.path;

  if (babelrc) {
    logger.debug(`Applying custom babel config at ${res.path}`);
    logger.info(`babel config in you project, may be a8k internal config override you config`);
  } else {
    logger.debug('Applying buildint babel config');
  }

  rule
    .end()
    .use('babel-loader')
    .loader('babel-loader')
    .options({
      babelrc,
      // cacheDirectory 缓存babel编译结果加快重新编译速度
      cacheDirectory: path.resolve(cacheDirectory, 'babel-loader'),
      presets: [
        [
          require.resolve('@a8k/babel-preset'),
          { target: type === BUILD_TARGET.NODE ? 'node' : 'browser' },
        ],
      ],
      plugins: [
        cssModules && [
          require.resolve('babel-plugin-react-css-modules'),
          {
            filetypes: {
              '.less': {
                syntax: 'postcss-less',
              },
              '.scss': {
                syntax: 'postcss-scss',
              },
              '.styl': {
                syntax: 'sugarss',
              },
            },
            generateScopedName: genCssModulesName(context),
            autoResolveMultipleImports: true,
            webpackHotModuleReloading: mode === BUILD_ENV.DEVELOPMENT,
            handleMissingStyleName: 'warn',
          },
        ],
        mode === BUILD_ENV.DEVELOPMENT && require.resolve('react-hot-loader/babel'),
      ].filter(Boolean),
    });
};
