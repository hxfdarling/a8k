'use strict';
const storybook = require('storybook-react-tmp/standalone');
const path = require('path');

exports.apply = context => {
  const { config, options } = context;
  context
    .registerCommand('sb [mode] [port]')
    .description('开启storybook测试组件')
    .action(async (mode = 'dev', port = 9009) => {
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
        configDir: path.resolve(options.baseDir, '.storybook'), // 获取业务工程的storybook配置
        webpackConfig(config) {
          // 直接覆盖rules，否则scss编译会有问题
          config.module.rules = webpackConfig.module.rules;
          config.resolve = webpackConfig.resolve;
          config.resolveLoader = webpackConfig.resolveLoader;
          return config;
        },
      });
      await context.hooks.invokePromise(context);
    });
}

exports.name = 'builtin:storybook for react';
