import logger from '@onepack/cli-utils/logger';
import { logWithSpinner, stopSpinner } from '@onepack/cli-utils/spinner';
import { sync as commandExists } from 'command-exists';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import os from 'os';
import path from 'path';
import shell from 'shelljs';
import util from 'util';

const initChoices = [
  { name: '添加 提交前 lint 和 prettier', value: 'lint' },
  { name: '添加 commit msg规范检测', value: 'commit' },
];
export default {
  apply: context => {
    context.registerCommand(
      'add [type]',
      '添加项目配置,支持:lint,commitBuild your app as SPA',
      async (type, options) => {
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
        const cwd = context.options.baseDir;
        const choice = initChoices.find(i => i.value === type);
        if (choice) {
          const pkgFile = path.join(cwd, 'package.json');
          const pPkg = require(pkgFile);
          shell.cd(cwd);
          let npmCmd = 'npm';
          if (commandExists('tnpm')) {
            npmCmd = 'tnpm';
            try {
              await util.promisify(shell.exec)(`${npmCmd} info tnpm`, {
                silent: true,
              });
            } catch (e) {
              logger.warn('tnpm 服务无法访问,将使用npm执行');
              npmCmd = 'npm';
            }
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

              await util.promisify(shell.exec)(`${npmCmd} i husky prettier lint-staged -D`, {
                silent: false,
              });

              stopSpinner();
              break;
            case 'commit': {
              logWithSpinner('安装依赖：commitlint-config-imt');
              await util.promisify(shell.exec)(`${npmCmd} i commitlint-config-imt -D`, {
                silent: true,
              });
              logWithSpinner('初始化commit配置');
              const cmd = `./node_modules/.bin/imt-commit${
                os.platform() === 'win32' ? '.cmd' : ''
              }`;
              await util.promisify(shell.exec)(cmd, { silent: true });
              stopSpinner();
              break;
            }
            default:
          }
        } else {
          logger.error(`不支持该选项: ${type}`);
          options.outputHelp();
        }
      }
    );
  },
  name: 'builtin:add',
};
