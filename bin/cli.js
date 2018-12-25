#!/usr/bin/env node

const program = require('commander');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const shell = require('shelljs');
const util = require('util');
const commandExists = require('command-exists').sync;
const os = require('os');
const pkg = require('../package.json');
const getOptions = require('../src/utils/getOptions');
const spinner = require('../src/utils/spinner');
const { logWithSpinner, stopSpinner } = require('../src/utils/spinner');
const { error } = require('../src/utils/logger');
const cache = require('../src/scripts/cache');

const cwd = process.cwd();

process.on('unhandledRejection', err => {
  throw err;
});

program
  .version(pkg.version)
  .option('-P, --proxy <proxy>', '设置代理')
  .option('-x, --defaultProxy', '使用内网代理', false);

program
  .command('create [dir] [template] ')
  .description('初始化项目')
  .action((dir, template, options) => {
    require('../src/commands/create')(dir, template, options);
  });

program
  .command('dev')
  .description('启动开发者模式')
  .option('-s, --ssr', '服务端渲染开发调试')
  .option('-p, --port <port>', '配置开发者服务器监听端口')
  .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译')
  .option('--no-eslint', '禁用eslint检测代码')
  .action(options => {
    require('../src/commands/dev')(options);
  });

program
  .command('build')
  .description('构建生产包')
  .option('-d, --dist <dist>', '配置构建文件生成目标目录', 'dist')
  .option('-a, --analyzer', '开启构建分析', false)
  .option('-m, --use-smp', '分析构建耗时', false)
  .option('-s, --source-map', '是否生成source-map,默认false', false)
  .option('--no-mini', '禁用压缩代码')
  .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译')
  .option('--no-silent', '输出日志')
  .option('--dev', '环境变量使用development')
  .action(options => {
    require('../src/commands/build')(options);
  });

// program
//   .command('ssr')
//   .description('构建直出JS包，以及拷贝HTML文件')
//   .option('-p, --port <port>', '配置监听端口', 8081)
//   .option('--cache-dir <dir>', '编译阶段缓存目录,加速二次编译')
//   .action(options => {
//     require('../src/commands/ssr')(options);
//   });

program
  .command('test')
  .description('运行 jest 测试')
  .option('--coverage', 'coverage')
  .option('--watchAll', 'watch')
  .option('--env', 'environment')
  .action(options => {
    require('../src/commands/test')(options);
  });

program
  .command('check')
  .description('检测代码是否合并主干')
  .action(options => {
    require('../src/commands/check.js')(options);
  });
program
  .command('clean')
  .description('清理缓存文件')
  .action(async () => {
    spinner.logWithSpinner('清理缓存');
    const options = getOptions({});
    await fs.emptyDir(options.cache);
    spinner.stopSpinner();
  });
program
  .command('cache <cmd>')
  .description('缓存node_modules加速构建,使用方法：imt cache [cmd]. cmd 是配置的 npm scripts key')
  .action(async cmd => {
    const options = getOptions({});
    cache({ cmd, cache: options.cache });
  });
const initChoices = [
  { name: '添加 提交前 lint 和 prettier', value: 'lint' },
  { name: '添加 commit msg规范检测', value: 'commit' },
];
program
  .command('add [type]')
  .description('添加项目配置,支持:lint,commit')
  .action(async (type, options) => {
    if (!type) {
      ({ type } = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: '选择初始化内容！',
          choices: initChoices,
        },
      ]));
    }
    const choice = initChoices.find(i => i.value === type);
    if (choice) {
      const pkgFile = path.join(cwd, 'package.json');
      const pPkg = require(pkgFile);
      shell.cd(cwd);
      let npmCmd = 'npm';
      if (commandExists('tnpm')) {
        npmCmd = 'tnpm';
      }
      switch (type) {
        case 'lint':
          pPkg['lint-staged'] = {
            '*.{json,css,scss,md}': ['prettier --write', 'git add'],
            '*.{jsx,js}': ['prettier --write', 'eslint --fix', 'git add'],
          };
          pPkg.husky = pPkg.husky || {};
          pPkg.husky.hooks = pPkg.husky.hooks || {};
          pPkg.husky.hooks['pre-commit'] = 'lint-staged';
          logWithSpinner('添加配置信息');
          fs.writeFileSync(pkgFile, JSON.stringify(pPkg, null, 2));
          logWithSpinner('安装依赖：husky,prettier,lint-staged');
          await util.promisify(shell.exec)(`${npmCmd} i husky prettier lint-staged -D`, { silent: true });
          stopSpinner();
          break;
        case 'commit': {
          logWithSpinner('安装依赖：commitlint-config-imt');
          await util.promisify(shell.exec)(`${npmCmd} i commitlint-config-imt -D`, { silent: true });
          logWithSpinner('初始化commit配置');
          const cmd = `./node_modules/.bin/imt-commit${os.platform() === 'win32' ? '.cmd' : ''}`;
          await util.promisify(shell.exec)(cmd, { silent: true });
          stopSpinner();
          break;
        }
        default:
      }
    } else {
      error(`不支持该选项: ${type}`);
      options.outputHelp();
    }
  });

program.command('*').action(options => {
  error(`找不到命令: ${options}`);
  program.outputHelp();
});
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
