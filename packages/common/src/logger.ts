import chalk from 'chalk';

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

export enum LoggerLevel {
  info = 'info',
  debug = 'debug',
  warn = 'warn',
  error = 'error',
}
export interface ILoggerOptions {
  debug?: boolean;
}
class Logger {
  public options: ILoggerOptions;
  private level: { [key: string]: boolean } = {};
  constructor(options: ILoggerOptions) {
    this.setOptions(options);
    if (process.env.LOG_LEVEL) {
      this.setLevel(process.env.LOG_LEVEL as LoggerLevel);
    }
  }
  public setLevel(level: LoggerLevel) {
    Object.keys(this.level).forEach(key => {
      this.level[key] = false;
    });
    switch (level) {
      case LoggerLevel.debug:
        this.level[LoggerLevel.debug] = true;
        this.level[LoggerLevel.info] = true;
        this.level[LoggerLevel.warn] = true;
        this.level[LoggerLevel.error] = true;
        break;
      case LoggerLevel.info:
        this.level[LoggerLevel.info] = true;
        this.level[LoggerLevel.warn] = true;
        this.level[LoggerLevel.error] = true;
        break;
      case LoggerLevel.warn:
        this.level[LoggerLevel.warn] = true;
        this.level[LoggerLevel.error] = true;
        break;
      case LoggerLevel.error:
        this.level[LoggerLevel.error] = true;
        break;
      default:
        this.level[LoggerLevel.info] = true;
        this.level[LoggerLevel.warn] = true;
        this.level[LoggerLevel.error] = true;
        break;
    }
  }
  public setOptions(options: ILoggerOptions) {
    this.options = { ...this.options, ...options };
    if (this.options.debug) {
      this.setLevel(LoggerLevel.debug);
    } else {
      this.setLevel(LoggerLevel.info);
    }
  }
  public debug(...args: any[]) {
    if (!this.level[LoggerLevel.debug]) {
      return;
    }
    console.log(
      chalk.magenta.bold('===>'),
      ...args.map(str => (typeof str === 'string' ? chalk.bold(str) : str))
    );
  }

  public info(msg, tag = null) {
    if (!this.level[LoggerLevel.info]) {
      return;
    }
    console.log(format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg));
  }

  public warn(msg, tag = null) {
    if (!this.level[LoggerLevel.warn]) {
      return;
    }
    console.warn(
      format(chalk.bgYellow.black(' WARN ') + (tag ? chalkTag(tag) : ''), chalk.yellow(msg))
    );
  }

  public error(msg, tag = null) {
    if (!this.level[LoggerLevel.error]) {
      return;
    }
    console.error(format(chalk.bgRed(' ERROR ') + (tag ? chalkTag(tag) : ''), chalk.red(msg)));

    if (msg instanceof Error) {
      console.error(msg.stack);
    }
    process.exitCode = process.exitCode || 1;
  }

  public clearConsole() {
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
  }
}

export default new Logger({});
