#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .option('-P, --proxy <proxy>', '设置代理')
  .option('-x, --defaultProxy', '使用内网代理', false);

program
  .command('create [template] [dir]')
  .description('初始化项目')
  .action((template, dir, options) => {
    require('../src/commands/create')(template, dir, options);
  });

program
  .command('dev [dir]')
  .description('启动开发者模式')
  .option('-p, --port <port>', '配置开发者服务器监听端口')
  .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译', 'node_modules/.cache/')
  .action((dir, options) => {
    require('../src/commands/dev')(dir, options);
  });

program
  .command('build [dir]')
  .description('构建生产包')
  .option('-d, --dist <dist>', '配置构建文件生成目标目录', 'dist')
  .option('--no-mini', '禁用压缩代码')
  .option('-a, --analyzer', '开启构建分析', false)
  .option('-m, --use-smp', '分析构建耗时', false)
  .option('-s, --source-map', '是否生成source-map,默认false', false)
  .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译', 'node_modules/.cache/')
  .action((dir, options) => {
    require('../src/commands/build')(dir, options);
  });

program
  .command('ssr [dir]')
  .description('构建直出JS包，以及拷贝HTML文件')
  .option('-p, --port <port>', '配置监听端口', 8081)
  .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译', 'node_modules/.cache/')
  .action((dir, options) => {
    require('../src/commands/ssr')(dir, options);
  });

program
  .command('release [mode]')
  .description('发布项目，[mode]发布模块，支持static、node, 默认static')
  .option('-e, --env <env>', '选择部署环境', /^(nohost|test|preview|public)$/i, 'nohost')
  .action((mode, options) => {
    require('../src/commands/release')(mode, options);
  });
program
  .command('check')
  .description('检测代码是否合并主干')
  .action(options => {
    require('../src/commands/check.js')(options);
  });
program
  .command('pack')
  .description('打包')
  .action(() => {});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
} else if (program.proxy) {
  process.env.proxy = program.proxy;
}
