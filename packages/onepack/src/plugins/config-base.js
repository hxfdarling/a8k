import webpack from 'webpack';
import path from 'path';
import { ENV_DEV, TYPE_CLIENT } from '../const';
import getFileNames from '../utils/get-filenames';

exports.apply = context => {
  context.chainWebpack((config, options) => {
    const filenames = getFileNames({
      filenames: context.config.filenames,
      webpackMode: context.config.webpackMode,
    });
    const { type, eslint, ssr, analyzer, watch, sourceMap } = options;

    config.watch(watch);
    config.merge({
      performance: {
        hints: false,
      },
    });

    if (type === TYPE_CLIENT) {
      let devtool = false;
      if (context.config.webpackMode === ENV_DEV) {
        devtool = 'cheap-module-eval-source-map';
      }
      if (sourceMap) {
        devtool = 'source-map';
      }
      if (typeof config.sourceMap === 'string') {
        devtool = config.sourceMap;
      }
      config.mode(context.config.webpackMode);
      config.devtool(devtool);

      config.output
        .path(context.config.dist)
        .filename(filenames.js)
        .publicPath(context.config.publicPath)
        .chunkFilename(filenames.chunk)
        .crossOriginLoading('anonymous');

      if (context.config.webpackMode === ENV_DEV) {
        // 开发模式
        if (eslint) {
          config.module
            .rule('eslint')
            .test(/\.(js|mjs|jsx)$/)
            .pre()
            .include.add(context.resolve('src'))
            .end()
            .use('eslint')
            .loader('eslint-loader')
            .options({
              options: {
                emitError: false,
                failOnError: false,
                failOnWarning: false,
                quit: true,
                cache: path.resolve(context.config.cache, 'eslint-loader'),
                formatter: require.resolve('eslint-friendly-formatter'),
                // 要求项目安装eslint，babel-eslint依赖，目的是让vscode 也提示eslint错误
                eslintPath: context.resolve('node_modules', 'eslint'),
              },
            });
        }

        config.plugin('HotModuleReplacementPlugin').use(webpack.HotModuleReplacementPlugin);

        // 支持调试直出代码
        if (ssr && type === TYPE_CLIENT) {
          const SSRPlugin = require('../webpack/plugins/ssr-plugin');
          config
            .plugin('ssr-plugin')
            .use(SSRPlugin, [{ ssrConfig: context.config.ssrConfig, dist: context.config.dist }]);
        }
      }
    }

    config.resolve.extensions
      .add('.js')
      .add('.jsx')
      .add('.ts')
      .add('.tsx')
      .add('.json')
      .end()
      .alias.set('@', context.resolve('src'))
      .end()
      // es tree-shaking
      .mainFields.add('jsnext:main')
      .add('browser')
      .add('main')
      .end();

    const ownModules = context.rootResolve('node_modules');
    const projectModules = context.resolve('node_modules');
    config.resolve.modules
      .add(context.resolve('src'))
      .add(ownModules)
      .add(projectModules)
      .add('node_modules');

    config.resolveLoader.modules
      .add(ownModules)
      .add(projectModules)
      .add('node_modules');

    // 这些库都是不依赖其它库的库 不需要解析他们可以加快编译速度
    config.module.noParse(/node_modules\/(moment|chart\.js)/);

    require('../webpack/rules/js')(config, context, options);
    require('../webpack/rules/css')(config, context, options, filenames.css);
    require('../webpack/rules/fonts')(config, context, options, filenames.font);
    require('../webpack/rules/images')(config, context, options, filenames.image);
    require('../webpack/rules/file')(config, context, options, filenames.image);
    require('../webpack/rules/html')(config, context, options);

    require('../webpack/optimization.config')(config, context, options);
    require('../webpack/plugins.config').default(config, context, options);

    if (analyzer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugin('bundle-analyzer-plugin').use(BundleAnalyzerPlugin);
    }
  });
};

exports.name = 'builtin:config-base';
