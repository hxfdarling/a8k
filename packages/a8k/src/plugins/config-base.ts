import WebpackChain, { DevTool } from 'webpack-chain';
import A8k from '..';
import { BUILD_ENV, BUILD_TARGET } from '../const';
import { IResolveWebpackConfigOptions } from '../interface';
import getFileNames from '../utils/get-filenames';
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
    context.chainWebpack((config: WebpackChain, options: IResolveWebpackConfigOptions) => {
      const filenames = getFileNames({
        filenames: context.config.filenames,
        mode: context.internals.mode,
      });
      const { type, analyzer, watch } = options;

      config.watch(watch);

      config.context(context.options.baseDir);

      if (type === BUILD_TARGET.BROWSER || type === BUILD_TARGET.STORYBOOK) {
        let devtool: DevTool = false;
        if (context.internals.mode === BUILD_ENV.DEVELOPMENT) {
          devtool = 'cheap-module-eval-source-map';
        } else if (options.sourceMap) {
          // 其他模式可以选择开启
          devtool = 'source-map';
        }

        // css/optimization 配置中需要使用bool
        options.sourceMap = Boolean(devtool);

        config.mode(context.internals.mode);
        config.devtool(devtool);

        const rule = config.output
          .path(context.config.dist)
          .filename(filenames.js)
          .publicPath(context.config.publicPath)
          .chunkFilename(filenames.chunk);
        // 根据配置确定是否需要anonymous
        if (context.config.crossOrigin) {
          rule.crossOriginLoading('anonymous');
        }
      }

      // 这些库都是不依赖其它库的库 不需要解析他们可以加快编译速度
      // config.module.noParse(/node_modules\/(moment)/);
      // 动态依赖默认不处理子目录，仅处理单层目录
      // TODO：项目里面有使用到
      // config.module.set('wrappedContextRecursive', false);

      resolve(config, context, options);

      ruleTs(config);
      ruleJs(config, context, options);
      ruleCss(config, context, options, filenames.css);
      ruleFonts(config, context, options, filenames.font);
      ruleImages(config, context, options, filenames.image);
      ruleFile(config, context, options, filenames.image);
      ruleHtml(config, context, options);

      optimization(config, context, options);
      plugins(config, context, options);

      if (analyzer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugin('bundle-analyzer-plugin').use(BundleAnalyzerPlugin, [
          {
            analyzerMode: 'static',
            reportFilename: `a8k_report_${type}.html`,
          },
        ]);
      }
    });
  }
}
