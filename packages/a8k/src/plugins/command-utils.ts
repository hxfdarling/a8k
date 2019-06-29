import { logger } from '@a8k/common';
import { logWithSpinner, stopSpinner } from '@a8k/common/lib/spinner';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import A8k from '..';

export default class UtilsCommand {
  public name = 'builtin:utils';
  public apply(context: A8k) {
    context
      .registerCommand('clean')
      .description('清理缓存文件和构建结果文件')
      .action(async () => {
        if (context.config.cacheDirectory) {
          logWithSpinner('清理缓存文件');
          await fs.emptyDir(path.dirname(context.config.cacheDirectory));
        } else {
          logger.warn('没有指定缓存目录');
        }
        logWithSpinner('清理构建结果文件');
        await fs.emptyDir(context.config.dist);
        if (context.config.ssrConfig) {
          logWithSpinner('清理SSR构建结果文件');
          await fs.emptyDir(context.config.ssrConfig.entryPath);
          await fs.emptyDir(context.config.ssrConfig.viewPath);
        }
        stopSpinner();
      });

    context
      .registerCommand('check')
      .description('检测代码是否合并主干')
      .action(async () => {
        try {
          execSync('git fetch origin master');
          const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString();
          const ancestor = execSync(`git merge-base origin/master ${currentBranch}`).toString();
          const masterLatest = execSync(
            'git log --oneline -n 1 --pretty=format:"%h" origin/master'
          ).toString();
          if (ancestor.indexOf(masterLatest) === -1) {
            logger.error(Error("current branch doesn't merge the latest master commit!"));
            process.exit(1);
          } else {
            logger.info('current branch is merged the latest master commit!');
          }
        } catch (e) {
          logger.error(e);
          process.exit(1);
        }
      });
  }
}
