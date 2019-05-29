const chalk = require('chalk').default;

console.log(
  chalk.green('请在命令行中执行一下命令初始化配置:\n'),
  `
  npm i -D commitizen @commitlint/cli cz-customizable commitlint-config-cz
  npx a8k-changelog

  or

  ./node_modules/.bin/a8k-changelog
`,
  chalk.gray('\n如果已经初始化过，请忽略\n')
);
