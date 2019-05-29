import formatWebpackMessages from '@a8k/dev-utils/formatWebpackMessages';
import chalk from 'chalk';

/**
 * @typedef {Object} Options
 * @property {Boolean} silent
 */

class ReportStatusPlugin {
  options: any;

  /**
   *Creates an instance of ReportStatusPlugin.
   * @param {Options} options
   * @memberof ReportStatusPlugin
   */
  constructor(options) {
    this.options = { ...options };
  }

  apply(compiler) {
    const { options } = this;

    compiler.hooks.done.tap('report-status', async stats => {
      const messages = formatWebpackMessages(
        stats.toJson({ all: false, warnings: true, errors: true })
      );

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
      if (messages.warnings.length && !options.silent) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(messages.warnings.join('\n\n'));

        // Teach some ESLint tricks.
        console.log(
          `\nSearch for the ${chalk.underline(
            chalk.yellow('keywords')
          )} to learn more about each warning.`
        );
        console.log(
          `To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`
        );
      }
    });
  }
}

module.exports = ReportStatusPlugin;
