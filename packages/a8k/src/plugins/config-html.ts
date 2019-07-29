import { BUILD_ENV, BUILD_TARGET, PROJECT_MODE } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '..';
import { IResolveWebpackConfigOptions } from '../interface';
import { getEntry, IEntry } from '../utils/entry';
import EmptyPlugin from '../webpack/plugins/empty-plugin';

export default class HtmlConfig {
  public name = 'builtin:config-html';
  public apply(context: A8k) {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    HtmlWebpackPlugin.__expression = "require('html-webpack-plugin')";
    context.chainWebpack((configChain: WebpackChain, { type }: IResolveWebpackConfigOptions) => {
      const { initEntry, mode, entry } = context.config;
      switch (type) {
        // 服务器渲染 js 不需要构建 html
        case BUILD_TARGET.BROWSER:
          {
            let entries: IEntry[] = [];
            if (mode === PROJECT_MODE.SINGLE) {
              const isCustomerEntry = entry && Object.keys(entry).length;
              if (!isCustomerEntry) {
                // 单页面应用，如果没有自定义，将使用默认配置
                entries.push({
                  template: context.resolve('./src/index.html'),
                  name: 'index',
                  chunks: ['index'],
                  entry: [...initEntry, context.resolve('./src/index')],
                });
              } else {
                entries = getEntry(context);
              }
            }
            if (mode === PROJECT_MODE.MULTI) {
              entries = getEntry(context);
            }

            // tslint:disable-next-line: no-shadowed-variable
            entries.forEach(({ template, name, chunks, entry }) => {
              configChain.entry(name).merge(entry);
              configChain.plugin(`html-webpack-plugin-${name}`).use(HtmlWebpackPlugin, [
                {
                  // https://github.com/jantimon/html-webpack-plugin/issues/870
                  // html-webpack-plugin@next or chunksSortMode: 'none',
                  minify: false,
                  filename: `${name}.html`,
                  template,
                  chunks,
                  inject: 'head',
                },
              ]);
            });
            if (context.config.sri) {
              const SriPlugin = require('webpack-subresource-integrity');
              SriPlugin.__expression = "require('webpack-subresource-integrity')";
              // 支持js资源完整性校验
              // https://www.w3.org/TR/SRI/
              configChain.plugin('sri-plugin').use(SriPlugin, [
                {
                  hashFuncNames: ['sha256'],
                  enabled: context.internals.mode === BUILD_ENV.PRODUCTION,
                },
              ]);
            }
            const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
            ScriptExtHtmlWebpackPlugin.__expression = `require('script-ext-html-webpack-plugin')`;
            configChain.plugin('script-ext-html-webpack-plugin').use(ScriptExtHtmlWebpackPlugin, [
              {
                defaultAttribute: 'defer',
                inline: [/runtime([\w-]*)\.(js|css)$/],
              },
            ]);
            // html 最后插入js解析完成时间节点
            // const MarkTimePlugin = require('./webpack/plugins/mark-time-plugin');
            // MarkTimePlugin.__expression = "require('a8k/lib/webpack/plugins/mark-time-plugin')";
            // configChain.plugin('MarkTimePlugin').use(MarkTimePlugin);
          }
          break;
        case BUILD_TARGET.STORYBOOK:
          configChain.entry('index').merge([...initEntry].filter(Boolean));
          break;
      }
      // mark html end
      configChain.plugin('html-end').use(EmptyPlugin);
    });
  }
}
