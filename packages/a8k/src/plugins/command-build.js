import logger from '@a8k/cli-utils/logger';
import { logWithSpinner, stopSpinner } from '@a8k/cli-utils/spinner';
import fs from 'fs-extra';
import path from 'path';
import { ENV_PROD, TYPE_CLIENT, TYPE_SERVER } from '../const';

export default {
  apply: context => {
    const {
      hooks,
      options: { baseDir },
    } = context;
    context
      .registerCommand('build')
      .description('构建生产包')
      .option('-d, --dist <dist>', '配置构建文件生成目标目录')
      .option('-a, --analyzer', '开启构建分析', false)
      // .option('-m, --use-smp', '分析构建耗时', false)
      .option('-s, --source-map', '是否生成source-map,默认false', false)
      .option('--no-mini', '禁用压缩代码')
      .option('--no-silent', '输出日志')
      .option('--dev', '环境变量使用development')
      .option('--inspectWebpack', '输出webpack配置信息')
      .action(async ({ dev, dist, analyzer, inspectWebpack, sourceMap, mini, silent }) => {
        process.env.NODE_ENV = ENV_PROD;
        const options = {
          sourceMap,
          mini,
          silent,
          analyzer,
          dev,
        };

        logger.info('build frontend');

        context.options.inspectWebpack = inspectWebpack;

        context.config.webpackMode = ENV_PROD;

        if (silent) {
          process.noDeprecation = true;
        }

        if (dist) {
          context.config.dist = path.relative(baseDir, dist);
        }

        // if (useSmp) {
        //   const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
        //   const smp = new SpeedMeasurePlugin();
        //   config = smp.wrap(config);
        // }

        await hooks.invokePromise('beforeBuild', context);
        logWithSpinner('clean frontend dist dir.');
        stopSpinner();

        fs.emptyDirSync(context.config.dist);
        const webpackConfig = context.resolveWebpackConfig({
          ...options,
          type: TYPE_CLIENT,
        });
        await context.runWebpack(webpackConfig);
        await hooks.invokePromise('afterBuild', context);

        const { ssrConfig } = context.config;
        if (ssrConfig) {
          logger.info('build ssr');
          await hooks.invokePromise('beforeSSRBuild', context);

          fs.emptyDirSync(ssrConfig.dist);
          fs.emptyDirSync(ssrConfig.view);
          logWithSpinner('clean ssr dist dir.');
          stopSpinner();
          const webpackConfigSSR = context.resolveWebpackConfig({
            ...options,
            type: TYPE_SERVER,
          });
          await context.runWebpack(webpackConfigSSR);
          await context.hooks.invokePromise('afterSSRBuild', context);
        }
      });
  },
  name: 'builtin:build',
};
