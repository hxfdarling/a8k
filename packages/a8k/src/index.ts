import loadConfig from '@a8k/cli-utils/load-config';
import { logger } from '@a8k/common';
import { spinner } from '@a8k/common';
import { BUILD_ENV, BUILD_TARGET } from '@a8k/common/lib/constants';
import program, { Command } from 'commander';
import fs from 'fs-extra';
import globalModules from 'global-modules';
import inquirer from 'inquirer';
import { merge } from 'lodash';
import path from 'path';
import resolveFrom from 'resolve-from';
import WebpackChain from 'webpack-chain';
import defaultConfig, { ssrConfig } from './default-config';
import Hooks from './hooks';
import { A8kConfig, A8kOptions, Internals, IResolveWebpackConfigOptions } from './interface';
import getFilenames from './utils/get-filenames';
import { getConfig, setConfig } from './utils/global-config';
import loadPkg from './utils/load-pkg';
import loadPlugins from './utils/load-plugins';
import webpack from 'webpack';

const { version } = require('../package.json');

program.version(version);

program.option('--nochecklatest', '不检测最新版本');
program.option('--debug', '输出构建调试信息');
program.option('--npm-client <npmClient>', '自定义npm命令行');
program.on('command:*', () => {
  logger.error(
    `Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`
  );
  process.exit(1);
});

type emptyFn = () => void;
export default class A8k {
  public logger: any = logger;
  public options: A8kOptions;
  public config: A8kConfig;
  public hooks = new Hooks();
  public commands = new Map();
  public cli = program;
  public internals: Internals;
  public buildId: string;
  public pkg: any;
  public configFilePath: string = '';
  public plugins: any[] = [];
  private pluginsSet = new Set<string>();
  private inspectWebpackConfigPath: string = '';
  private createProjectCommandTypes: Array<{
    type: string;
    description: string;
    action: (options: any) => void;
  }> = [];
  private createPageCommand: Array<{
    type: string;
    description: string;
    action: (options: any) => void;
  }> = [];
  private createComponentCommand: Array<{
    type: string;
    description: string;
    action: (options: any) => void;
  }> = [];
  constructor(options: A8kOptions) {
    this.options = {
      cliPath: path.resolve(__dirname, '../'),
      cliArgs: process.argv,
      baseDir: path.resolve('.'),
    } as A8kOptions;
    if (options) {
      this.options = { ...this.options, ...options };
      const { baseDir } = options;
      if (baseDir) {
        this.options.baseDir = path.resolve(baseDir);
      }
    }
    const { baseDir, debug } = this.options;
    logger.setOptions({
      debug,
    });
    this.config = {} as A8kConfig;

    this.internals = {
      mode: BUILD_ENV.DEVELOPMENT,
    };

    this.buildId = Math.random()
      .toString(36)
      .substring(7);
    this.pkg = loadPkg({ cwd: baseDir });

    this.initConfig();
  }
  public initConfig() {
    const { baseDir, configFile } = this.options;
    const res = loadConfig.loadSync({
      files:
        typeof configFile === 'string'
          ? [configFile]
          : ['a8k.config.js', 'imtrc.js', 'package.json'],
      cwd: baseDir,
      packageKey: 'a8k',
    });
    let { config } = this;
    if (res.path) {
      this.configFilePath = res.path;
      config = merge(res.data, config);
      logger.debug(`a8k config file: ${this.configFilePath}`);
    } else {
      logger.debug('a8k is not using any config file');
    }
    // TODO: remove
    if (config.ssrDevServer) {
      logger.warn('ssrDevServer Deprecated ,instead of ssrConfig');
      config.ssrConfig = { ...config.ssrDevServer };
    }
    if (config.ssrConfig) {
      config.ssrConfig = { ...ssrConfig, ...config.ssrConfig };
    }
    config = merge(defaultConfig, config);

    // 构建输出文件根目录
    config.dist = this.resolve(config.dist);
    // 页面根目录
    config.pagesPath = this.resolve(config.pagesPath);
    if (config.initEntry) {
      // 处理公共entry
      config.initEntry = config.initEntry.map((i: string) => this.resolve(i));
    }
    // html模板路径
    config.template = this.resolve(config.template);
    // 缓存版本标记
    config.cacheDirectory = path.resolve(config.cacheDirectory);
    // 默认值必须是"/"
    config.publicPath = config.publicPath || '/';
    if (config.ssrConfig) {
      // ssr配置
      config.ssrConfig.entryPath = this.resolve(config.ssrConfig.entryPath);
      config.ssrConfig.viewPath = this.resolve(config.ssrConfig.viewPath);
    }
    if (process.env.HOST) {
      config.devServer.host = process.env.HOST;
    }
    if (process.env.PORT) {
      config.devServer.port = Number(process.env.PORT);
    }
    config.envs = { ...config.envs, ...this.loadEnvs() };
    this.config = config;
  }
  public hook(name: string, fn: Function) {
    return this.hooks.add(name, fn);
  }

