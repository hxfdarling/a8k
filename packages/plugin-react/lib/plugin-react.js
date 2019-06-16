const getNpmCommand = require('@a8k/cli-utils/npm');
const logger = require('@a8k/cli-utils/logger');
const spinner = require('@a8k/cli-utils/spinner');
const spawn = require('@a8k/cli-utils/spawn');

const shell = require('shelljs');
const util = require('util');
const createGenerator = require('./create');
const addComponent = require('./add-component');
const addPage = require('./add-page');

module.exports = class PluginReact {
  constructor(options) {
    this.name = 'builtin:react';
    this.options = options;
  }

  apply(context) {
    context.registerCreateType(
      'react',
      '基于react的项目(支持SSR)',
      async ({ projectDir, name }) => {
        await createGenerator(projectDir, name);
        await context.hooks.invokePromise('afterCreate', context);
        spinner.succeed('File Generate Done');
        const npmCmd = getNpmCommand();
        shell.cd(projectDir);
        await spawn(npmCmd, ['i'], { cwd: projectDir });

        spinner.succeed('安装依赖完毕');
        try {
          await util.promisify(shell.exec)('npx eslint --fix src  a8k.config.js  --ext jsx,js');
          spinner.succeed('执行eslint校验');
        } catch (e) {
          logger.warn('执行eslint校验失败');
        }
        await context.hooks.invokePromise(context);
        spinner.succeed('项目创建完毕');
      }
    );

    context
      .registerCommand('page')
      .alias('p')
      .description('新建页面')
      .action(async () => {
        addPage(context);
        await context.hooks.invokePromise('afterAddPage', context);
      });
    context
      .registerCommand('component')
      .alias('c')
      .description('新建组件')
      .action(async () => {
        addComponent(context);
        await context.hooks.invokePromise('afterAddComponent', context);
      });
  }
};
