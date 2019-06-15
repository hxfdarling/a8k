const chalk = require('chalk');
const padStart = require('string.prototype.padstart');
const EventEmitter = require('events');

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
      return i === 0 ? `${label} ${line}` : padStart(line, chalk.reset(label).length);
    })
    .join('\n');
};

const chalkTag = msg => chalk.bgBlackBright.white.dim(` ${msg} `);

class Logger {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  debug(...args) {
    if (!this.options.debug) {
      return;
    }
    console.log(chalk.magenta.bold('===>'), ...args.map(str => chalk.bold(str)));
  }

  success(...args) {
    console.log(...args);
  }

  log(msg = '', tag = null) {
    tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg);
    _log('log', tag, msg);
  }

  info(msg, tag = null) {
    console.log(format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg));
    _log('info', tag, msg);
  }

  done(msg, tag = null) {
    console.log(format(chalk.bgGreen.black(' DONE ') + (tag ? chalkTag(tag) : ''), msg));
    _log('done', tag, msg);
  }

  warn(msg, tag = null) {
    console.warn(
      format(chalk.bgYellow.black(' WARN ') + (tag ? chalkTag(tag) : ''), chalk.yellow(msg))
    );
    _log('warn', tag, msg);
  }

  error(msg, tag = null) {
    console.error(format(chalk.bgRed(' ERROR ') + (tag ? chalkTag(tag) : ''), chalk.red(msg)));
    _log('error', tag, msg);
    if (msg instanceof Error) {
      console.error(msg.stack);
      _log('error', tag, msg.stack);
    }
    process.exitCode = process.exitCode || 1;
  }

  clearConsole() {
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
  }
}

module.exports = new Logger();
