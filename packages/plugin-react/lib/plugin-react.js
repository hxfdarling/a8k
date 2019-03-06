const getNpmCommand = require('@onepack/cli-utils/npm');
const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const ora = require('ora');
const path = require('path');
const shell = require('shelljs');
const util = require('util');

module.exports = {
  apply: context => {
    const { config, options } = context;
    context.registerCommand('create [dir] [type]', '初始化项目', async (dir, type) => {
      const projectDir = path.join(options.baseDir, dir || '');
      const templateDir = path.join(__dirname, '../templates/');

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
      spawnSync('node', [path.join(templateDir, 'index.js')], {
        cwd: projectDir,
        stdio: 'inherit',
      });
      const spinner = ora('安装依赖').start();
      const npmCmd = getNpmCommand();
      shell.cd(projectDir);
      await util.promisify(shell.exec)(`${npmCmd} i`, { silent: true });
      spinner.succeed('安装依赖完毕');
      await context.hooks.invokePromise(context);
      spinner.succeed('项目创建完毕');
    });
  },
  name: 'builtin:react',
};
