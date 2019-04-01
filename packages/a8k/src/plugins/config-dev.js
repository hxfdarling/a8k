import path from 'path';
import webpack from 'webpack';
import loadConfig from '@a8k/cli-utils/load-config';
import crypto from 'crypto';
import { ENV_DEV, TYPE_CLIENT } from '../const';

exports.apply = context => {
  context.chainWebpack((config, options) => {
    const { type, eslint, ssr } = options;
    // 只有客户端代码 开发模式才需要使用，构建服务器代码不需要
    if (type === TYPE_CLIENT && context.internals.mode === ENV_DEV) {
      // 开发模式
      if (eslint) {
        const hash = crypto.createHash('sha256');
        hash.update(
          JSON.stringify(
            loadConfig.loadSync({
              files: [
                '.eslintrc.js',
                '.eslintrc.yaml',
                '.eslintrc.yml',
                '.eslintrc.json',
                '.eslintrc',
              ],
              cwd: context.options.baseDir,
              packageKey: 'eslintConfig',
            })
          )
        );

        config.module
          .rule('eslint')
          .test(/\.(js|mjs|jsx)$/)
          .pre()
          .include.add(context.resolve('src'))
          .end()
          .use('eslint')
          .loader('eslint-loader')
          .options({
            emitError: false,
            failOnError: false,
            failOnWarning: false,
            quit: true,
            cache: path.resolve(context.config.cache, `eslint-loader-${hash.digest('hex')}`),
            formatter: require.resolve('eslint-friendly-formatter'),
            // 要求项目安装eslint，babel-eslint依赖，目的是让vscode 也提示eslint错误
            eslintPath: context.resolve('node_modules', 'eslint'),
          });
      }
      const { HotModuleReplacementPlugin } = webpack;
      HotModuleReplacementPlugin.__expression = "require('webpack').HotModuleReplacementPlugin";
      config.plugin('HotModuleReplacementPlugin').use(webpack.HotModuleReplacementPlugin);
      // 支持调试直出代码
      if (ssr) {
        const SSRPlugin = require('../webpack/plugins/ssr-plugin');
        SSRPlugin.__expression = "require('a8k/lib/webpack/plugins/ssr-plugin')";
        config
          .plugin('ssr-plugin')
          .use(SSRPlugin, [{ ssrConfig: context.config.ssrConfig, dist: context.config.dist }]);
      }
    }
  });
};

exports.name = 'builtin:config-dev';
