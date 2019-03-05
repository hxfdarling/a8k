const semver = require('semver');
const chalk = require('chalk');

const Generator = require('yeoman-generator');
const { basename } = require('path');
const debug = require('debug')('imt-react-template');

// debug.enabled = true;

if (!semver.satisfies(process.version, '>= 8.0.0')) {
  console.error(chalk.red('✘ The generator will only work with Node v8.0.0 and up!'));
  process.exit(1);
}

class AppGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.name = basename(process.cwd());
    this.props = { ssr: false };
    this.sourceRoot(__dirname);
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
    if (app === 'single') {
      let htmlConfig = {
        keywords: 'react,imt',
        title: 'imt application',
        description: 'imt application',
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
      Object.assign(this.props, { htmlConfig });
    } else {
      // 暂无配置
      const { ssr } = await this.prompt([
        {
          name: 'ssr',
          message: '是否启用服务器渲染(直出)?',
          type: 'confirm',
          default: false,
        },
      ]);
      Object.assign(this.props, { ssr });
    }
    this.props = { name: this.name, app, retry, rem, ...this.props };
  }

  _singlePage() {
    this._copyFiles([['single/src', 'src']]);
    this._copyTpls([['single/src/index.html', 'src/index.html']]);
  }

  _multiPages() {
    const { ssr } = this.props;
    const templateFile = 'src/assets/template.html';
    this._copyFiles([['multi/src', 'src']]);
    this._copyTpls([[`multi/${templateFile}`, templateFile]]);
    if (ssr) {
      // 复制node相关文件
      this._copyFiles([['multi/app', 'app']]);
      this._copyTpls([['multi/nodemon.json', 'nodemon.json']]);
    }
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
      ['common/imtrc.js', 'imtrc.js'],
      ['common/package', 'package.json'],
      ['common/README.md', 'README.md'],
    ]);
  }

  _copyFiles(files = []) {
    const toArray = a => {
      return Array.isArray(a) ? a : [a];
    };
    files.forEach(([src, dest]) => {
      src = toArray(src);
      dest = toArray(dest);
      this.fs.copy(this.templatePath(...src), this.destinationPath(...dest));
    });
  }

  _copyTpls(files = []) {
    const toArray = a => {
      return Array.isArray(a) ? a : [a];
    };
    files.forEach(([src, dest]) => {
      src = toArray(src);
      dest = toArray(dest);
      this.fs.copyTpl(this.templatePath(...src), this.destinationPath(...dest), this.props);
    });
  }

  writing() {
    debug(`this.props: ${JSON.stringify(this.props)}`);
    if (this.props.app === 'single') {
      this._singlePage();
    } else {
      this._multiPages();
    }
    this._commonFiles();
  }
}

const generator = new AppGenerator(process.argv.slice(2), {
  name: 'basic',
  env: {
    cwd: process.cwd(),
  },
  resolved: __filename,
});
generator.run(() => {
  console.log('✨  File Generate Done');
});
