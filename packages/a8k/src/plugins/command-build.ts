import { logger } from '@a8k/common';
import { BUILD_ENV, BUILD_TARGET, ENV_DEV, ENV_PROD } from '@a8k/common/lib/constants';
import webpack from 'webpack';
import A8k from '..';
import { ICommandOptions } from '../interface';

export default class BuildCommand {
  public name = 'builtin:build';
  public apply(context: A8k) {
    const { hooks } = context;
    context
      .registerCommand('build')
      .description('构建生产包')
      .option('-a, --analyzer', '开启构建分析')
      // .option('-m, --use-smp', '分析构建耗时')
      .option('-s, --source-map', '启用source-map')
      .option('--no-mini', '禁用压缩代码')
      .option('--no-silent', '输出日志')
      .option('--dev', '环境变量使用 development')
      .option('--inspect', '输出webpack配置信息')
      .option('-w, --watch', '文件发生变化自动重新构建')
      .option('-t,--target [target]', '可选择构建all,browser,node', 'all')
      .action(async ({ dev, watch, analyzer, inspect, sourceMap, mini, silent, target }) => {
        // 为了让react这样的库不要使用压缩代码;
        process.env.NODE_ENV = dev ? ENV_DEV : ENV_PROD;

        context.options.inspect = inspect;
        context.internals.mode = BUILD_ENV.PRODUCTION;

        const buildBrowser = target === 'all' || target === 'browser';
        const buildNode = target === 'all' || target === 'node';

        const options: ICommandOptions = {
          sourceMap,
          mini,
          silent,
          analyzer,
          watch,
        };

        if (silent) {
          process.noDeprecation = true;
        }

        // if (useSmp) {
        //   const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
        //   const smp = new SpeedMeasurePlugin();
        //   config = smp.wrap(config);
        // }

        let clientCompiler: Promise<any> = Promise.resolve();
        if (buildBrowser) {
          await hooks.invokePromise('beforeBuild', context);
          const webpackConfig = await context.resolveWebpackConfig({
            ...options,
            type: BUILD_TARGET.BROWSER,
          });
          const compiler = context.createWebpackCompiler(webpackConfig);
          compiler.hooks.done.tap('done', (stats: webpack.Stats) => {
            if (stats.hasErrors() && !watch) {
              process.exit(-1);
            }
          });
          if (watch) {
            compiler.watch(webpackConfig.watchOptions, (err: any) => {
              if (err) {
                logger.error(err.stack || err);
                if (err.details) {
                  logger.error(err.details);
                }
              }
            });
          } else {
            clientCompiler = context
              .runCompiler(compiler)
              .then(() => hooks.invokePromise('afterBuild', context));
          }
        }
        const { ssrConfig } = context.config;
        if (ssrConfig && buildNode) {
          await hooks.invokePromise('beforeSSRBuild', context);

          const webpackConfigSSR = await context.resolveWebpackConfig({
            ...options,
            type: BUILD_TARGET.NODE,
          });

          const compilerSSR = context.createWebpackCompiler(webpackConfigSSR);
          compilerSSR.hooks.done.tap('done', (stats: webpack.Stats) => {
            if (stats.hasErrors() && !watch) {
              process.exit(-1);
            }
          });
          if (watch) {
            compilerSSR.watch(webpackConfigSSR.watchOptions, (err: any) => {
              if (err) {
                logger.error(err.stack || err);
                if (err.details) {
                  logger.error(err.details);
                }
              }
            });
          } else {
            await context.runCompiler(compilerSSR);

            await clientCompiler;

            await context.hooks.invokePromise('afterSSRBuild', context);
          }
        } else if (target === 'node') {
          logger.warn('This project disabled SSR, you need add ssrConfig in a8.config.js');
        }
      });
  }
}
