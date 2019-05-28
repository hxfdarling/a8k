import fs from 'fs-extra';
import { ENV_DEV, ENV_PROD, TYPE_CLIENT, TYPE_SERVER } from '../const';
import cleanUnusedCache from '../utils/clean-old-cache.js';
import A8k from '..';

export default class BuildCommand {
  name = 'builtin:build';
  apply(context: A8k) {
    const { hooks } = context;
    context
      .registerCommand('build')
      .description('构建生产包')
      .option('-a, --analyzer', '开启构建分析')
      // .option('-m, --use-smp', '分析构建耗时')
      .option('--offlinePack', '开启打包离线包')
      .option('-s, --source-map', '是否生成source-map,默认false')
      .option('--no-mini', '禁用压缩代码')
      .option('--no-silent', '输出日志')
      .option('--dev', '环境变量使用 development')
      .option('--inspectWebpack', '输出webpack配置信息')
      .action(async ({ dev, analyzer, inspectWebpack, sourceMap, mini, silent, offlinePack }) => {
        await cleanUnusedCache(context);
        // 为了让react这样的库不要使用压缩代码;
        process.env.NODE_ENV = dev ? ENV_DEV : ENV_PROD;

        context.options.inspectWebpack = inspectWebpack;
        context.internals.mode = ENV_PROD;
        context.options.offlinePack = offlinePack;

        const options = {
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
          type: TYPE_CLIENT,
        });
        const compiler = context.createWebpackCompiler(webpackConfig);
        compiler.hooks.done.tap('done', stats => {
          if (stats.hasErrors()) {
            process.exit(-1);
          }
        });
        const clientCompiler = context
          .runCompiler(compiler)
          .then(() => hooks.invokePromise('afterBuild', context));

        const { ssrConfig } = context.config;
        if (ssrConfig.entry && Object.keys(ssrConfig.entry).length) {
          await hooks.invokePromise('beforeSSRBuild', context);

          fs.emptyDirSync(ssrConfig.dist);
          fs.emptyDirSync(ssrConfig.view);
          // logWithSpinner('clean ssr dist dir.');
          // stopSpinner();

          const webpackConfigSSR = context.resolveWebpackConfig({
            ...options,
            type: TYPE_SERVER,
          });
          const compilerSSR = context.createWebpackCompiler(webpackConfigSSR);
          compilerSSR.hooks.done.tap('done', stats => {
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
