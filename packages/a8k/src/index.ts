import loadConfig from '@a8k/cli-utils/load-config';
import logger from '@a8k/cli-utils/logger';
import program from 'commander';
import fs from 'fs-extra';
import { merge } from 'lodash';
import path from 'path';
import resolveFrom from 'resolve-from';
import { ENV_DEV, ENV_PROD, TYPE_CLIENT } from './const';
import defaultConfig from './default-config';
import Hooks from './hooks';
import loadPkg from './utils/load-pkg';
import loadPlugins from './utils/load-plugins';

const { version } = require('../package.json');

program.version(version);

program.option('--nochecklatest', '不检测最新版本');

program.on('command:*', () => {
  logger.error(
    `Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`
  );
  process.exit(1);
});

interface A8kOptions {
  cliArgs: Array<string>;
  cliPath: string;
  baseDir: string;
  debug?: boolean;
  configFile?: string;
  inspectWebpack?: boolean;
}
interface A8kConfig {
  dist: any;
  cacheBase: any;
  cache: any;
  ssrConfig: any;
  devServer: any;
  host: string;
  port: string;
  chainWebpack: Function;
  envs: any;
  publicPath: string;
  plugins: Array<string>;
  webpackOverride: Function;
  // [key: string]: any;
}

interface Internals {
  mode: string;
}
export default class A8k {
  options: A8kOptions;
  config: A8kConfig;
  hooks = new Hooks();
  commands = new Map();
  logger = logger;
  internals: Internals;
  buildId: string;
  pkg: any;
  cli: any;
  configFilePath: string;
  plugins = [];
  _inspectWebpackConfigPath: string;
  constructor(options?: A8kOptions) {
    this.options = {
      cliPath: path.resolve(__dirname, '../'),
      cliArgs: process.argv,
      baseDir: path.resolve('.'),
    };
    if (options) {
      this.options = { ...this.options, ...options };
      const { baseDir } = options;
      if (baseDir) {
        this.options.baseDir = path.resolve(baseDir);
      }
    }
    const { baseDir, debug } = this.options;

    this.config = {} as A8kConfig;
    this.logger = logger;

    this.internals = {
      mode: ENV_DEV,
    };

    this.buildId = Math.random()
      .toString(36)
      .substring(7);
    this.pkg = loadPkg({ cwd: baseDir });
    this.cli = program;

    logger.setOptions({
      debug,
    });

    this.initConfig();

    // 客户端定制webpack配置
    if (this.config.chainWebpack) {
      this.hooks.add('chainWebpack', this.config.chainWebpack);
    }
  }
  initConfig() {
    const { baseDir, configFile } = this.options;
    const res = loadConfig.loadSync({
      files:
        typeof configFile === 'string'
          ? [configFile]
          : ['a8k.config.js', 'imtrc.js', 'package.json'],
      cwd: baseDir,
      packageKey: 'a8k',
    });
    if (res.path) {
      this.configFilePath = res.path;
      this.config = merge(res.data, this.config);
      logger.debug(`a8k config file: ${this.configFilePath}`);
    } else {
      logger.debug('a8k is not using any config file');
    }
    this.config = merge(defaultConfig, this.config);

    // 构建输出文件根目录
    this.config.dist = this.resolve(this.config.dist || 'dist');
    // 缓存基础目录
    this.config.cacheBase = path.resolve(this.config.cache);
    // 缓存版本标记
    this.config.cache = path.resolve(this.config.cache, `v-${version}`);
    // ssr配置
    this.config.ssrConfig.dist = this.resolve(this.config.ssrConfig.dist);
    this.config.ssrConfig.view = this.resolve(this.config.ssrConfig.view);

    this.config.devServer = {
      host: this.config.host || process.env.HOST || '0.0.0.0',
      port: this.config.port || process.env.PORT || 8899,
      ...this.config.devServer,
    };
    this.config.envs = { ...this.config.envs, ...this.loadEnvs() };
  }
  hook(name: string, fn: Function) {
    return this.hooks.add(name, fn);
  }

  resolve(...args: Array<string>) {
    return path.resolve(this.options.baseDir, ...args);
  }

  rootResolve(...args: Array<string>) {
    return path.resolve(this.options.cliPath, ...args);
  }

  // 准备工作
  prepare() {
    this.applyPlugins();
    logger.debug('App envs', JSON.stringify(this.getEnvs(), null, 2));
  }

  loadEnvs() {
    const { NODE_ENV } = process.env;
    const dotenvPath = this.resolve('.env');
    const dotenvFiles = [
      NODE_ENV && `${dotenvPath}.${NODE_ENV}.local`,
      NODE_ENV && `${dotenvPath}.${NODE_ENV}`,
      // Don't include `.env.local` for `test` environment
      // since normally you expect tests to produce the same
      // results for everyone
      NODE_ENV !== 'test' && `${dotenvPath}.local`,
      dotenvPath,
    ].filter(Boolean);

    let envs = {};

    dotenvFiles.forEach(dotenvFile => {
      if (fs.existsSync(dotenvFile)) {
        logger.debug('Using env file:', dotenvFile);
        const config = require('dotenv-expand')(
          require('dotenv').config({
            path: dotenvFile,
          })
        );
        // Collect all variables from .env file
        envs = { ...envs, ...config.parsed };
      }
    });

    // Collect those temp envs starting with a8k_ too
    for (const name of Object.keys(process.env)) {
      if (name.startsWith('a8k_')) {
        envs[name] = process.env[name];
      }
    }

    return envs;
  }

