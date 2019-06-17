import fs from 'fs-extra';
import A8k from '..';
import { BUILD_ENV, BUILD_TYPE, ENV_DEV, ENV_PROD } from '../const';
import { ICommandOptions } from '../interface';
import cleanUnusedCache from '../utils/clean-old-cache.js';

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
      .option('--inspectWebpack', '输出webpack配置信息')
      .action(async ({ dev, analyzer, inspectWebpack, sourceMap, mini, silent }) => {
        await cleanUnusedCache(context);
        // 为了让react这样的库不要使用压缩代码;
        process.env.NODE_ENV = dev ? ENV_DEV : ENV_PROD;

        context.options.inspectWebpack = inspectWebpack;
        context.internals.mode = BUILD_ENV.PRODUCTION;

        const options: ICommandOptions = {
          sourceMap,
          mini,
          silent,
          analyzer,
        };

        if (silent) {
          process.noDeprecation = true;
        }

        // if (useSmp) {
        //   const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
        //   const smp = new SpeedMeasurePlugin();
        //   config = smp.wrap(config);
        // }

        await hooks.invokePromise('beforeBuild', context);
        // logWithSpinner('clean frontend dist dir.');
        // stopSpinner();

        fs.emptyDirSync(context.config.dist);
        const webpackConfig = context.resolveWebpackConfig({
          ...options,
          type: BUILD_TYPE.CLIENT,
        });
        const compiler = context.createWebpackCompiler(webpackConfig);
        compiler.hooks.done.tap('done', (stats) => {
          if (stats.hasErrors()) {
            process.exit(-1);
          }
        });
        const clientCompiler = context
          .runCompiler(compiler)
          .then(() => hooks.invokePromise('afterBuild', context));

        const { ssrConfig, ssr } = context.config;
        if (ssr) {
          await hooks.invokePromise('beforeSSRBuild', context);

          fs.emptyDirSync(ssrConfig.dist);
          fs.emptyDirSync(ssrConfig.view);

          const webpackConfigSSR = context.resolveWebpackConfig({
            ...options,
            type: BUILD_TYPE.SERVER,
          });
          const compilerSSR = context.createWebpackCompiler(webpackConfigSSR);
          compilerSSR.hooks.done.tap('done', (stats) => {
            if (stats.hasErrors()) {
              process.exit(-1);
            }
          });
          await context.runCompiler(compilerSSR);
          await clientCompiler;
          await context.hooks.invokePromise('afterSSRBuild', context);
        }
      });
  }
}
