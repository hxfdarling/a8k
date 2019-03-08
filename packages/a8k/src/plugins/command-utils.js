import logger from '@a8k/cli-utils/logger';
import { logWithSpinner, stopSpinner } from '@a8k/cli-utils/spinner';
import fs from 'fs-extra';
import { execSync } from 'child_process';

export default {
  apply: context => {
    context
      .registerCommand('clean')
      .description('清理缓存文件和构建结果文件')
      .action(async () => {
        if (context.config.cache) {
          logWithSpinner('清理缓存文件');
          await fs.emptyDir(context.config.cache);
        } else {
          logger.warn('没有指定缓存目录');
        }
        logWithSpinner('清理构建结果文件');
        await fs.emptyDir(context.config.dist);
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

    context
      .registerCommand('cache <cmd>')
      .description('缓存node_modules加速构建, cmd 是配置的 npm scripts key')
      .action(async cmd => {
        if (context.config.cache) {
          const cache = require('../scripts/cache');
          cache({ cmd, cache: context.config.cache });
        } else {
          logger.warn('没有指定缓存目录');
        }
      });
  },
  name: 'builtin:utils',
};
