import ora from 'ora';

const spinner = ora();
let lastMsg = null;

export const logWithSpinner = msg => {
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

export const succeed = (msg?) => {
  spinner.succeed(msg);
};
export const info = msg => {
  spinner.info(msg);
};
export const warn = msg => {
  spinner.warn(msg);
};
export const fail = (msg?) => {
  spinner.fail(msg);
};
export const stop = () => {
  spinner.stop();
};
export const stopSpinner = (persist?) => {
  if (lastMsg && persist !== false) {
    spinner.stopAndPersist({
      text: lastMsg.text,
    });
  } else {
    spinner.stop();
  }
  lastMsg = null;
};

export const pauseSpinner = () => {
  spinner.stop();
};

export const resumeSpinner = () => {
  spinner.start();
};
