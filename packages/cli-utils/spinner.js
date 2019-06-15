const ora = require('ora');

const spinner = ora();
let lastMsg = null;

exports.logWithSpinner = msg => {
  if (lastMsg) {
    spinner.stopAndPersist({
      text: lastMsg.text,
    });
  }
  spinner.text = ` ${msg}`;
  lastMsg = {
    text: msg,
  };
  spinner.start();
};

exports.succeed = msg => {
  spinner.succeed(msg);
};
exports.info = msg => {
  spinner.info(msg);
};

exports.warn = msg => {
  spinner.warn(msg);
};
exports.fail = msg => {
  spinner.fail(msg);
};

exports.stopSpinner = persist => {
  if (lastMsg && persist !== false) {
    spinner.stopAndPersist({
      text: lastMsg.text,
    });
  } else {
    spinner.stop();
  }
  lastMsg = null;
};

exports.pauseSpinner = () => {
  spinner.stop();
};

exports.resumeSpinner = () => {
  spinner.start();
};
