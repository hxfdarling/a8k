const path = require('path');
const semver = require('semver');
const chalk = require('chalk');

const Generator = require('yeoman-generator');
const { basename, join } = require('path');
const { logger } = require('@a8k/common');
const fs = require('fs-extra');
const { toArray, createExampleComponent } = require('./heper');

// logger.setOptions({ debug: true });

class CreateGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.name = basename(process.cwd());
    this.props = {
      config: opts.a8kconfig,
    };

    this.pagesPath = path.resolve(args.env.cwd, 'src/pages');

    this.pagesList = fs.readdirSync(this.pagesPath).map(file => {
      return { name: path.basename(file), value: file };
    });

    this.sourceRoot(join(__dirname, '../templates/'));
  }

  async prompting() {
    const { type } = await this.prompt([
      {
        name: 'type',
        message: '选择组建类型',
        type: 'list',
        choices: [{ name: '通用组件', value: 'common' }, { name: '页面组件', value: 'page' }],
      },
    ]);
    this.props.type = type;
    if (type === 'page') {
      const { pagePath } = await this.prompt([
        {
          name: 'pagePath',
          message: '为那个页面创建？',
          type: 'list',
          choices: this.pagesList,
        },
      ]);
      this.props.filepath = `src/pages/${pagePath}`;
    } else {
      this.props.filepath = 'src/components';
    }
    const { name } = await this.prompt([
      {
        name: 'name',
        message: '输入组件名称(使用驼峰命名)',
        type: 'input',
        validate(input) {
          if (!input) {
            return '请输入组件名称';
          }
          if (!/^([A-Z]{1}[a-z]+)/.test(input)) {
            return '请遵循驼峰命名规则';
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
    createExampleComponent(this, this.props.filepath, this.props.name, this.props.type === 'page');
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
