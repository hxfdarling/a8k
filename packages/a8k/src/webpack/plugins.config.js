import webpack from 'webpack';
import { ENV_PROD, TYPE_CLIENT, TYPE_SERVER } from '../const';

export default (config, context, { type, mini, crossOrigin, retry, silent }) => {
  // 只有命令行中才显示进度，CI系统日志不需要
  if (process.stderr.isTTY) {
    config.plugin('ProgressPlugin').use(webpack.ProgressPlugin);
  }
  const BuildTime = require('./plugins/build-time');
  config.plugin('buildTime').use(BuildTime);

  const ManifestPlugin = require('webpack-manifest-plugin');
  config.plugin('ManifestPlugin').use(ManifestPlugin, [
    {
      fileName: 'manifest-legacy.json',
      // basePath: dist,
      map: file => {
        file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
        return file;
      },
    },
  ]);

  if (context.config.webpackMode === ENV_PROD && type === TYPE_CLIENT) {
    const ReportStatusPlugin = require('./plugins/report-status-plugin');
    config.plugin('ReportStatusPlugin').use(ReportStatusPlugin, [
      {
        silent,
      },
    ]);
    if (crossOrigin) {
      const CrossOriginLoadingPlugin = require('./plugins/cross-origin-loading');
      config.plugin('CrossOriginLoadingPlugin').use(CrossOriginLoadingPlugin);
    }

    const MarkTimePlugin = require('./plugins/mark-time-plugin');
    // html 最后插入js解析完成时间节点
    config.plugin('MarkTimePlugin').use(MarkTimePlugin);

    if (retry) {
      const RetryPlugin = require('webpack-retry-load-plugin');
      config.plugin('RetryPlugin').use(RetryPlugin, [{ ...retry, minimize: mini }]);
    }

    const LodashPlugin = require('lodash-webpack-plugin');
    // 支持lodash包 按需引用
    config.plugin('LodashPlugin').use(LodashPlugin);

    const CleanWebpackPlugin = require('clean-webpack-plugin');
    config.plugin('CleanWebpackPlugin').use(CleanWebpackPlugin, [
      '*',
      {
        root: context.config.dist,
        verbose: false,
        dry: false,
      },
    ]);
    config.plugin('webpack.HashedModuleIdsPlugin').use(webpack.HashedModuleIdsPlugin, [
      {
        hashDigestLength: 6,
      },
    ]);
  }

  if (type === TYPE_SERVER) {
    //
  }
};
