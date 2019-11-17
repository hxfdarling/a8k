import getNpmCommand from '@a8k/cli-utils/npm';
import spawn from '@a8k/cli-utils/spawn';
import { logger, spinner } from '@a8k/common';
import fs from 'fs-extra';
import path from 'path';
import A8k from '..';
import download from '../utils/download';

const npmCmd = getNpmCommand();

export default async function create(projectDir: string, repo: string, context: A8k) {
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
      await fs.remove(initFile);
    }
    spinner.succeed('项目创建完毕');
  }
}
