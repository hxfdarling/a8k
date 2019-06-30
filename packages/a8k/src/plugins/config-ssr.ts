import { BUILD_ENV, BUILD_TARGET, ENV_DEV, ENV_PROD } from '@a8k/common/lib/constants';
import { SSR } from '@a8k/ssr';
import { IRouteMatch } from '@a8k/ssr/lib/common/utils/helper';
import { Application } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import httpProxyMiddleware from 'http-proxy-middleware';
import WebpackChain from 'webpack-chain';
import WebpackDevServer from 'webpack-dev-server';
import A8k from '..';
import { IResolveWebpackConfigOptions } from '../interface';
import { getEntry } from '../utils/entry';

export default class SsrConfig {
  public name = 'builtin:config-ssr';
  public apply(context: A8k) {
    context.chainWebpack(
      (config: WebpackChain, { type, watch, ssr }: IResolveWebpackConfigOptions) => {
        const { ssrConfig, publicPath } = context.config;

        const entry = getEntry(context);
        if (type === BUILD_TARGET.NODE && ssrConfig) {
          const isDevMode = watch;
          config.mode(isDevMode ? ENV_DEV : ENV_PROD);
          config.devtool(false);
          config.target('node');

          // tslint:disable-next-line: no-shadowed-variable
          entry.forEach(({ name, entry }) => {
            config.entry(name).merge(entry);
          });

          config.output
            .path(ssrConfig.entryPath)
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
        if (type === BUILD_TARGET.BROWSER) {
          const { mode } = context.internals;
          // 生产模式，或者开发模式下明确声明参数ssr，时需要添加该插件
          const needSsr = (mode === BUILD_ENV.DEVELOPMENT && ssr) || mode === BUILD_ENV.PRODUCTION;
          if (needSsr) {
            const SSRPlugin = require('../webpack/plugins/ssr-plugin');
            SSRPlugin.__expression = "require('a8k/lib/webpack/plugins/ssr-plugin')";
            config.plugin('ssr-plugin').use(SSRPlugin, [
              {
                entry,
                ssrConfig,
              },
            ]);
          }
        }
      }
    );
    context.hook(
      'devServerBefore',
      (app: Application, server: WebpackDevServer, { ssr }: IResolveWebpackConfigOptions) => {
        const { ssrConfig } = context.config;
        if (ssrConfig && ssr) {
          const { contentBase, https, port, host } = ssrConfig;
          const protocol = https ? 'https://' : 'http://';
          const target = `${protocol + host}:${port}${contentBase || ''}`;
          const ssrInst = new SSR(ssrConfig);
          app.use((req: IncomingMessage, res: ServerResponse, next: any) => {
            const route: IRouteMatch = ssrInst.router(req);
            if (route) {
              const proxyConfig = {
                context: req.url,
                secure: false,
                target,
              };
              return httpProxyMiddleware(req.url, proxyConfig)(req, res, next);
            } else {
              next();
            }
          });
        }
      }
    );
    context.hook(
      'devServerAfter',
      (app: Application, server: WebpackDevServer, { ssr }: IResolveWebpackConfigOptions) => {
        const { ssrConfig } = context.config;
        if (ssrConfig && ssr) {
          const { contentBase, https, port, host } = ssrConfig;
          const protocol = https ? 'https://' : 'http://';
          const target = `${protocol + host}:${port}${contentBase || ''}`;
          app.all('*', (req, res, next) => {
            console.log(req.url);
            const proxyConfig = {
              context: req.url,
              secure: false,
              target,
            };
            return httpProxyMiddleware(req.url, proxyConfig)(req, res, next);
          });
        }
      }
    );
  }
}
