import A8k from '..';
import { ENV_DEV, ENV_PROD, TYPE_SERVER, TYPE_CLIENT } from '../const';

export default class SsrConfig {
  name = 'builtin:config-ssr';
  apply(context: A8k) {
    context.chainWebpack((config, { type, watch }) => {
      if (type === TYPE_SERVER) {
        const isDevMode = watch;
        config.mode(isDevMode ? ENV_DEV : ENV_PROD);
        config.devtool(false);
        config.target('node');

        const { ssrConfig, publicPath } = context.config;

        for (const entryName of Object.keys(ssrConfig.entry)) {
          config
            .entry(entryName)
            .merge([].concat(ssrConfig.entry[entryName]).map(i => context.resolve(i)));
        }

        config.output
          .path(ssrConfig.dist)
          .publicPath(isDevMode ? '' : publicPath)
          .filename('[name].js')
          .libraryTarget('commonjs2');

        const nodeExternals = require('webpack-node-externals');
        config.externals([
          nodeExternals({
            // 注意如果存在src下面其他目录的绝对引用，都需要添加到这里
            whitelist: [/^components/, /^assets/, /^pages/, /^@tencent/, /\.(scss|css)$/],
            // modulesFromFile:true
          }),
        ]);
        config.merge({
          optimization: {
            splitChunks: false,
            minimizer: [],
            runtimeChunk: false,
          },
        });
      }
      if (type === TYPE_CLIENT) {
        const {
          ssrConfig: { entry },
        } = context.config;
        if (entry && Object.keys(entry).length) {
          const SSRPlugin = require('../webpack/plugins/ssr-plugin');
          SSRPlugin.__expression = "require('a8k/lib/webpack/plugins/ssr-plugin')";
          config
            .plugin('ssr-plugin')
            .use(SSRPlugin, [{ ssrConfig: context.config.ssrConfig, dist: context.config.dist }]);
        }
      }
    });
  }
}
