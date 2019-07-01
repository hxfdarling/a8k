import { BUILD_ENV, BUILD_TARGET, ENV_DEV, ENV_PROD } from '@a8k/common/lib/constants';
import fs from 'fs-extra';
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
      .option('--inspectWebpack', '输出webpack配置信息')
      .option('-t,--target [target]', '可选择构建all,browser,node', 'all')
      .action(async ({ dev, analyzer, inspectWebpack, sourceMap, mini, silent, target }) => {
        // 为了让react这样的库不要使用压缩代码;
        process.env.NODE_ENV = dev ? ENV_DEV : ENV_PROD;

        context.options.inspectWebpack = inspectWebpack;
        context.internals.mode = BUILD_ENV.PRODUCTION;

        const buildBrowser = target === 'all' || target === 'browser';
        const buildNode = target === 'all' || target === 'node';

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

        let clientCompiler: Promise<any> = Promise.resolve();
        if (buildBrowser) {
          await hooks.invokePromise('beforeBuild', context);
          fs.emptyDirSync(context.config.dist);
          const webpackConfig = context.resolveWebpackConfig({
            ...options,
            type: BUILD_TARGET.BROWSER,
          });
          const compiler = context.createWebpackCompiler(webpackConfig);
          compiler.hooks.done.tap('done', (stats: webpack.Stats) => {
            if (stats.hasErrors()) {
              process.exit(-1);
            }
          });
          clientCompiler = context
            .runCompiler(compiler)
            .then(() => hooks.invokePromise('afterBuild', context));
        }
        const { ssrConfig } = context.config;
        if (ssrConfig && buildNode) {
          await hooks.invokePromise('beforeSSRBuild', context);

          fs.emptyDirSync(ssrConfig.entryPath);
          fs.emptyDirSync(ssrConfig.viewPath);

          const webpackConfigSSR = context.resolveWebpackConfig({
            ...options,
            type: BUILD_TARGET.NODE,
          });
          const compilerSSR = context.createWebpackCompiler(webpackConfigSSR);
          compilerSSR.hooks.done.tap('done', (stats: webpack.Stats) => {
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
