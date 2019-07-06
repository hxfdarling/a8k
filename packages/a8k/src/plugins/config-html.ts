import { BUILD_ENV, BUILD_TARGET, PROJECT_MODE } from '@a8k/common/lib/constants';
import WebpackChain from 'webpack-chain';
import A8k from '..';
import { IResolveWebpackConfigOptions } from '../interface';
import { getEntry } from '../utils/entry';
import EmptyPlugin from '../webpack/plugins/empty-plugin';

export default class HtmlConfig {
  public name = 'builtin:config-html';
  public apply(context: A8k) {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    HtmlWebpackPlugin.__expression = "require('html-webpack-plugin')";
    context.chainWebpack((configChain: WebpackChain, { type }: IResolveWebpackConfigOptions) => {
      const { initEntry, mode } = context.config;
      HtmlWebpackPlugin.__expression = "require('html-webpack-plugin')";
      if (type === BUILD_TARGET.STORYBOOK) {
        configChain.entry('index').merge([...initEntry].filter(Boolean));
        return;
      }
      // 服务器渲染 js 不需要构建 html
      if (type === BUILD_TARGET.BROWSER) {
        if (mode === PROJECT_MODE.MULTI) {
          // tslint:disable-next-line: no-shadowed-variable
          getEntry(context).forEach(({ template, name, chunks, entry }) => {
            configChain.entry(name).merge(entry);
            configChain.plugin(`html-webpack-plugin-${name}`).use(HtmlWebpackPlugin, [
              {
                minify: false,
                filename: `${name}.html`,
                template,
                chunks,
                inject: 'head',
              },
            ]);
          });
        }
        if (mode === PROJECT_MODE.SINGLE) {
          configChain
            .entry('index')
            .merge([...initEntry, context.resolve('./src/index')].filter(Boolean));
          configChain.plugin('html-webpack-plugin').use(HtmlWebpackPlugin, [
            {
              // https://github.com/jantimon/html-webpack-plugin/issues/870
              // html-webpack-plugin@next or chunksSortMode: 'none',
              minify: false,
              filename: 'index.html',
              template: './src/index.html',
              inject: 'head',
            },
          ]);
        }
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
            inline: ['runtime'],
          },
        ]);
        // html 最后插入js解析完成时间节点
        // const MarkTimePlugin = require('./webpack/plugins/mark-time-plugin');
        // MarkTimePlugin.__expression = "require('a8k/lib/webpack/plugins/mark-time-plugin')";
        // configChain.plugin('MarkTimePlugin').use(MarkTimePlugin);
      }
      // mark html end
      configChain.plugin('html-end').use(EmptyPlugin);
    });
  }
}
