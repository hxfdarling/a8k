const getNpmCommand = require('@a8k/cli-utils/npm');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const ora = require('ora');
const path = require('path');
const shell = require('shelljs');
const util = require('util');
const { PROJECT_MODE_SINGLE, PROJECT_MODE_MULTI } = require('a8k/lib/const');
const createGenerator = require('./create');

exports.apply = context => {
  const { config, options } = context;
  context
    .registerCommand('create [dir] [type]')
    .description('初始化项目')
    .action(async (dir, type) => {
      const projectDir = path.join(options.baseDir, dir || '');

      config.createConfig = {
        type,
        projectName: path.basename(projectDir),
      };
      fs.ensureDir(projectDir);
      const files = await fs.readdir(projectDir);
      if (files.length) {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: '初始化目录不为空, 是否继续?',
            default: true,
          },
        ]);
        if (!answer.continue) {
          process.exit(0);
        }
      }

      await createGenerator(projectDir);
      console.log('✨  File Generate Done');

      const spinner = ora('安装依赖').start();
      const npmCmd = getNpmCommand();
      shell.cd(projectDir);
      await util.promisify(shell.exec)(`${npmCmd} i`, { silent: true });
      spinner.succeed('安装依赖完毕');
      await context.hooks.invokePromise(context);
      spinner.succeed('项目创建完毕');
    });

  context
    .registerCommand('page')
    .alias('p')
    .description('新建页面')
    .action(async () => {
      switch (config.mode) {
        case PROJECT_MODE_MULTI:
          break;
        case PROJECT_MODE_SINGLE:
          console.log('xxxx');
          break;
        default:
          break;
      }
    });
  context
    .registerCommand('component')
    .alias('c')
    .description('新建组件')
    .action(async () => {
      switch (config.mode) {
        case PROJECT_MODE_MULTI:
          break;
        case PROJECT_MODE_SINGLE:
          break;
        default:
          break;
      }
    });
};
exports.name = 'builtin:react';
