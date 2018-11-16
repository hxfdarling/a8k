const path = require('path');
const os = require('os');
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');
const textTable = require('text-table');
const getIp = require('internal-ip');
const prettyMs = require('pretty-ms');
const formatWebpackMessages = require('../../../utils/formatWebpackMessages');

/**
 * @typedef {Object} Options
 * @property {String} mode
 * @property {Object} devServer
 * @property {Boolean} showFileStats
 */

class ReportStatusPlugin {
  /**
   *Creates an instance of ReportStatusPlugin.
   * @param {Options} options
   * @memberof ReportStatusPlugin
   */
  constructor(options) {
    this.options = Object.assign({}, options);
  }

  apply(compiler) {
    let state = 0;
    compiler.hooks.done.tap('report-status', async stats => {
      if (stats.hasErrors()) {
        console.log(chalk.red.bold('Failed to compile:\n'));
        process.exitCode = 1;
      }

      if (stats.hasErrors() || stats.hasWarnings()) {
        const messages = formatWebpackMessages(stats.toJson());
        // eslint-disable-next-line
        for (const error of messages.errors) {
          console.log(error);
        }
        // eslint-disable-next-line
        for (const warning of messages.warnings) {
          console.log(warning);
        }
        return;
      }

      console.log(chalk.green.bold(`Built successfully in ${prettyMs(stats.endTime - stats.startTime)}!`));

      if (this.options.mode === 'development' && this.options && !state) {
        state = 1;
        const { host, port, https } = this.options.devServer;
        const protocol = https ? 'https://' : 'http://';
        const isAnyHost = host === '0.0.0.0';

        // eslint-disable-next-line max-len
        const getLocalAddress = color => `${protocol}${isAnyHost ? 'localhost' : host}:${color ? chalk.bold(port) : port}`;
        console.log(`- Local Server:       ${getLocalAddress(true)}`);
        const ip = await getIp.v4();
        if (ip) {
          console.log(chalk.dim(`- On Your Network:    ${protocol}${ip}:${port}`));
        }
        console.log();
      }

      const outDir = path.relative(process.cwd(), compiler.options.output.path);

      if (this.options.mode !== 'development') {
        console.log();
        const fileStats = textTable(
          Object.keys(stats.compilation.assets)
            .sort((a, b) => {
              const delta = a.split('/').length - b.split('/').length;
              if (delta > 0) {
                return 1;
              }
              if (delta < 0) {
                return -1;
              }
              return a > b ? 1 : -1;
            })
            .map(filename => {
              const parsedPath = path.parse(path.join(outDir, filename));
              const prettyPath = `${chalk.dim(parsedPath.dir ? `${parsedPath.dir}/` : '')}${chalk.bold(
                parsedPath.base
              )}`;
              const file = stats.compilation.assets[filename];
              const size = file.size();
              return [prettyPath, chalk.green.bold(prettyBytes(size))];
            }),
          {
            stringLength: require('string-width'),
          }
        );
        console.log(fileStats);
      }
    });

    compiler.hooks.invalid.tap('report-invalid', (filename, ctime) => {
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
  }
}

module.exports = ReportStatusPlugin;
