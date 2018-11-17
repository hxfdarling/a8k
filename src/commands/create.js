const download = require('download-git-repo');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const shell = require('shelljs');
const util = require('util');
const { spawnSync } = require('child_process');

const cwd = process.cwd();

const Imt = require('../');

// 内置模板，提供选择
const defaultTemplates = [{ name: 'React应用', value: 'hxfdarling/imt-react-template' }];
class ImtCreate extends Imt {
  constructor(dir, template, options) {
    super(options);

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

  downloadTemplate() {
    const { template } = this;
    const spinner = ora('模板下载中').start();
    return new Promise(resolve => {
      download(template, this.templateDir, {}, error => {
        if (error) {
          spinner.fail(`下载模板失败:${template},请确认网络是否正常`);
          console.error(error);
          process.exit(1);
        } else {
          spinner.succeed('模板下载成功');
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

  async getTemplate() {
    let { template } = this;
    if (!template) {
      ({ template } = await inquirer.prompt([
        {
          name: 'template',
          message: '选择内置模板',
          type: 'list',
          choices: defaultTemplates,
        },
      ]));
    }
    if (/\.zip$/.test(template)) {
      template = `direct:${template}`;
    }
    this.template = template;
  }

  create() {
    const { templateDir } = this;
    this.hooks.beforeCreate.callAsync(this, async () => {
      await this.confirmDir();
      await this.getTemplate();
      await this.downloadTemplate();

      const spinner = ora('初始化模板').start();

      shell.cd(templateDir);
      let npmCmd = 'npm';

      if (!shell.exec('tnpm -v', { silent: true }).stderr) {
        npmCmd = 'tnpm';
      }

      await util.promisify(shell.exec)(`${npmCmd} i`, { silent: true });

      spinner.succeed('模板初始化完毕');
      const main = require(`${templateDir}/package.json`).main || 'index.js';
      spawnSync('node', [`.template/${main}`], {
        cwd: this.projectDir,
        stdio: 'inherit',
      });
      fs.emptyDirSync(templateDir);
      fs.removeSync(templateDir);

      this.hooks.afterCreate.callAsync(this, async () => {
        spinner.succeed('项目创建完毕');
      });
    });
  }
}

module.exports = (dir, template, argv) => {
  new ImtCreate(dir, template, argv).create();
};
