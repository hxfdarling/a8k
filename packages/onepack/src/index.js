import loadConfig from '@onepack/cli-utils/load-config';
import logger from '@onepack/cli-utils/logger';
import program from 'commander';
import fs from 'fs-extra';
import { merge } from 'lodash';
import path from 'path';
import Event from 'events';
import { TYPE_CLIENT } from './const';
import Hooks from './hooks';
import Plugin from './plugin';
import loadPkg from './utils/load-pkg';
import loadPlugins from './utils/load-plugins';
import pkg from '../package.json';

const defaultConfig = {
  cache: 'node_modules/.cache',
  publicPath: '',
  devServer: {},
  ssrDevServer: {},
};

program.version(require('../package.json').version);

program.on('command:*', () => {
  logger.error(
    'Invalid command: %s\nSee --help for a list of available commands.',
    program.args.join(' ')
  );
  process.exit(1);
});

class OnePack extends Event {
  constructor(options = {}, config = {}) {
    super();
    this.options = {
      ...options,
      cliPath: path.resolve(__dirname, '../'),
      cliArgs: options.cliArgs || process.argv,
      baseDir: path.resolve(options.baseDir || '.'),
    };
    const { baseDir, debug, configFile } = this.options;
    this.hooks = new Hooks();
    this.config = { ...config };
    this.internals = {};
    this.buildId = Math.random()
      .toString(36)
      .substring(7);

    logger.setOptions({
      debug,
    });

    this.pkg = loadPkg({ cwd: baseDir });

    // Load .env file before loading config file
    const envs = this.loadEnvs();
    const res = loadConfig.loadSync({
      files:
        typeof configFile === 'string'
          ? [configFile]
          : ['.imtrc.js', 'imtrc.js', 'onepack.config.js', 'package.json'],
      cwd: baseDir,
      packageKey: 'onepack',
    });

    if (res.path) {
      this.configFilePath = res.path;
      this.config = merge(res.data, this.config);
      logger.debug(`Onepack config file: ${this.configFilePath}`);
    } else {
      logger.debug('Onepack is not using any config file');
    }
    this.config = { ...defaultConfig, ...this.config };

    // 构建输出文件根目录
    this.config.dist = this.resolve(config.dist || 'dist');
    // 缓存版本标记
    this.config.cache = path.resolve(this.config.cache, `v-${pkg.version}`);
    // 如果有ssr配置
    if (this.config.ssrConfig) {
      this.config.ssrConfig = {
        // js存放地址
        dist: './node_modules/components',
        // html存放地址
        view: './app/views',
        ...this.config.ssrConfig,
      };
      const { ssrConfig } = this.config;
      ssrConfig.dist = this.resolve(ssrConfig.dist);
      ssrConfig.view = this.resolve(ssrConfig.view);
    }

    this.config.devServer = {
      host: this.config.host || process.env.HOST || '0.0.0.0',
      port: this.config.port || process.env.PORT || 8899,
      ...this.config.devServer,
    };
    // 客户端定制webpack配置
    if (this.config.chainWebpack) {
      this.hooks.add('chainWebpack', this.config.chainWebpack);
    }

    // Merge envs with this.config.envs
    // Allow to embed these env variables in app code
    this.setAppEnvs(envs);

    this.cli = program;
  }

  hook(name, fn) {
    return this.hooks.add(name, fn);
  }

  resolve(...args) {
    return path.resolve(this.options.baseDir, ...args);
  }

  rootResolve(...args) {
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

    // Collect those temp envs starting with ONEPACK_ too
    for (const name of Object.keys(process.env)) {
      if (name.startsWith('ONEPACK_')) {
        envs[name] = process.env[name];
      }
    }

    return envs;
  }

  // Get envs that will be embed in app code
  getEnvs() {
    return Object.assign({}, this.config.envs, {
      NODE_ENV: this.internals.mode === 'production' ? 'production' : 'development',
      PUBLIC_PATH: this.config.publicPath,
    });
  }

  setAppEnvs(envs) {
    this.config.envs = { ...this.config.envs, ...envs };
    return this;
  }

  applyPlugins() {
    const plugins = [
      require.resolve('@onepack/plugin-react'),
      require.resolve('./plugins/config-base'),
      require.resolve('./plugins/config-html'),
      require.resolve('./plugins/config-ssr'),

      require.resolve('./plugins/command-build'),
      require.resolve('./plugins/command-dev'),
      require.resolve('./plugins/command-test'),
      require.resolve('./plugins/command-utils'),
      require.resolve('./plugins/command-add'),
      ...(this.config.plugins || []),
    ];

    this.plugins = loadPlugins(plugins, this.options.baseDir);

    for (const plugin of this.plugins) {
      const { resolve, options } = plugin;
      const api = new Plugin(this, resolve.name);
      resolve.apply(api, options);
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

    options = { type: TYPE_CLIENT, ...options };

    this.hooks.invoke('chainWebpack', config, options);

    if (this.config.chainWebpack) {
      this.config.chainWebpack(config, options);
    }

    if (this.options.inspectWebpack) {
      this._inspectWebpackConfigPath = path.join(
        require('os').tmpdir(),
        `onepack-inspect-webpack-config-${options.type}-${this.buildId}.js`
      );
      fs.appendFileSync(
        this._inspectWebpackConfigPath,
        `//${JSON.stringify(options)}\nconst ${options.type} = ${config.toString()}\n`
      );
      require('opn')(this._inspectWebpackConfigPath);
    }

    return config.toConfig();
  }

  createWebpackCompiler(webpackConfig) {
    return require('webpack')(webpackConfig);
  }

  async runWebpack(webpackConfig) {
    const compiler = this.createWebpackCompiler(webpackConfig);
    await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
  }

  hasDependency(name, type = 'all') {
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
}

export default (...args) => new OnePack(...args);
