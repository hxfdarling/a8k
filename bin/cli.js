#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');

program.version(pkg.version).option('-P, --proxy <proxy>', '设置代理');

program
  .command('create [template] [dir]')
  .description('初始化项目')
  .action((template, dir, options) => {
    require('../src/commands/create')(template, dir, options);
  });

program
  .command('dev')
  .description('启动开发者模式')
  .option('-p, --port <port>', '配置开发者服务器监听端口,默认端口:8899', 8899)
  .action(options => {
    require('../src/commands/dev')(options);
  });

program
  .command('build')
  .description('构建生产包')
  .option('-d, --dist <dist>', '配置构建文件生成目标目录,默认:dist', 'dist')
  .option('-m, --no-mini', '是否压缩，默认压缩代码')
  .option('-s, --source-map [bool]', '是否生成source-map,默认false', false)
  .action(options => {
    require('../src/commands/build')(options);
  });

program
  .command('server')
  .description('运行node服务器，测试直出环境')
  .option('-p, --port <port>', '配置监听端口，默认:8081', 8081)
  .action(options => {
    require('../src/commands/build')(options);
  });

program
  .command('release [mode]')
  .description('发布项目，[mode]发布模块，支持static、node, 默认static')
  .option('-e, --env <env>', '选择部署环境,默认:nohost', /^(nohost|test|preview|public)$/i, 'nohost')
  .action((mode, options) => {
    require('../src/commands/release')(mode, options);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
} else if (program.proxy) {
  process.env.proxy = program.proxy;
}
