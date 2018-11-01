const download = require('download-git-repo');
const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const shell = require('shelljs');
const { spawnSync } = require('child_process');

const cwd = process.cwd();
const { AsyncSeriesWaterfallHook } = require('tapable');

const Imt = require('../');

class ImtCreate extends Imt {
  constructor({ template, dir, ...options }) {
    super(options);
    if (/\.zip$/.test(template)) {
      template = `direct:${template}`;
    }

    this.template = template;

    if (!dir) {
      dir = cwd;
    } else {
      dir = path.join(cwd, dir);
    }
    fs.ensureDir(dir);

    this.projectDir = dir;
    this.projectName = path.basename(dir);
    this.templateDir = path.join(this.projectDir, '.template');
  }

  initHooks() {
    this.hooks = {
      beforeCreate: new AsyncSeriesWaterfallHook(['options']),
      afterCreate: new AsyncSeriesWaterfallHook(['options']),
    };
  }

  downloadTemplate() {
    const { template } = this;
    const spinner = ora('模板下载中').start();
    return new Promise(resolve => {
      download(template, this.templateDir, {}, error => {
        if (error) {
          console.log(chalk.red(`下载模板失败:${template},请确认网络是否正常`));
          console.error(error);
          process.exit(1);
        } else {
          spinner.stop();
          console.log(chalk.green('模板下载成功'));
          resolve();
        }
      });
    });
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
    const { templateDir } = this;
    this.hooks.beforeCreate.callAsync(this, async () => {
      await this.confirmDir();
      await this.downloadTemplate();
      console.log(chalk.yellow('初始化模板'));
      shell.cd(templateDir);
      let npmCmd = 'npm';
      if (!shell.exec('tnpm -v', { silent: true }).stderr) {
        npmCmd = 'tnpm';
      }
      shell.exec(`${npmCmd} i`, { silent: true });
      spawnSync('node', ['.template/bin/cli.js'], {
        cwd: this.projectDir,
        stdio: 'inherit',
      });
      fs.emptyDirSync(templateDir);
      fs.removeSync(templateDir);

      this.hooks.afterCreate.callAsync(this, async () => {
        console.log(chalk.green('项目初始化完毕'));
      });
    });
  }
}

module.exports = (template, dir, { plugins, proxy }) => {
  new ImtCreate({ template, dir, plugins, proxy }).create();
};
