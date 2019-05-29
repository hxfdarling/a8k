// import webpack from 'webpack';
import { ENV_PROD, TYPE_CLIENT } from '../const';
import WebpackChain from 'webpack-chain';
import A8k from '..';

export default (config: WebpackChain, context: A8k, { type, mini, silent }) => {
  // 只有命令行中才显示进度，CI系统日志不需要
  // if (process.stderr.isTTY) {
  // const { ProgressPlugin } = webpack;
  // ProgressPlugin.__expression = "require('webpack').ProgressPlugin";
  // config.plugin('ProgressPlugin').use(ProgressPlugin);
  const WebpackBar = require('webpackbar');
  WebpackBar.__expression = "require('webpackbar')";
  config.plugin('bar').use(WebpackBar, [
    {
      name: type,
      color: '#41b883',
    },
  ]);
  // }
  const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
  MomentLocalesPlugin.__expression = "require('moment-locales-webpack-plugin')";
  config.plugin('MomentLocalesPlugin').use(MomentLocalesPlugin, [
    {
      localesToKeep: ['es-us', 'zh-cn'],
    },
  ]);

  const ManifestPlugin = require('webpack-manifest-plugin');
  ManifestPlugin.__expression = "require('webpack-manifest-plugin')";
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

  const ReportStatusPlugin = require('./plugins/report-status-plugin');
  ReportStatusPlugin.__expression = "require('a8k/lib/webpack/plugins/report-status-plugin')";
  config.plugin('ReportStatusPlugin').use(ReportStatusPlugin, [
    {
      silent,
    },
  ]);

  if (context.internals.mode === ENV_PROD && type === TYPE_CLIENT) {
    if (context.config.crossOrigin) {
      const CrossOriginLoadingPlugin = require('./plugins/cross-origin-loading');
      CrossOriginLoadingPlugin.__expression =
        "require('a8k/lib/webpack/plugins/cross-origin-loading')";
      config.plugin('CrossOriginLoadingPlugin').use(CrossOriginLoadingPlugin);
    }

    // html 最后插入js解析完成时间节点
    const MarkTimePlugin = require('./plugins/mark-time-plugin');
    MarkTimePlugin.__expression = "require('a8k/lib/webpack/plugins/mark-time-plugin')";
    config.plugin('MarkTimePlugin').use(MarkTimePlugin);

    if (context.config.retry) {
      const RetryPlugin = require('webpack-retry-load-plugin');
      RetryPlugin.__expression = "require('webpack-retry-load-plugin')";
      config.plugin('RetryPlugin').use(RetryPlugin, [{ ...context.config.retry, minimize: mini }]);
    }

    // 支持lodash包 按需引用
    const LodashPlugin = require('lodash-webpack-plugin');
    LodashPlugin.__expression = "require('lodash-webpack-plugin')";
    config.plugin('LodashPlugin').use(LodashPlugin);

    const CleanWebpackPlugin = require('clean-webpack-plugin');
    CleanWebpackPlugin.__expression = "require('clean-webpack-plugin')";
    config.plugin('CleanWebpackPlugin').use(CleanWebpackPlugin, [
      {
        root: context.config.dist,
        verbose: false,
        dry: false,
      },
    ]);
    const EsCheckPlugin = require('./plugins/es-check-plugin');
    EsCheckPlugin.__expression = `require('./plugins/es-check-plugin')`;
    config.plugin('es-check-plugin').use(EsCheckPlugin, [{ ecmaVersion: 'es5' }]);
  }
};
