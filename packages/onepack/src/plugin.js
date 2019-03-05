const resolveFrom = require('resolve-from');
const logger = require('@onepack/cli-utils/logger');

export default class Plugin {
  /**
   * Creates an instance of Plugin.
   * @param {*} onepack Root API
   * @param {string} name Plugin name
   */
  constructor(onepack, name) {
    this._name = name;
    this.context = onepack;

    onepack._commands = onepack._commands || new Map();

    // Exposed
    this.commands = onepack._commands;
    this.hooks = onepack.hooks;
    this.pkg = onepack.pkg;
    this.config = onepack.config;
    this.options = onepack.options;
    this.logger = logger;
  }

  get plugins() {
    return this.context.plugins;
  }

  get command() {
    return this.context.options.command;
  }

  hook(...args) {
    return this.context.hook(...args);
  }

  registerCommand(command, desc, handler) {
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
    const program = this.context.cli
      .command(command)
      .description(desc)
      .action(handler);
    return program;
  }

  hasPlugin(name) {
    return (
      this.context.plugins && this.context.plugins.find(plugin => plugin.resolve.name === name)
    );
  }

  removePlugin(name) {
    this.context.plugins = this.context.plugins.filter(plugin => plugin.resolve.name !== name);
    return this;
  }

  resolveWebpackConfig(opts) {
    return this.context.resolveWebpackConfig(opts);
  }

  createWebpackCompiler(webpackConfig) {
    return this.context.createWebpackCompiler(webpackConfig);
  }

  runWebpack(webpackConfig) {
    return this.context.runWebpack(webpackConfig);
  }

  resolve(...args) {
    return this.context.resolve(...args);
  }

  chainWebpack(fn) {
    this.hooks.add('chainWebpack', fn);
    return this;
  }

  configureDevServer(fn) {
    this.hooks.add('configureDevServer', fn);
    return this;
  }

  bundle() {
    return this.context.bundle();
  }

  setAppEnvs(envs) {
    return this.context.setAppEnvs(envs);
  }

  getEnvs() {
    return this.context.getEnvs();
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

  hasDependency(...args) {
    return this.context.hasDependency(...args);
  }
}
