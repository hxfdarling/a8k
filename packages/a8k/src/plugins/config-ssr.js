import logger from '@a8k/cli-utils/logger';
import fs from 'fs-extra';
import path from 'path';
import { ENV_PROD, ENV_DEV, TYPE_SERVER } from '../const';

function deleteLoading(str) {
  const s = str.substring(
    str.indexOf('<!--CLIENT_ONLY_START-->'),
    str.lastIndexOf('<!--CLIENT_ONLY_END-->')
  );
  return str.replace(s, '');
}
exports.apply = context => {
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
  });

  context.hooks.add('afterSSRBuild', () => {
    const {
      ssrConfig: { entry, view },
      dist,
    } = context.config;
    // 拷贝 html 文件到 node 直出服务目录
    Object.keys(entry).forEach(key => {
      const pageName = entry[key].split('/');
      const file = `${pageName[pageName.length - 2]}.html`;
      const srcFile = path.join(dist, file);
      const targetFile = path.join(view, file);
      if (fs.existsSync(srcFile)) {
        const data = deleteLoading(fs.readFileSync(srcFile).toString());
        fs.writeFileSync(targetFile, data);
      } else {
        logger.warn(`ssr entry "${key}" not found html file!`);
      }
    });
  });
};

exports.name = 'builtin:config-ssr';