  public resolve(...args: string[]) {
    return path.resolve(this.options.baseDir, ...args);
  }

  public rootResolve(...args: string[]) {
    return path.resolve(this.options.cliPath, ...args);
  }

  // 准备工作
  public prepare() {
    this.registerCommand('create [dir] [type]')
      .description('create project')
      .action(async (dir, type) => {
        const projectDir = path.join(this.options.baseDir, dir || '');
        let exist = false;
        try {
          await fs.stat(projectDir);
          exist = true;
        } catch (e) {}
        const files = exist ? await fs.readdir(projectDir) : [];
        if (files.length) {
          const answer: any = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'continue',
              message: 'current directory not empty, continue?',
              default: false,
            },
          ]);
          if (!answer.continue) {
            process.exit(0);
          }
        }
        if (!type) {
          const prompts: any = [
            {
              // tslint:disable-next-line: no-shadowed-variable
              choices: this.createProjectCommandTypes.map(({ type, description }) => {
                return { name: description, value: type };
              }),
              message: 'select you want create project type',
              name: 'type',
              type: 'list',
            },
          ];
          const result: any = await inquirer.prompt(prompts);
          type = result.type;
        }
        let name = path.basename(projectDir);
        const prompt: any = [
          {
            type: 'input',
            name: 'name',
            validate(input: string) {
              // Declare function as asynchronous, and save the done callback
              const done = (this as any).async();

              if (input !== '' && /^[a-z@A-Z]/.test(input)) {
                done(null, true);
              } else {
                done('Project name must begin with a letter or @');
              }
            },
            message: 'Input project name',
            default: name,
          },
        ];
        ({ name } = await inquirer.prompt(prompt));
        const createConfig = {
          name,
          projectDir,
          type,
        };
        const commandType = this.createProjectCommandTypes.find(({ type: c }) => c === type);
        if (!commandType) {
          logger.error(`create "${type}" not support`);
          process.exit(-1);
        } else {
          spinner.info(commandType.description);
          fs.ensureDir(projectDir);
          commandType.action(createConfig);
        }
      });
    this.registerCommand('page')
      .alias('p')
      .description('create page from template')
      .action(async () => {
        if (!this.config.type) {
          logger.warn('you project not support this command');
          return;
        }
        const command = this.createPageCommand.find(({ type }) => type === this.config.type);
        if (command) {
          command.action({});
        } else {
          logger.warn('you project(type is ' + this.config.type + ') not support create page');
        }
      });
    this.registerCommand('component')
      .alias('c')
      .description('create component from template')
      .action(async () => {
        if (!this.config.type) {
          logger.warn('you project not support this command');
          return;
        }
        const command = this.createComponentCommand.find(({ type }) => type === this.config.type);
        if (command) {
          command.action({});
        } else {
          logger.warn('you project(type is ' + this.config.type + ') not support create component');
        }
      });
    this.applyPlugins();
    this.registerCommand('plugin <type> [pluginName]')
      .description('编辑全局插件列表，模板插件可以添加到全局')
      .action((type: string, pluginName: string) => {
        const plugins: string[] = getConfig('plugins', []);
        switch (type) {
          case 'add':
            if (!pluginName) {
              logger.error('pluginName param not found');
              return;
            }
            spinner.logWithSpinner('check plugin ' + pluginName);
            if (plugins.indexOf(pluginName) >= 0) {
              spinner.stop();
              logger.info(pluginName + ' exists ');
              return;
            }
            try {
              resolveFrom(globalModules, pluginName);
            } catch (e) {
              spinner.fail();
              logger.error(pluginName + ' plugin not found from ' + globalModules);
              return;
            }
            spinner.succeed();
            plugins.push(pluginName);
            setConfig('plugins', plugins);
            spinner.succeed(pluginName + ' success add to global config');
            break;
          case 'delete':
            if (!pluginName) {
              logger.error('pluginName param not found');
              return;
            }
            setConfig('plugins', plugins.filter((p: string) => p !== pluginName));
            break;
          case 'ls':
          case 'list':
            console.log('plugin list:');
            plugins.forEach((name: string) => {
              console.log();
              console.log(name);
            });
            console.log();
            console.log('plugin total: ' + plugins.length);
            break;
          default:
            console.log('only support type: add,delete,list');
        }
      });

    logger.debug('App envs', JSON.stringify(this.getEnvs(), null, 2));
  }

  public loadEnvs() {
    const { NODE_ENV } = process.env;
    const dotenvPath = this.resolve('.env');
    const dotenvFiles: any[] = [
      NODE_ENV && `${dotenvPath}.${NODE_ENV}.local`,
      NODE_ENV && `${dotenvPath}.${NODE_ENV}`,
      // Don't include `.env.local` for `test` environment
      // since normally you expect tests to produce the same
      // results for everyone
      NODE_ENV !== 'test' && `${dotenvPath}.local`,
      dotenvPath,
    ].filter(Boolean);

    let envs: any = {};

    dotenvFiles.forEach((dotenvFile: string) => {
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
  public getEnvs() {
    return Object.assign({}, this.config.envs, {
      PUBLIC_PATH: this.config.publicPath,
    });
  }

  private applyPlugins() {
    const buildInPlugins = [
      [require('@a8k/plugin-react-template'), []],
      [require('@a8k/plugin-typescript-template'), []],
      require('./plugins/config-base'),
      require('./plugins/config-dev'),
      require('./plugins/config-html'),
      require('./plugins/config-ssr'),
      require('./plugins/command-build'),
      require('./plugins/command-dev'),
      require('./plugins/command-test'),
      require('./plugins/command-utils'),
      require('./plugins/command-init'),
      [require('@a8k/plugin-sb-react'), []],
    ];
    const { baseDir } = this.options;
    this.initPlugins(loadPlugins(buildInPlugins, baseDir), 'build-in');
    this.initPlugins(loadPlugins(this.config.plugins || [], baseDir), 'custom');
    const globalPlugins = getConfig('plugins') || [];
    try {
      this.initPlugins(loadPlugins(globalPlugins, globalModules), 'global');
    } catch (e) {
      logger.error('global init error');
      console.log('global plugin list:');
      globalPlugins.forEach((name: string) => console.log(name));
      console.error(e);
    }
  }
  private initPlugins(plugins: any, type: string) {
    this.plugins.push(...plugins);
    for (const [Plugin, options, resolve] of plugins) {
      let pluginInst = null;
      if (Plugin instanceof Function) {
        pluginInst = new Plugin(options);
      } else {
        pluginInst = Plugin;
      }
      const pluginName = pluginInst.name;
      try {
        pluginInst.apply(this, options);
      } catch (e) {
        logger.error('plugin ' + (resolve || '') + ' apply error ');
        throw e;
      }

      if (!pluginName) {
        throw new Error('plugin name not found\n' + Plugin);
      }
      logger.debug('[' + type + ']use plugin ' + pluginName);
      if (this.pluginsSet.has(pluginName)) {
        logger.warn('[' + type + ']' + pluginName + ' plugin name have exists');
      }
      this.pluginsSet.add(pluginName);
    }
  }

  // 程序入口
  public async run() {
    this.prepare();
    await this.hooks.invokePromise('beforeRun');
    this.cli.parse(this.options.cliArgs);
    if (!this.options.cliArgs.slice(2).length) {
      program.outputHelp();
    }
  }

  public resolveWebpackConfig(options: IResolveWebpackConfigOptions) {
    const configChain = new WebpackChain();
    options = {
      type: BUILD_TARGET.BROWSER,
      ...options,
      mode: this.internals.mode,
    };
    this.config.filenames = getFilenames({
      filenames: this.config.filenames,
      mode: options.mode,
    });
    this.hooks.invoke('chainWebpack', configChain, options);

    if (this.config.chainWebpack) {
      this.config.chainWebpack(configChain, options, this);
    }

    if (this.options.inspectWebpack) {
      this.inspectWebpackConfigPath = path.join(
        require('os').tmpdir(),
        `a8k-inspect-webpack-config-${options.type}-${this.buildId}.js`
      );
      fs.appendFileSync(
        this.inspectWebpackConfigPath,
        `//${JSON.stringify(options)}\nconst ${options.type} = ${configChain.toString()}\n`
      );
      require('open')(this.inspectWebpackConfigPath);
    }

    let webpackConfig = configChain.toConfig();
    if (this.config.webpackOverride) {
      logger.warn('!!webpackOverride 已经废弃，请使用chainWebpack修改配置!!');
      // 兼容旧版本imt
      const legacyOptions = {
        type: options.type === BUILD_TARGET.BROWSER ? options.mode : 'server',
      };
      const modifyConfig = this.config.webpackOverride(webpackConfig, legacyOptions);
      if (modifyConfig) {
        webpackConfig = modifyConfig;
      }
    }
    return webpackConfig;
  }

  public createWebpackCompiler(webpackConfig: webpack.Configuration) {
    return require('webpack')(webpackConfig);
  }

  public async runWebpack(webpackConfig: webpack.Configuration) {
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

  public async runCompiler(compiler: webpack.Compiler) {
    await new Promise((resolve, reject) => {
      compiler.run((err: Error, stats: any) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
  }

  public hasDependency(name: string, type = 'all') {
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

  public registerCommand(command: string): Command {
    return this.cli.command(command);
  }
  public registerCreateType(type: string, description: string, action: emptyFn): A8k {
    this.createProjectCommandTypes.push({ type, description, action });
    return this;
  }
  public registerPageType(type: string, description: string, action: emptyFn): A8k {
    this.createPageCommand.push({ type, description, action });
    return this;
  }
  public registerComponentType(type: string, description: string, action: emptyFn): A8k {
    this.createComponentCommand.push({ type, description, action });
    return this;
  }
  public chainWebpack(
    fn: (configChain: WebpackChain, options: IResolveWebpackConfigOptions) => void
  ) {
    this.hooks.add('chainWebpack', fn);
    return this;
  }

  public localResolve(id: string, fallbackDir: string) {
    let resolved = resolveFrom.silent(this.resolve(), id);
    if (!resolved && fallbackDir) {
      resolved = resolveFrom.silent(fallbackDir, id);
    }
    return resolved;
  }

  public localRequire(id: string, fallbackDir: string) {
    const resolved = this.localResolve(id, fallbackDir);
    return resolved && require(resolved);
  }
}
