const semver = require('semver');
const chalk = require('chalk');

const Generator = require('yeoman-generator');
const { basename, join } = require('path');
const logger = require('@a8k/cli-utils/logger');

// debug.enabled = true;

if (!semver.satisfies(process.version, '>= 8.0.0')) {
  console.error(chalk.red('✘ The generator will only work with Node v8.0.0 and up!'));
  process.exit(1);
}

const toArray = a => {
  return Array.isArray(a) ? a : [a];
};

class CreateGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.name = basename(process.cwd());
    this.props = { ssr: false };
    this.sourceRoot(join(__dirname, '../templates/'));
  }

  async prompting() {
    const prompts = [
      {
        name: 'app',
        message: '选择创建应用类型',
        type: 'list',
        choices: [{ name: '单页面应用', value: 'single' }, { name: '多页面应用', value: 'multi' }],
      },
    ];
    const { app } = await this.prompt(prompts);
    const { rem } = await this.prompt([
      {
        name: 'rem',
        message: '是否添加rem脚本，用于h5适配屏幕开发？',
        type: 'confirm',
        default: false,
      },
    ]);
    const { retry } = await this.prompt([
      {
        name: 'retry',
        message: '是否支持主域重试？解决CDN失败后自动加载主域资源',
        type: 'confirm',
        default: false,
      },
    ]);
    if (app === 'multi') {
      // 暂无配置
      const { ssr } = await this.prompt([
        {
          name: 'ssr',
          message: '是否启用服务器渲染(直出)?',
          type: 'confirm',
          default: false,
        },
      ]);
      this.props.ssr = ssr;
    } else {
      let htmlConfig = {
        keywords: 'react,a8k',
        title: 'a8k application',
        description: 'a8k application',
      };

      const { html } = await this.prompt([
        {
          name: 'html',
          message: '是否初始化index.html配置？',
          type: 'confirm',
          default: false,
        },
      ]);

      if (html) {
        htmlConfig = await this.prompt([
          {
            name: 'title',
            message: '输入title标签',
            type: 'input',
          },
          {
            name: 'keywords',
            message: '输入keywords标签',
            type: 'input',
          },
          {
            name: 'description',
            message: '输入description元数据，用于搜索引擎优化',
            type: 'input',
          },
        ]);
      }
      this.props = { ...this.props, htmlConfig };
    }
    this.props = { name: this.name, app, retry, rem, ...this.props };
  }

  async _singlePage() {
    this._copyFiles([['single/src', 'src']]);
    this._copyTpls([['single/src/index.html', 'src/index.html']]);
    this._createExampleComponent();
  }

  async _multiPages() {
    const templateFile = 'src/assets/template.html';
    this._copyFiles([['multi/src', 'src']]);
    this._copyTpls([[`multi/${templateFile}`, templateFile]]);
    if (this.props.ssr) {
      // 复制node相关文件
      this._copyFiles([['multi/app', 'app']]);
      this._copyTpls([['multi/nodemon.json', 'nodemon.json']]);
    }
    this._createExampleComponent();
    this._createExamplePage();
  }

  _createExampleComponent(name = 'Example') {
    [
      ['common/componentTemplate/index.jsx.tpl', `src/components/${name}/index.jsx`],
      ['common/componentTemplate/index.scss.tpl', `src/components/${name}/index.scss`],
    ].forEach(([src, dest]) => {
      src = this.templatePath(...toArray(src));
      dest = this.destinationPath(...toArray(dest));
      this.fs.copyTpl(src, dest, {
        name,
        className: `x-component-${name.toLowerCase()}`,
        useConnect: false,
      });
    });
  }

  _createExamplePage(name = 'example') {
    const type = this.props.app;
    [
      [`${type}/pageTemplate/action_creators.js`, `src/pages/${name}/action_creators.js`],
      [`${type}/pageTemplate/action_types.js`, `src/pages/${name}/action_types.js`],
      [`${type}/pageTemplate/index.html`, `src/pages/${name}/index.html`],
      [`${type}/pageTemplate/index.jsx`, `src/pages/${name}/index.jsx`],
      [`${type}/pageTemplate/index.scss`, `src/pages/${name}/index.scss`],
      [`${type}/pageTemplate/ProviderContainer.jsx`, `src/pages/${name}/ProviderContainer.jsx`],
      [`${type}/pageTemplate/reducer.js`, `src/pages/${name}/reducer.js`],
      [`${type}/pageTemplate/store.js`, `src/pages/${name}/store.js`],
    ].forEach(([src, dest]) => {
      src = toArray(src);
      dest = toArray(dest);
      this.fs.copyTpl(this.templatePath(...src), this.destinationPath(...dest), {
        name,
        className: `x-page-${name.toLowerCase()}`,
      });
    });
  }

  _commonFiles() {
    // files
    this._copyFiles([
      ['common/_gitignore', '.gitignore'],
      ['common/.commitlintrc.js', '.commitlintrc.js'],
      ['common/.editorconfig', '.editorconfig'],
      ['common/_eslintrc.js', '.eslintrc.js'],
      ['common/.gitmessage', '.gitmessage'],
      ['common/.prettierrc', '.prettierrc'],
      ['common/jsconfig.json', 'jsconfig.json'],
    ]);

    // tpl
    this._copyTpls([
      ['common/a8k.config.js', 'a8k.config.js'],
      ['common/package', 'package.json'],
      ['common/README.md', 'README.md'],
    ]);
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
    if (this.props.app === 'single') {
      this._singlePage();
    } else {
      this._multiPages();
    }
    this._commonFiles();
  }
}

module.exports = projectDir => {
  return new Promise(resolve => {
    new CreateGenerator({
      name: 'basic',
      env: { cwd: projectDir },
      resolved: __filename,
    }).run(resolve);
  });
};
