import { BUILD_ENV, BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain, { DevTool } from 'webpack-chain';
import A8k from '..';
import { IResolveWebpackConfigOptions } from '../interface';
import optimization from '../webpack/optimization.config';
import plugins from '../webpack/plugins.config';
import resolve from '../webpack/resolve.config';
import ruleCss from '../webpack/rules/css';
import ruleFile from '../webpack/rules/file';
import ruleFonts from '../webpack/rules/fonts';
import ruleHtml from '../webpack/rules/html';
import ruleImages from '../webpack/rules/images';
import ruleJs from '../webpack/rules/js';
import ruleTs from '../webpack/rules/ts';

export default class BaseConfig {
  public name = 'builtin:config-base';
  public apply(context: A8k) {
    context.chainWebpack((configChain: WebpackChain, options: IResolveWebpackConfigOptions) => {
      const { type, analyzer, watch } = options;

      configChain.watch(!!watch);

      configChain.context(context.options.baseDir);

      if (type === BUILD_TARGET.WEB || type === BUILD_TARGET.STORYBOOK) {
        let devtool: DevTool = false;
        if (context.internals.mode === BUILD_ENV.DEVELOPMENT) {
          devtool = 'cheap-module-eval-source-map';
        } else if (options.sourceMap) {
          // 其他模式可以选择开启
          devtool = 'source-map';
        }
        configChain.target('web');
        // css/optimization 配置中需要使用bool
        options.sourceMap = Boolean(devtool);

        configChain.mode(context.internals.mode);
        configChain.devtool(devtool);

        const rule = configChain.output
          .path(context.config.dist)
          .filename(context.config.filenames.js)
          .publicPath(context.config.publicPath)
          .chunkFilename(context.config.filenames.chunk);
        // 根据配置确定是否需要anonymous
        if (context.config.crossOrigin) {
          rule.crossOriginLoading('anonymous');
        }
      }

      if (type === BUILD_TARGET.NODE) {
        configChain.target('node');
      }

      // 这些库都是不依赖其它库的库 不需要解析他们可以加快编译速度
      // config.module.noParse(/node_modules\/(moment)/);
      // 动态依赖默认不处理子目录，仅处理单层目录
      // TODO：项目里面有使用到
      // config.module.set('wrappedContextRecursive', false);

      resolve(configChain, context, options);

      ruleTs(configChain);
      ruleJs(configChain, context, options);
      ruleCss(configChain, context, options);
      ruleFonts(configChain, context, options);
      ruleImages(configChain, context, options);
      ruleFile(configChain, context, options);
      ruleHtml(configChain, context, options);

      optimization(configChain, context, options);
      plugins(configChain, context, options);

      if (analyzer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        configChain.plugin('bundle-analyzer-plugin').use(BundleAnalyzerPlugin, [
          {
            analyzerMode: 'static',
            reportFilename: `a8k_report_${type}.html`,
          },
        ]);
      }
    });
  }
}
