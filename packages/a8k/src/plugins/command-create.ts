import getNpmCommand from '@a8k/cli-utils/npm';
import spawn from '@a8k/cli-utils/spawn';
import { logger, spinner } from '@a8k/common';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import download from '../utils/download';

const npmCmd = getNpmCommand();

export default class Create {
  public name = 'builtin:create-from-git';
  public apply(context: any) {
    context.registerCreateType('remote', '从远程仓库下载模板', async ({ projectDir }: any) => {
      const { repo }: any = await inquirer.prompt([
        {
          type: 'input',
          name: 'repo',
          message: '请输入远程仓库地址',
          validate(value: string) {
            if (value) {
              return true;
            }
            return false;
          },
        },
      ]);
      if (repo) {
        try {
          spinner.logWithSpinner('模板下载中...');
          const { path: tmpDir, cleanupCallback } = await download(repo);
          await fs.ensureDir(projectDir);
          await fs.copy(tmpDir, projectDir);
          spinner.succeed('模板下载完成');
          cleanupCallback();
        } catch (e) {
          logger.error('模板初始化失败');
          console.error(e);
          process.exit(-1);
        }
        await context.hooks.invokePromise('afterCreate', context);
        spinner.info('安装依赖');

        await spawn(npmCmd, ['i'], { cwd: projectDir });
        spinner.succeed('安装依赖完毕');
        const initFile = path.join(projectDir, './initial.js');
        if (fs.existsSync(initFile)) {
          spinner.info('执行初始化脚本');
          await spawn('node', [initFile], { cwd: projectDir });
        }
        spinner.succeed('项目创建完毕');
      }
    });
  }
}
