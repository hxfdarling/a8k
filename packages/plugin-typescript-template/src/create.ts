import { logger } from '@a8k/common';
import { join } from 'path';
import semver from 'semver';
import Generator from 'yeoman-generator';

const toArray = (a: string | string[]) => {
  return Array.isArray(a) ? a : [a];
};

class CreateGenerator extends Generator {
  [x: string]: any;
  name: string;
  props: any;
  constructor(args, opts = {}) {
    super(args, opts);
    this.name = args.name;
    this.props = { name: this.name };
    this.sourceRoot(join(__dirname, '../template/'));
  }

  private copyFiles(files = []) {
    files.forEach(([src, dest]) => {
      src = toArray(src);
      dest = toArray(dest);
      this.fs.copy(this.templatePath(...src), this.destinationPath(...dest));
    });
  }

  private copyTpls(files = []) {
    files.forEach(([src, dest]) => {
      src = toArray(src);
      dest = toArray(dest);
      this.fs.copyTpl(this.templatePath(...src), this.destinationPath(...dest), this.props);
    });
  }

  // tslint:disable-next-line: member-ordering
  public writing() {
    // files
    this.copyFiles([
      ['tpl/_gitignore', '.gitignore'],
      ['files/', './'],
      ['files/.commitlintrc.js', '.commitlintrc.js'],
      ['files/.editorconfig', '.editorconfig'],
      ['files/.eslintrc.yml', '.eslintrc.yml'],
      ['files/.gitmessage', '.gitmessage'],
      ['files/.prettierrc', '.prettierrc'],
      ['files/.stylelintrc.js', '.stylelintrc.js'],
      ['files/.circleci', '.circleci'],
      ['files/.vscode', '.vscode'],
    ]);

    // tpl
    this.copyTpls([['tpl/package', 'package.json'], ['tpl/README.md', 'README.md']]);
  }
}

export default (projectDir: string, name: string) => {
  if (!semver.satisfies(process.version, '>= 8.0.0')) {
    logger.error('✘ The generator will only work with Node v8.0.0 and up!');
    process.exit(1);
  }
  return new Promise(resolve => {
    new CreateGenerator({
      name,
      env: { cwd: projectDir },
      resolved: __filename,
    }).run(resolve);
  });
};
