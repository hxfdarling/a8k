import { BUILD_ENV, BUILD_TARGET } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '..';
import { IResolveWebpackConfigOptions } from '../interface';

export default (
  configChain: WebpackChain,
  context: A8k,
  { type, mini, silent }: IResolveWebpackConfigOptions
) => {
  // 只有命令行中才显示进度，CI系统日志不需要
  // if (process.stderr.isTTY) {
  // const { ProgressPlugin } = webpack;
  // ProgressPlugin.__expression = "require('webpack').ProgressPlugin";
  // config.plugin('ProgressPlugin').use(ProgressPlugin);
  const WebpackBar = require('webpackbar');
  WebpackBar.__expression = "require('webpackbar')";
  configChain.plugin('bar').use(WebpackBar, [
    {
      name: type,
      color: '#41b883',
    },
  ]);
  // }
  const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
  MomentLocalesPlugin.__expression = "require('moment-locales-webpack-plugin')";
  configChain.plugin('MomentLocalesPlugin').use(MomentLocalesPlugin, [
    {
      localesToKeep: ['es-us', 'zh-cn'],
    },
  ]);

  const ManifestPlugin = require('webpack-manifest-plugin');
  ManifestPlugin.__expression = "require('webpack-manifest-plugin')";
  configChain.plugin('ManifestPlugin').use(ManifestPlugin, [
    {
      fileName: 'manifest-legacy.json',
      // basePath: dist,
      map: (file: any) => {
        file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
        return file;
      },
    },
  ]);

  const ReportStatusPlugin = require('./plugins/report-status-plugin');
  ReportStatusPlugin.__expression = "require('a8k/lib/webpack/plugins/report-status-plugin')";
  configChain.plugin('ReportStatusPlugin').use(ReportStatusPlugin, [
    {
      silent,
    },
  ]);

  if (context.internals.mode === BUILD_ENV.PRODUCTION && type === BUILD_TARGET.BROWSER) {
    if (context.config.crossOrigin) {
      const CrossOriginLoadingPlugin = require('./plugins/cross-origin-loading');
      CrossOriginLoadingPlugin.__expression =
        "require('a8k/lib/webpack/plugins/cross-origin-loading')";
      configChain.plugin('CrossOriginLoadingPlugin').use(CrossOriginLoadingPlugin);
    }

    // html 最后插入js解析完成时间节点
    const MarkTimePlugin = require('./plugins/mark-time-plugin');
    MarkTimePlugin.__expression = "require('a8k/lib/webpack/plugins/mark-time-plugin')";
    configChain.plugin('MarkTimePlugin').use(MarkTimePlugin);

    if (context.config.retry) {
      const RetryPlugin = require('webpack-retry-load-plugin');
      RetryPlugin.__expression = "require('webpack-retry-load-plugin')";
      configChain
        .plugin('RetryPlugin')
        .use(RetryPlugin, [{ ...context.config.retry, minimize: mini }]);
    }

    // 支持lodash包 按需引用
    const LodashPlugin = require('lodash-webpack-plugin');
    LodashPlugin.__expression = "require('lodash-webpack-plugin')";
    configChain.plugin('LodashPlugin').use(LodashPlugin);

    const { CleanWebpackPlugin } = require('clean-webpack-plugin');
    CleanWebpackPlugin.__expression = "require('clean-webpack-plugin')";
    configChain.plugin('CleanWebpackPlugin').use(CleanWebpackPlugin, [
      {
        verbose: false,
        dry: false,
      },
    ]);
    const { escheck } = context.config;
    if (escheck) {
      const EsCheckPlugin = require('./plugins/es-check-plugin');
      EsCheckPlugin.__expression = `require('./plugins/es-check-plugin')`;
      let escheckConfig = {};
      if (typeof escheck === 'object') {
        escheckConfig = escheck;
      }
      configChain
        .plugin('es-check-plugin')
        .use(EsCheckPlugin, [{ ecmaVersion: 'es5', ...escheckConfig }]);
    }
  }
};
