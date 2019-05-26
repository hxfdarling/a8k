import logger from '@a8k/cli-utils/logger';
import formatWebpackMessages from '@a8k/dev-utils/formatWebpackMessages';
import chalk from 'chalk';
import os from 'os';
import WebpackDevServer from 'webpack-dev-server';
import { ENV_DEV, TYPE_CLIENT, TYPE_SERVER } from '../const';
import cleanUnusedCache from '../utils/clean-old-cache';
import { printInstructions, setProxy } from '../utils/helper';
import A8k from '..';

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
  name = 'builtin:dev';
  apply(context: A8k) {
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
        context.internals.mode = ENV_DEV;
        context.config.publicPath = ''; // 开发模式下面不用publicPath
        if (port) {
          context.config.devServer.port = port;
        }
        if (silent) {
          process.noDeprecation = true;
        }

        const options = { ssr, eslint, stylelint, cssSourceMap };
        const { devServer, ssrDevServer, ssrConfig } = context.config;

        if (ssr) {
          const { contentBase, https, port: ssrPort, host } = ssrDevServer;
          if (!ssrPort) {
            logger.error('如需要调试直出，请配置 ssrDevServer:{port:xxx} 端口信息');
            process.exit(-1);
          }
          if (!ssrConfig.entry) {
            logger.error('没有在ssrConfig中配置需要直出的页面');
            process.exit(-1);
          }
          devServer.before = app => {
            const protocol = https ? 'https://' : 'http://';
            const proxy = {};
            Object.keys(ssrConfig.entry).forEach(key => {
              const pageName = ssrConfig.entry[key].split('/');
              const file = `/${pageName[pageName.length - 2]}.html`;
              proxy[file] = {
                target: `${protocol + host}:${ssrPort}${contentBase || ''}`,
                secure: false,
              };
            });
            setProxy(app, proxy);
          };
        }
        try {
          const webpackConfig = context.resolveWebpackConfig({
            ...options,
            type: TYPE_CLIENT,
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
            type: TYPE_SERVER,
            watch: true,
          });
          const compiler = context.createWebpackCompiler(webpackConfigSSR);
          compiler.watch(webpackConfigSSR.watchOptions, err => {
            if (err) {
              context.logger.error(err.stack || err);
              if (err.details) {
                context.logger.error(err.details);
              }
            }
          });
        }
      });
  }
}
