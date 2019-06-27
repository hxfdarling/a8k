import chalk from 'chalk';
import EventEmitter from 'events';

exports.events = new EventEmitter();

function _log(type, tag, message) {
  if (message) {
    exports.events.emit('log', {
      message,
      type,
      tag,
    });
  }
}

const format = (label, msg) => {
  return msg
    .split('\n')
    .map((line, i) => {
      return i === 0
        ? `${label} ${line}`
        : String.prototype.padStart.call(line, chalk.reset(label).length);
    })
    .join('\n');
};

const chalkTag = msg => chalk.bgBlackBright.white.dim(` ${msg} `);

class Logger {
  public options: any;
  constructor(options) {
    this.setOptions(options);
  }

  public setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  public debug(...args) {
    if (!this.options.debug) {
      return;
    }
    console.log(chalk.magenta.bold('===>'), ...args.map(str => chalk.bold(str)));
  }

  public success(...args) {
    console.log(...args);
  }

  public log(msg = '', tag = null) {
    tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg);
    _log('log', tag, msg);
  }

  public info(msg, tag = null) {
    console.log(format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg));
    _log('info', tag, msg);
  }

  public done(msg, tag = null) {
    console.log(format(chalk.bgGreen.black(' DONE ') + (tag ? chalkTag(tag) : ''), msg));
    _log('done', tag, msg);
  }

  public warn(msg, tag = null) {
    console.warn(
      format(chalk.bgYellow.black(' WARN ') + (tag ? chalkTag(tag) : ''), chalk.yellow(msg))
    );
    _log('warn', tag, msg);
  }

  public error(msg, tag = null) {
    console.error(format(chalk.bgRed(' ERROR ') + (tag ? chalkTag(tag) : ''), chalk.red(msg)));
    _log('error', tag, msg);
    if (msg instanceof Error) {
      console.error(msg.stack);
      _log('error', tag, msg.stack);
    }
    process.exitCode = process.exitCode || 1;
  }

  public clearConsole() {
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
  }
}

export default new Logger({});
