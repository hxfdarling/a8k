const storybook = require('storybook-react-tmp/standalone');
const { logger } = require('@a8k/common');
const fs = require('fs-extra');
const path = require('path');
const initSB = require('./init-sb');

exports.apply = context => {
  const { options } = context;
  context
    .registerCommand('sb-init')
    .description('初始化 storybook 配置')
    .action(async () => {
      const sbConfigPath = path.resolve(options.baseDir, '.storybook');
      const isConfigExists = await fs.pathExists(sbConfigPath);
      if (isConfigExists) {
        logger.error('当前工程已存在.storybook，请自定义配置，执行 k sb 开启 storybook 服务器');
        process.exit(-1);
      }
      await initSB(options.baseDir);
      console.log('✨  storybook init Done');
    });

  context
    .registerCommand('sb')
    .option('-m, --mode [mode]', 'mode', 'dev')
    .option('-p, --port [port]', 'listen port', 9009)
    .option('--inspectWebpack', 'output webpack config info')
    .description('开启storybook测试组件')
    .action(async ({ mode, port, inspectWebpack }) => {
      context.options.inspectWebpack = inspectWebpack;
      const sbConfigPath = path.resolve(options.baseDir, '.storybook');
      const isConfigExists = await fs.pathExists(sbConfigPath);

      if (!isConfigExists) {
        logger.info('当前工程还没执行storybook初始化，请执行 k sb-init 进行初始化配置');
        process.exit(-1);
      }
      // const webpackConfig = context.resolveWebpackConfig(options);
      const env = mode === 'dev' ? 'development' : 'production';
      process.env.NODE_ENV = env;
      process.env.BABEL_ENV = env;
      context.internals.mode = env;
      storybook({
        mode,
        port,
        configDir: sbConfigPath, // 获取业务工程的storybook配置
        webpackConfig: async sbConfig => {
          context.chainWebpack(config => {
            // 合并entry
            config.entry('index').merge(sbConfig.entry);

            config.merge({
              mode: sbConfig.mode,
              output: sbConfig.output,
            });

            // notes需要
            config.module
              .rule('md')
              .test(/\.md$/)
              .use('raw')
              .loader('raw-loader');

            config.module
              .rule('js')
              .use('babel-loader')
              .tap(babelOptions => {
                babelOptions.plugins.push([
                  require.resolve('babel-plugin-react-docgen'),
                  { DOC_GEN_COLLECTION_NAME: 'STORYBOOK_REACT_CLASSES' },
                ]);
                return babelOptions;
              });

            config.resolve.modules.add(path.resolve(__dirname, '../node_modules/'));
          });
          const resultConfig = context.resolveWebpackConfig({ ...options, type: 'storybook' });
          // 使用 storybook html插件配置
          resultConfig.plugins.push(sbConfig.plugins[0]);
          return resultConfig;
        },
      });
    });
};

exports.name = 'builtin:storybook for react';
