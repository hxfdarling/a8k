const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const shell = require('shelljs');
const util = require('util');
const { spawnSync } = require('child_process');
const commandExists = require('command-exists').sync;

const cwd = process.cwd();

const Imt = require('../');

// 内置模板，提供选择
class ImtCreate extends Imt {
  constructor(dir, options) {
    super(options);

    dir = path.join(cwd, dir || '');

    this.projectDir = dir;
    this.projectName = path.basename(dir);
    this.templateDir = path.join(__dirname, '../../templates/');
  }

  async confirmDir() {
    const files = await fs.readdir(this.projectDir);
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
  }

  create() {
    fs.ensureDir(this.projectDir);
    this.hooks.beforeCreate.callAsync(this, async () => {
      await this.confirmDir();

      spawnSync('node', [path.join(this.templateDir, 'index.js')], {
        cwd: this.projectDir,
        stdio: 'inherit',
      });
      const spinner = ora('安装依赖').start();
      const npmCmd = commandExists('tnpm') ? 'tnpm' : 'npm';
      shell.cd(this.projectDir);
      await util.promisify(shell.exec)(`${npmCmd} i`, { silent: true });
      spinner.succeed('安装依赖完毕');

      this.hooks.afterCreate.callAsync(this, async () => {
        spinner.succeed('项目创建完毕');
      });
    });
  }
}

module.exports = (dir, template, argv) => {
  new ImtCreate(dir, template, argv).create();
};
