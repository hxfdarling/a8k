const ora = require('ora');
const { success } = require('./icon');

const spinner = ora();
let lastMsg = null;

exports.logWithSpinner = (symbol, msg) => {
  if (!msg) {
    msg = symbol;
    symbol = success;
  }
  if (lastMsg) {
    spinner.stopAndPersist({
      symbol: lastMsg.symbol,
      text: lastMsg.text,
    });
  }
  spinner.text = ` ${msg}`;
  lastMsg = {
    symbol: `${symbol} `,
    text: msg,
  };
  spinner.start();
};

exports.stopSpinner = persist => {
  if (lastMsg && persist !== false) {
    spinner.stopAndPersist({
      symbol: lastMsg.symbol,
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
