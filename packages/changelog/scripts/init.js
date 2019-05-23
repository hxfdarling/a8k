#!/usr/bin/env node

/* eslint-disable import/no-dynamic-require,global-require, no-sync, no-console */
const path = require('path');
const fs = require('fs');
const execa = require('execa');
const chalk = require('chalk').default;
const root = require('app-root-path').path;
const { types } = require('../cz-config.js');

const pkgFile = path.join(root, 'package.json');
const pkg = require(pkgFile);

function genCommitlintrc() {
  const commitlintrc = path.join(root, '.commitlintrc.js');
  const template = `
// 校验commit消息是否符合规范
module.exports = {
  extends: ['@a8k/changelog', 'cz'],
  rules:{
    
  }
};
`;
  if (!fs.existsSync(commitlintrc)) {
    fs.writeFileSync(commitlintrc, template);
  } else {
    console.log(chalk.gray('.commitlintrc 文件已经存在将不会自动修改该文件内容 '));
  }
}
function updatePackageJson() {
  const config = {
    commitizen: {
      path: 'node_modules/cz-customizable',
    },
    'cz-customizable': {
      config: 'node_modules/@a8k/changelog/cz-config.js',
    },
  };
  // 自动注入配置到package.json中
  pkg.config = Object.assign(pkg.config || {}, config);

  const command = 'commitlint -E HUSKY_GIT_PARAMS';
  pkg.husky = pkg.husky || {};
  pkg.husky.hooks = pkg.husky.hooks || {};
  if (!pkg.husky.hooks['commit-msg']) {
    pkg.husky.hooks['commit-msg'] = command;
  } else {
    console.log(
      chalk.yellow('请手动添加以下配置到 package.json 中：\n'),
      `
    hooks:{
      "commit-msg":"${command}"
    }
`,
      chalk.gray('\n如果已经添加请忽略\n')
    );
  }
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
}
function genGitmessage() {
  const template = `
# run " npm i -g commitizen "
# you can use " git cz " to commit message
# example: git commit -m 'feat(all page): update components'
# head: <type>(<scope>): <subject>
# - type: ${types.map(v => v.value).join(', ')}
# - scope: can be empty (eg. if the change is a global or difficult to assign to a single component)
# - subject: start with verb (such as 'change'), 50-character line
#
# body: 72-character wrapped. This should answer:
# * Why was this change necessary?
# * How does it address the problem?
# * Are there any side effects?
#
# footer:
# - Include a link to the ticket, if any.
# - BREAKING CHANGE
#
`;
  const file = path.join(root, '.gitmessage');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, template);
    execa
      .shell('git config commit.template .gitmessage')
      .then(() => {
        console.log(chalk.green('add commit.template to project success'));
      })
      .catch(err => {
        console.error(err);
      });
  }
}
const packageName = require('../package.json').name;

const dependencies = Object.keys(pkg.dependencies || {});
const devDependencies = Object.keys(pkg.devDependencies || {});

// 工具本身不执行该步骤
// 需要添加了依赖才执行
if (
  pkg.name !== packageName
  && (dependencies.find(key => key === packageName)
    || devDependencies.find(key => key === packageName))
) {
  updatePackageJson();
  genCommitlintrc();
  genGitmessage();
} else {
  console.log(chalk.red('需要将 @a8k/changelog 包配置到依赖中才能正确初始化'));
}
