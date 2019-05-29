import A8k from '..';
import { BUILD_TYPE, ENV_DEV } from '../const';
import getFileNames from '../utils/get-filenames';
import WebpackChain, { DevTool } from 'webpack-chain';
import { IResolveWebpackConfigOptions } from '../interface';

export default class BaseConfig {
  name = 'builtin:config-base';
  apply(context: A8k) {
    context.chainWebpack((config: WebpackChain, options: IResolveWebpackConfigOptions) => {
      const filenames = getFileNames({
        filenames: context.config.filenames,
        mode: context.internals.mode,
      });
      const { type, analyzer, watch } = options;

      config.watch(watch);
      config.merge({
        performance: {
          hints: false,
        },
      });

      config.context(context.options.baseDir);

      if (type === BUILD_TYPE.CLIENT) {
        let devtool: DevTool = false;
        if (context.internals.mode === ENV_DEV) {
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

      config.resolve.extensions
        .add('.js')
        .add('.jsx')
        .add('.ts')
        .add('.tsx')
        .add('.json')
        .end();

      // 避免在开发模式下面link全局的模块时无法正确编译，需要配置额外的参数
      config.resolve.symlinks(false);

      const ownModules = context.rootResolve('node_modules');
      const projectModules = context.resolve('node_modules');
      config.resolve.modules
        .add(context.resolve('src'))
        .add(projectModules)
        .add(ownModules)
        .add('node_modules');

      config.resolveLoader.modules
        .add(ownModules)
        .add(projectModules)
        .add('node_modules');

      // 这些库都是不依赖其它库的库 不需要解析他们可以加快编译速度
      // config.module.noParse(/node_modules\/(moment)/);
      // 动态依赖默认不处理子目录，仅处理单层目录
      // TODO：项目里面有使用到
      // config.module.set('wrappedContextRecursive', false);

      require('../webpack/rules/ts').default(config, context, options);
      require('../webpack/rules/js').default(config, context, options);
      require('../webpack/rules/css').default(config, context, options, filenames.css);
      require('../webpack/rules/fonts').default(config, context, options, filenames.font);
      require('../webpack/rules/images').default(config, context, options, filenames.image);
      require('../webpack/rules/file').default(config, context, options, filenames.image);
      require('../webpack/rules/html').default(config, context, options);

      require('../webpack/optimization.config').default(config, context, options);
      require('../webpack/plugins.config').default(config, context, options);

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
