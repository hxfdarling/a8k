const storybook = require('storybook-react-tmp/standalone');
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
        throw new Error(`当前工程已存在.storybook，请自定义配置，执行 k sb start 开启 storybook 服务器`);
      }
      await initSB(sbConfigPath);
      console.log('✨  storybook init Done');
    });
  
  context
    .registerCommand('sb-start [mode] [port]')
    .description('开启storybook测试组件')
    .action(async (mode = 'dev', port = 9009) => {

      const sbConfigPath = path.resolve(options.baseDir, '.storybook');
      const isConfigExists = await fs.pathExists(sbConfigPath);

      if (!isConfigExists) {
        throw new Error(`当前工程还没执行storybook初始化，请执行 k sb init 进行初始化配置`);
      }
      context.chainWebpack((config) => {
        // 添加 markdown文件解析
        config.module
          .rule('md')
          .test(/\.md$/)
          .use('raw')
          .loader('raw-loader');
      });
      const webpackConfig = context.resolveWebpackConfig(options);
      process.env.BABEL_ENV = mode === 'dev' ? 'development' : 'production';
      storybook({
        mode,
        port,
        configDir: sbConfigPath, // 获取业务工程的storybook配置
        // debugWebpack: true,
        webpackConfig(config) {
          // 直接覆盖rules，否则scss编译会有问题
          config.module.rules = webpackConfig.module.rules;
          config.resolve = webpackConfig.resolve;
          config.resolveLoader = webpackConfig.resolveLoader;
          return config;
        },
      });
    });
};

exports.name = 'builtin:storybook for react';
