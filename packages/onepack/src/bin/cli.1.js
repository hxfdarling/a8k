#!/usr/bin/env node
import program from 'commander';

// 自动版本检测
require('../scripts/check_latest');

process.on('unhandledRejection', err => {
  throw err;
});

program
  .command('create [dir]')
  .description('初始化项目')
  .action((dir, options) => {
    require('../commands/create')(dir, options);
  });

program
  .command('dev')
  .description('启动开发者模式')
  .option('-s, --ssr', '服务端渲染开发调试')
  .option('-p, --port <port>', '配置开发者服务器监听端口')
  .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译')
  .option('--no-eslint', '禁用eslint检测代码')
  .option('-c, --css-source-map', '使用cssSourceMap ，但会导致开发模式 FOUC')
  .action(options => {
    require('../commands/dev')(options);
  });

program
  .command('build')
  .description('构建生产包')
  .option('-d, --dist <dist>', '配置构建文件生成目标目录')
  .option('-a, --analyzer', '开启构建分析', false)
  .option('-m, --use-smp', '分析构建耗时', false)
  .option('-s, --source-map', '是否生成source-map,默认false', false)
  .option('--no-mini', '禁用压缩代码')
  .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译')
  .option('--no-silent', '输出日志')
  .option('--dev', '环境变量使用development')
  .action(options => {
    require('../commands/build').default(options);
  });

program
  .command('test')
  .description('运行 jest 测试')
  .option('--coverage', 'coverage')
  .option('--watchAll', 'watch')
  .option('--env', 'environment')
  .action(options => {
    require('../commands/test')(options);
  });
