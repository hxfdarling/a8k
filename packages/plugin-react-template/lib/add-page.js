const path = require('path');
const semver = require('semver');
const chalk = require('chalk');

const Generator = require('yeoman-generator');
const { basename, join } = require('path');
const logger = require('@a8k/common/lib/logger');
const { toArray, createMultiExamplePage, createSingleExamplePage } = require('./heper');

// logger.setOptions({ debug: true });

class CreateGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.name = basename(process.cwd());
    this.props = {
      config: opts.a8kconfig,
    };

    this.pagesPath = path.resolve(args.env.cwd, 'src/pages');

    this.sourceRoot(join(__dirname, '../templates/'));
  }

  async prompting() {
    const { name } = await this.prompt([
      {
        name: 'name',
        message: '页面名称(使用下划线分割单词)',
        type: 'input',
        validate(input) {
          if (!input) {
            return '请输入组件名称';
          }
          if (!/^([a-z_\d]+)$/.test(input)) {
            return '格式错误(支持英文小写字母、数字、下划线)';
          }
          return true;
        },
      },
    ]);
    this.props.name = name;
  }

  _copyFiles(files = []) {
    files.forEach(([src, dest]) => {
      src = toArray(src);
      dest = toArray(dest);
      this.fs.copy(this.templatePath(...src), this.destinationPath(...dest));
    });
  }

  _copyTpls(files = []) {
    files.forEach(([src, dest]) => {
      src = toArray(src);
      dest = toArray(dest);
      this.fs.copyTpl(this.templatePath(...src), this.destinationPath(...dest), this.props);
    });
  }

  writing() {
    logger.debug(`this.props: ${JSON.stringify(this.props)}`);
    if (this.props.config.mode === 'single') {
      createSingleExamplePage(this, this.props.name);
    } else {
      createMultiExamplePage(this, this.props.name);
    }
  }
}

module.exports = ({ config, options }) => {
  if (!semver.satisfies(process.version, '>= 8.0.0')) {
    console.error(chalk.red('✘ The generator will only work with Node v8.0.0 and up!'));
    process.exit(1);
  }

  return new Promise(resolve => {
    new CreateGenerator(
      {
        name: 'basic',
        env: { cwd: options.baseDir },
        resolved: __filename,
      },
      { a8kconfig: config }
    ).run(resolve);
  });
};
