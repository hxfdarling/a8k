import fs from 'fs-extra';
import path from 'path';
import { ENV_DEV, ENV_PROD, TYPE_CLIENT, PROJECT_MODE_MULTI, PROJECT_MODE_SINGLE } from '../const';
import EmptyPlugin from '../webpack/plugins/empty-plugin';

const DEFAULT_PAGES_DIR = './src/pages';

const getPages = context => {
  const { ignorePages = [] } = context.config;
  const pagesDir = context.resolve(context.config.pagesDir || DEFAULT_PAGES_DIR);

  return fs.readdirSync(pagesDir).filter(item => {
    if (ignorePages.includes(item)) {
      return false;
    }
    let filepath = path.join(pagesDir, item, 'index.js');
    const filePathTs = path.join(pagesDir, item, 'index.ts');

    if (!fs.existsSync(filepath)) {
      filepath = `${filepath}x`; // jsx
    }
    if (!fs.existsSync(filepath)) {
      filepath = filePathTs;
    }
    if (!fs.existsSync(filepath)) {
      filepath = `${filepath}x`; // tsx
    }
    if (!fs.existsSync(filepath)) {
      return false;
    }
    return true;
  });
};

exports.apply = context => {
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  HtmlWebpackPlugin.__expression = "require('html-webpack-plugin')";
  context.chainWebpack((config, { type }) => {
    const pagesDir = context.config.pagesDir || DEFAULT_PAGES_DIR;
    // 服务器渲染 js 不需要构建 html
    if (type === TYPE_CLIENT) {
      // 处理公共entry
      const initEntry = Object.keys(context.config.entry || {})
        .reduce((result, key) => {
          const temp = context.config.entry[key];
          if (Array.isArray(temp)) {
            result = result.concat(temp);
          } else {
            result.push(temp);
          }
          return result;
        }, [])
        .map(i => context.resolve(i));

      const isDev = context.internals.mode === ENV_DEV;
      const webpackHotDevClient = require.resolve('@a8k/dev-utils/webpackHotDevClient');

      if (context.config.mode === PROJECT_MODE_SINGLE) {
        config
          .entry('index')
          .merge(
            [...initEntry, context.resolve('./src/index'), isDev && webpackHotDevClient].filter(
              Boolean
            )
          );
        config.plugin('html-webpack-plugin').use(HtmlWebpackPlugin, [
          {
            // https://github.com/jantimon/html-webpack-plugin/issues/870
            // html-webpack-plugin@next or chunksSortMode: 'none',
            minify: false,
            filename: 'index.html',
            template: './src/index.html',
          },
        ]);
      }
      if (context.config.mode === PROJECT_MODE_MULTI) {
        getPages(context).forEach(file => {
          const name = path.basename(file);
          const dir = context.resolve(`${pagesDir}/${file}`);
          file = `${dir}/index.html`;

          config
            .entry(name)
            .merge([...initEntry, `${dir}/index`, isDev && webpackHotDevClient].filter(Boolean));

          const chunks = [name];
          config.plugin(`html-webpack-plugin-${name}`).use(HtmlWebpackPlugin, [
            {
              minify: false,
              filename: `${name}.html`,
              template: file,
              chunks,
            },
          ]);
        });
      }
      if (config.sri) {
        const SriPlugin = require('webpack-subresource-integrity');
        SriPlugin.__expression = "require('webpack-subresource-integrity')";
        // 支持js资源完整性校验
        // https://www.w3.org/TR/SRI/
        config.plugin('sri-plugin').use(SriPlugin, [
          {
            hashFuncNames: ['sha256'],
            enabled: context.internals.mode === ENV_PROD,
          },
        ]);
      }
      // mark html end
      config.plugin('html-end').use(EmptyPlugin);
    }
  });
};

exports.name = 'builtin:config-html';
