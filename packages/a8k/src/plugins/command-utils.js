import logger from '@a8k/cli-utils/logger';
import { logWithSpinner, stopSpinner } from '@a8k/cli-utils/spinner';
import { execSync } from 'child_process';
import fs from 'fs-extra';

export default {
  apply: context => {
    context
      .registerCommand('clean')
      .description('清理缓存文件和构建结果文件')
      .action(async () => {
        if (context.config.cacheBase) {
          logWithSpinner('清理缓存文件');
          await fs.emptyDir(context.config.cacheBase);
        } else {
          logger.warn('没有指定缓存目录');
        }
        logWithSpinner('清理构建结果文件');
        await fs.emptyDir(context.config.dist);
        if (context.config.ssrConfig.entry) {
          logWithSpinner('清理SSR构建结果文件');
          await fs.emptyDir(context.config.ssrConfig.view);
          await fs.emptyDir(context.config.ssrConfig.dist);
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
  },
  name: 'builtin:utils',
};
