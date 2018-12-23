const chalk = require('chalk');
const webpack = require('webpack');

module.exports = function BuildTime(options = {}) {
  const { name = '' } = options;
  const stream = process.stderr;
  let running = false;
  let startTime = 0;
  let lastPercent = 0;

  return new webpack.ProgressPlugin(percent => {
    if (!running && lastPercent !== 0) {
      stream.write('\n');
    }
    if (!running) {
      running = true;
      startTime = Date.now();
      lastPercent = 0;
    } else if (percent === 1) {
      const buildTime = `${(Date.now() - startTime) / 1000}s`;
      stream.write(chalk.green.bold(`Build ${name} completed in ${buildTime}\n\n`));
      running = false;
    }
  });
};
