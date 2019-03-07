const commandExists = require('command-exists').sync;
const shell = require('shelljs');
const logger = require('./logger');

module.exports = () => {
  let npmCmd = 'npm';
  if (commandExists('tnpm')) {
    npmCmd = 'tnpm';
    try {
      shell.execSync(`${npmCmd} info tnpm`, {
        silent: true,
      });
    } catch (e) {
      logger.warn('tnpm 服务无法访问,将使用npm执行');
      npmCmd = 'npm';
    }
  }
  return npmCmd;
};