  // Get envs that will be embed in app code
  getEnvs() {
    return Object.assign({}, this.config.envs, {
      NODE_ENV: this.internals.mode === ENV_PROD ? ENV_PROD : ENV_DEV,
      PUBLIC_PATH: this.config.publicPath,
    });
  }

  applyPlugins() {
    const plugins = [
      require.resolve('@a8k/plugin-react'),
      require.resolve('./plugins/config-base'),
      require.resolve('./plugins/config-dev'),
      require.resolve('./plugins/config-html'),
      require.resolve('./plugins/config-ssr'),

      require.resolve('./plugins/command-build'),
      require.resolve('./plugins/command-dev'),
      require.resolve('./plugins/command-test'),
      require.resolve('./plugins/command-utils'),
      require.resolve('./plugins/command-init'),
      ...(this.config.plugins || []),
    ];

    this.plugins = loadPlugins(plugins, this.options.baseDir);

    for (const plugin of this.plugins) {
      const { resolve, options } = plugin;
      resolve.apply(this, options);
    }
  }

  // 程序入口
  async run() {
    this.prepare();
    await this.hooks.invokePromise('beforeRun');
    this.cli.parse(this.options.cliArgs);
    if (!this.options.cliArgs.slice(2).length) {
      program.outputHelp();
    }
  }

  resolveWebpackConfig(options) {
    const WebpackChain = require('webpack-chain');
    const config = new WebpackChain();

    options = { type: TYPE_CLIENT, ...options, mode: this.internals.mode };

    this.hooks.invoke('chainWebpack', config, options);

    if (this.config.chainWebpack) {
      this.config.chainWebpack(config, options, this);
    }

    if (this.options.inspectWebpack) {
      this._inspectWebpackConfigPath = path.join(
        require('os').tmpdir(),
        `a8k-inspect-webpack-config-${options.type}-${this.buildId}.js`
      );
      fs.appendFileSync(
        this._inspectWebpackConfigPath,
        `//${JSON.stringify(options)}\nconst ${options.type} = ${config.toString()}\n`
      );
      require('open')(this._inspectWebpackConfigPath);
    }

    let webpackConfig = config.toConfig();
    if (this.config.webpackOverride) {
      logger.warn('!!webpackOverride 已经废弃，请使用chainWebpack修改配置!!');
      // 兼容旧版本imt
      const legacyOptions = {
        type: options.type === TYPE_CLIENT ? options.mode : 'server',
      };
      const modifyConfig = this.config.webpackOverride(webpackConfig, legacyOptions);
      if (modifyConfig) {
        webpackConfig = modifyConfig;
      }
    }
    return webpackConfig;
  }

  createWebpackCompiler(webpackConfig) {
    return require('webpack')(webpackConfig);
  }

  async runWebpack(webpackConfig) {
    const compiler = this.createWebpackCompiler(webpackConfig);
    await new Promise((resolve, reject) => {
      compiler.run((err: Error, stats: any) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
  }

  async runCompiler(compiler) {
    await new Promise((resolve, reject) => {
      compiler.run((err:Error, stats:any) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
  }

  hasDependency(name: string, type = 'all') {
    const prodDeps = Object.keys(this.pkg.data.dependencies || {});
    const devDeps = Object.keys(this.pkg.data.devDependencies || {});
    if (type === 'all') {
      return prodDeps.concat(devDeps).includes(name);
    }
    if (type === 'prod') {
      return prodDeps.includes(name);
    }
    if (type === 'dev') {
      return devDeps.includes(name);
    }
    throw new Error(`Unknow dep type: ${type}`);
  }

  registerCommand(command: string) {
    return this.cli.command(command);
  }

  hasPlugin(name: string) {
    return this.plugins && this.plugins.find(plugin => plugin.resolve.name === name);
  }

  removePlugin(name: string) {
    this.plugins = this.plugins.filter(plugin => plugin.resolve.name !== name);
    return this;
  }

  chainWebpack(fn: Function) {
    this.hooks.add('chainWebpack', fn);
    return this;
  }

  localResolve(id: string, fallbackDir: string) {
    let resolved = resolveFrom.silent(this.resolve(), id);
    if (!resolved && fallbackDir) {
      resolved = resolveFrom.silent(fallbackDir, id);
    }
    return resolved;
  }

  localRequire(id: string, fallbackDir: string) {
    const resolved = this.localResolve(id, fallbackDir);
    return resolved && require(resolved);
  }
}
