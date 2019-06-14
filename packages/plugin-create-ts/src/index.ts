import getNpmCommand from '@a8k/cli-utils/npm';
import spawn from '@a8k/cli-utils/spawn';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import createGenerator from './create';

export default class PluginCreateTypescriptProject {
  name = 'builtin:create-ts';
  options: any;
  constructor(options: any) {
    this.options = options;
  }

  apply(context: any) {
    const { options } = context;
    context
      .registerCommand('create-ts [dir]')
      .description('初始化一个typescript项目')
      .action(async (dir, type) => {
        const projectDir = path.join(options.baseDir, dir || '');

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
        const spinner = ora('初始化项目');
        await createGenerator(projectDir);
        await context.hooks.invokePromise('afterCreate', context);
        spinner.succeed('File Generate Done');

        const npmCmd = getNpmCommand();
        const deps = [
          '@a8k/changelog',
          '@commitlint/cli',
          'commitizen',
          'commitlint-config-cz',
          'cz-customizable',
          'husky',
          'lint-staged',
          'prettier',
          'tslint',
          'typescript',
          'jest',
          '@types/jest',
          '@types/node',
        ];

        await spawn(npmCmd, ['i', '-D ', ...deps], { cwd: projectDir });
        spinner.succeed('安装依赖完毕');
        await context.hooks.invokePromise(context);
        spinner.succeed('项目创建完毕');
      });
  }
}
