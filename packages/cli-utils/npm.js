const commandExists = require('command-exists').sync;
const shell = require('shelljs');
const logger = require('./logger');

module.exports = () => {
  let npmCmd = 'npm';
  if (commandExists('tnpm')) {
    npmCmd = 'tnpm';
    if (
      shell.exec(`${npmCmd} info tnpm`, {
        silent: true,
      }).stderr
    ) {
      logger.warn('tnpm 服务无法访问,将使用npm执行');
      npmCmd = 'npm';
    }
  }
  return npmCmd;
};
