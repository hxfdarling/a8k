import { logger } from '@a8k/common';
import { BUILD_ENV, BUILD_TARGET, ENV_DEV } from '@a8k/common/lib/constants';
import chalk from 'chalk';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import A8k from '..';
import cleanUnusedCache from '../utils/clean-old-cache';
import { printInstructions, setProxy } from '../utils/helper';

const isInteractive = process.stdout.isTTY;

const invalidHook = (filename, ctime) => {
  if (isInteractive) {
    logger.clearConsole();
  }
  const d = new Date(ctime);
  const leftpad = v => (v > 9 ? v : `0${v}`);
  const prettyPath = p => p.replace(os.homedir(), '~');
  console.log(
    chalk.cyan(
      `[${leftpad(d.getHours())}:${leftpad(d.getMinutes())}:${leftpad(
        d.getSeconds()
      )}] Rebuilding due to changes made in ${prettyPath(filename)}`
    )
  );
};

export default class DevCommand {
  public name = 'builtin:dev';
  public apply(context: A8k) {
    context
      .registerCommand('dev')
      .description('启动开发者模式')
      .option('-s, --ssr', '服务端渲染开发调试')
      .option('-p, --port <port>', '配置开发者服务器监听端口')
      .option('--eslint', '启用eslint检测代码')
      .option('--stylelint', '启用stylelint检测css')
      .option('-c, --css-source-map', '使用cssSourceMap ，但会导致开发模式 FOUC')
      .option('--no-silent', '输出日志')
      .option('--inspectWebpack', '输出webpack配置信息')
      .action(async ({ ssr, port, eslint, silent, stylelint, cssSourceMap, inspectWebpack }) => {
        await cleanUnusedCache(context);
        process.env.NODE_ENV = ENV_DEV;
        context.options.inspectWebpack = inspectWebpack;
        context.internals.mode = BUILD_ENV.DEVELOPMENT;
        if (port) {
          context.config.devServer.port = port;
        }
        if (silent) {
          process.noDeprecation = true;
        }

        const options = { ssr, eslint, stylelint, cssSourceMap };
        const { devServer, ssrConfig, pagesDir } = context.config;

        if (ssr) {
          if (!ssrConfig) {
            logger.error('项目没有启用服务器渲染，请参考文档配置');
            process.exit(-1);
            return;
          }
          const { contentBase, https, port: ssrPort, host } = ssrConfig;

          if (!ssrPort) {
            logger.error('如需要调试直出，请配置 ssrConfig:{port:xxx} 端口信息');
            process.exit(-1);
          }

          fs.ensureDirSync(ssrConfig.dist);
          fs.ensureDirSync(ssrConfig.view);

          devServer.before = (app: any) => {
            const protocol = https ? 'https://' : 'http://';
            const proxy = {};
            // 支持配置模式
            if (ssrConfig.entry) {
              Object.keys(ssrConfig.entry).forEach(key => {
                const pageName = ssrConfig.entry[key].split('/');
                const file = `/${pageName[pageName.length - 2]}.html`;
                proxy[file] = {
                  target: `${protocol + host}:${ssrPort}${contentBase || ''}`,
                  secure: false,
                };
              });
            } else {
              fs.readdirSync(pagesDir)
                .map((file: string) => path.basename(file))
                .forEach((name: string) => {
                  const file = `/${name}.html`;
                  proxy[file] = {
                    target: `${protocol + host}:${ssrPort}${contentBase || ''}`,
                    secure: false,
                  };
                });
            }
            setProxy(app, proxy);
          };
        }
        try {
          const webpackConfig = context.resolveWebpackConfig({
            ...options,
            type: BUILD_TARGET.BROWSER,
          });

          const compiler = context.createWebpackCompiler(webpackConfig);

          compiler.hooks.invalid.tap('invalid', invalidHook);

          let isFirstCompile = true;
          compiler.hooks.done.tap('done', stats => {
            if (!stats.hasErrors() && isFirstCompile) {
              printInstructions(devServer);
              isFirstCompile = false;
            }
          });

          const server = new WebpackDevServer(compiler, devServer);
          // Launch WebpackDevServer.
          server.listen(devServer.port, devServer.host, err => {
            if (err) {
              logger.error(err);
              process.exit(1);
            }
          });

          ['SIGINT', 'SIGTERM'].forEach(sig => {
            process.on(sig as any, () => {
              server.close();
              process.exit();
            });
          });
        } catch (err) {
          logger.info(chalk.red('Failed to compile.'));
          logger.error(err.stack);
          process.exit(1);
        }
        if (options.ssr) {
          const webpackConfigSSR = context.resolveWebpackConfig({
            ...options,
            type: BUILD_TARGET.NODE,
            watch: true,
          });
          const compiler = context.createWebpackCompiler(webpackConfigSSR);
          compiler.watch(webpackConfigSSR.watchOptions, err => {
            if (err) {
              logger.error(err.stack || err);
              if (err.details) {
                logger.error(err.details);
              }
            }
          });
        }
      });
  }
}
