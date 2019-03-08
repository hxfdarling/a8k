import loadConfig from '@a8k/cli-utils/load-config';
import logger from '@a8k/cli-utils/logger';
import program from 'commander';
import Event from 'events';
import fs from 'fs-extra';
import { merge } from 'lodash';
import path from 'path';
import resolveFrom from 'resolve-from';
import pkg from '../package.json';
import { TYPE_CLIENT, ENV_DEV, ENV_PROD } from './const';
import Hooks from './hooks';
import loadPkg from './utils/load-pkg';
import loadPlugins from './utils/load-plugins';

const defaultConfig = {
  cache: 'node_modules/.cache',
  publicPath: '',
  devServer: {
    https: false,
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
    quiet: true,
    overlay: false,
    headers: {
      'access-control-allow-origin': '*',
    },
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      disableDotRule: true,
    },
  },
  ssrDevServer: {
    host: 'localhost',
  },
};

program.version(require('../package.json').version);

program.on('command:*', () => {
  logger.error(
    `Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`
  );
  process.exit(1);
});

class A8k extends Event {
  constructor(options = {}, _config = {}) {
    super();
    this.options = {
      ...options,
      cliPath: path.resolve(__dirname, '../'),
      cliArgs: options.cliArgs || process.argv,
      baseDir: path.resolve(options.baseDir || '.'),
    };
    const { baseDir, debug, configFile } = this.options;

    this.hooks = new Hooks();
    this.config = { ..._config };
    // Exposed
    this.commands = new Map();
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

    // Load .env file before loading config file
    const envs = this.loadEnvs();
    const res = loadConfig.loadSync({
      files:
        typeof configFile === 'string'
          ? [configFile]
          : ['.imtrc.js', 'imtrc.js', 'a8k.config.js', 'package.json'],
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
      this.hooks.add('chainWebpack', this.config.chainWebpack, this);
    }

    // Merge envs with this.config.envs
    // Allow to embed these env variables in app code
    this.setAppEnvs(envs);
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

  setAppEnvs(envs) {
    this.config.envs = { ...this.config.envs, ...envs };
    return this;
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
      require.resolve('./plugins/command-add'),
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
      this.config.chainWebpack(config, options);
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

  registerCommand(command) {
    if (this.commands.has(command)) {
      logger.debug(
        `Plugin "${
          this._name
        }" overrided the command "${command}" that was previously added by plugin "${this.commands.get(
          command
        )}"`
      );
    }
    this.commands.set(command, this._name);
    return this.cli.command(command);
  }

  hasPlugin(name) {
    return this.plugins && this.plugins.find(plugin => plugin.resolve.name === name);
  }

  removePlugin(name) {
    this.plugins = this.plugins.filter(plugin => plugin.resolve.name !== name);
    return this;
  }

  chainWebpack(fn) {
    this.hooks.add('chainWebpack', fn);
    return this;
  }

  localResolve(id, fallbackDir) {
    let resolved = resolveFrom.silent(this.resolve(), id);
    if (!resolved && fallbackDir) {
      resolved = resolveFrom.silent(fallbackDir, id);
    }
    return resolved;
  }

  localRequire(...args) {
    const resolved = this.localResolve(...args);
    return resolved && require(resolved);
  }
}

export default (...args) => new A8k(...args);
