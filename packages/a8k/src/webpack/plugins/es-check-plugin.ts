import loadConfig from '@a8k/cli-utils/load-config';
import logger from '@a8k/cli-utils/logger';
import { Options, parse } from 'acorn';
import micromatch from 'micromatch';

interface EsCheckOptions {
  ecmaVersion: string;
  baseDir?: string;
  module?: boolean;
  allowHashBang?: boolean;
  exclude?: Array<string>;
}

const check = (files: Array<{ filename: string; source: string }>, acornOpts: Options) => {
  let errArray = [];
  files.forEach(({ filename, source }) => {
    logger.debug(`ES-Check: checking ${filename}`);
    try {
      parse(source, acornOpts);
    } catch (err) {
      logger.debug(`ES-Check: failed to parse file: ${filename} \n - error: ${err}`);
      const errorObj = {
        err,
        stack: err.stack,
        file: filename,
      };
      errArray.push(errorObj);
    }
  });

  if (errArray.length > 0) {
    logger.error(`ES-Check: there were ${errArray.length} ES version matching errors.`);
    logger.error(`maybe you need not check some file support es ${acornOpts.ecmaVersion}`);
    logger.error(
      `you can add "escheck.exclude" option into "a8k.config.json" config to ignore this file or check you code`
    );
    errArray.forEach(o => {
      logger.info(`
          ES-Check Error:
          ----
          · erroring file: ${o.file}
          · error: ${o.err}
          · see the printed err.stack below for context
          ----\n
          ${o.stack}
        `);
    });
    process.exit(1);
  }
};

class EsCheckPlugin {
  options: EsCheckOptions;
  name = 'es-check-plugin';
  acornOpts: Options;
  exclude: Array<string>;
  constructor(options: EsCheckOptions) {
    this.options = { ...options };
    const res = loadConfig.loadSync({
      files: ['.escheckrc', '.escheckrc.js', '.escheckrc.json', 'package.json'],
      cwd: options.baseDir || process.cwd(),
      packageKey: 'escheck',
    });
    if (!res.path) {
      logger.debug('ES-Check: is not using any config file');
    } else {
      logger.debug('ES-Check: is using you config file');
    }

    let config = res.data || {};

    let esModule = options.module || config.module;
    let ecmaVersion = options.ecmaVersion || config.ecmaVersion;
    let allowHashBang = options.allowHashBang || config.allowHashBang;
    // 可以配置不校验的文件
    let exclude = (config.exclude || []).concat(options.exclude || []);
    if (!ecmaVersion) {
      logger.error(
        'No ecmaScript version passed in or found in .escheckrc. Please set your ecmaScript version in the CLI or in .escheckrc'
      );
      process.exit(1);
    }

    /**
     * define ecmaScript version
     * - Default ecmaScript version is '5'
     */
    switch (ecmaVersion) {
      case 'es3':
        ecmaVersion = '3';
        break;
      case 'es4':
        ecmaVersion = '4';
        break;
      case 'es5':
        ecmaVersion = '5';
        break;
      case 'es6':
        ecmaVersion = '6';
        break;
      case 'es7':
        ecmaVersion = '7';
        break;
      case 'es8':
        ecmaVersion = '8';
        break;
      case 'es9':
        ecmaVersion = '9';
        break;
      case 'es10':
        ecmaVersion = '10';
        break;
      case 'es2015':
        ecmaVersion = '6';
        break;
      case 'es2016':
        ecmaVersion = '7';
        break;
      case 'es2017':
        ecmaVersion = '8';
        break;
      case 'es2018':
        ecmaVersion = '9';
        break;
      case 'es2019':
        ecmaVersion = '10';
        break;
      default:
        logger.error('Invalid ecmaScript version, please pass a valid version');
        process.exit(1);
    }

    this.options.ecmaVersion = ecmaVersion;
    this.options.allowHashBang = allowHashBang;
    this.options.module = esModule;
    this.options.exclude = exclude;

    const acornOpts = { ecmaVersion, silent: true } as Options;

    if (esModule) {
      acornOpts.sourceType = 'module';
    }

    if (allowHashBang) {
      acornOpts.allowHashBang = true;
    }
    this.acornOpts = acornOpts;
  }
  apply(compiler) {
    logger.debug(` Going to check files using version ${this.options.ecmaVersion}`);
    compiler.hooks.afterEmit.tap(this.name, ({ assets }) => {
      const files = Object.keys(assets)
        .filter(
          filename =>
            /\.js$/.test(filename) &&
            !this.options.exclude.some(i => micromatch.isMatch(filename, i))
        )
        .map((filename: string) => {
          return { filename, source: assets[filename].source() };
        });
      // files.push({ filename: 'test.js', source: 'const a = 1;' });
      check(files, this.acornOpts);
    });
  }
}

module.exports = EsCheckPlugin;
