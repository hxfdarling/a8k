const commandExists = require('command-exists').sync;
const shell = require('shelljs');
const { logger } = require('@a8k/common');

module.exports = () => {
  let npmCmd = 'npm';
  if (process.env.NPM_CLIENT) {
    npmCmd = process.env.NPM_CLIENT;
    logger.debug(`use npm client is "${npmCmd}"`);
    if (!commandExists(npmCmd)) {
      logger.warn(`${npmCmd} npm client is maybe not exists`);
    }
  } else if (commandExists('tnpm')) {
    npmCmd = 'tnpm';
    if (
      shell.exec(`${npmCmd} info npm`, {
        silent: true,
      }).stderr
    ) {
      logger.warn(`${npmCmd} not work, use npm instead of ${npmCmd}`);
      npmCmd = 'npm';
    }
  }
  return npmCmd;
};
