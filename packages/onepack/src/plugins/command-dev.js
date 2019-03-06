import logger from '@onepack/cli-utils/logger';
import formatWebpackMessages from '@onepack/dev-utils/formatWebpackMessages';
import chalk from 'chalk';
import os from 'os';
import prettyMs from 'pretty-ms';
import WebpackDevServer from 'webpack-dev-server';
import { ENV_DEV, TYPE_CLIENT, TYPE_SERVER } from '../const';
import { printInstructions, setProxy } from '../utils/helper';

process.env.NODE_ENV = ENV_DEV;

const isInteractive = process.stdout.isTTY;

export default {
  apply: context => {
    context
      .registerCommand(
        'dev',
        '启动开发者模式',
        async ({ ssr, port, eslint, cssSourceMap, inspectWebpack }) => {
          context.options.inspectWebpack = inspectWebpack;
          context.config.webpackMode = ENV_DEV;

          const options = { ssr, port, eslint, cssSourceMap };
          const { devServer, ssrDevServer, ssrConfig } = context.config;

          if (ssr) {
            // eslint-disable-next-line no-shadow
            const { contentBase, https, port, host } = ssrDevServer;
            if (!port) {
              logger.error('如需要调试直出，请配置 ssrDevServer:{port:xxx} 端口信息');
              process.exit(-1);
            }
            devServer.before = app => {
              const protocol = https ? 'https://' : 'http://';
              const proxy = {};
              Object.keys(ssrConfig.entry).forEach(key => {
                const pageName = ssrConfig.entry[key].split('/');
                const file = `/${pageName[pageName.length - 2]}.html`;
                proxy[file] = {
                  target: `${protocol + host}:${port}${contentBase || ''}`,
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

            let startCompilerTime = Date.now();

            const compiler = context.createWebpackCompiler(webpackConfig);

            compiler.hooks.invalid.tap('invalid', (filename, ctime) => {
              startCompilerTime = Date.now();
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
            });

            let isFirstCompile = true;

            // "done" event fires when Webpack has finished recompiling the bundle.
            // Whether or not you have warnings or errors, you will get this event.
            compiler.hooks.done.tap('done', stats => {
              if (isInteractive) {
                // logger.clearConsole();
              }
              const messages = formatWebpackMessages(
                stats.toJson({ all: false, warnings: true, errors: true })
              );
              const isSuccessful = !messages.errors.length && !messages.warnings.length;
              if (isSuccessful) {
                console.log(
                  chalk.green(
                    `Compiled successfully in ${prettyMs(Date.now() - startCompilerTime)}`
                  )
                );
              }
              if (isSuccessful && isFirstCompile) {
                printInstructions(devServer);
              }
              isFirstCompile = false;

              // If errors exist, only show errors.
              if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                  messages.errors.length = 1;
                }
                console.log(chalk.red('Failed to compile.\n'));
                console.log(messages.errors.join('\n\n'));
                return;
              }

              // Show warnings if no errors were found.
              if (messages.warnings.length) {
                console.log(chalk.yellow('Compiled with warnings.\n'));
                console.log(messages.warnings.join('\n\n'));

                // Teach some ESLint tricks.
                console.log(
                  `\nSearch for the ${chalk.underline(
                    chalk.yellow('keywords')
                  )} to learn more about each warning.`
                );
                console.log(
                  `To ignore, add ${chalk.cyan(
                    '// eslint-disable-next-line'
                  )} to the line before.\n`
                );
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
              process.on(sig, () => {
                server.close();
                process.exit();
              });
            });
          } catch (err) {
            logger.info(chalk.red('Failed to compile.'));
            logger.error(err.message || err);
            process.exit(1);
          }
          if (options.ssr) {
            logger.info('starting ssr watch.');
            const webpackConfigSSR = context.resolveWebpackConfig({
              ...options,
              type: TYPE_SERVER,
              watch: true,
            });
            context.runWebpack(webpackConfigSSR);
          }
        }
      )
      .option('-s, --ssr', '服务端渲染开发调试')
      .option('-p, --port <port>', '配置开发者服务器监听端口')
      .option('--no-eslint', '禁用eslint检测代码')
      .option('-c, --css-source-map', '使用cssSourceMap ，但会导致开发模式 FOUC')
      .option('--inspectWebpack', '输出webpack配置信息');
  },
  name: 'builtin:dev',
};
