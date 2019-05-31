const fs = require('fs-extra');
const path = require('path');
const getNpmCommand = require('@a8k/cli-utils/npm');
const logger = require('@a8k/cli-utils/logger');
const { logWithSpinner, stopSpinner } = require('@a8k/cli-utils/spinner');
const shell = require('shelljs');
const util = require('util');

async function copyFiles(src, dist) {
  try {
    await fs.copy(src, dist);
  } catch (err) {
    console.error(err);
  }
}

// 创建.stroybook 及配置文件
module.exports = async projectDir => {
  const npmCmd = getNpmCommand();

  await new Promise(resolve => {
    const sbPath = path.resolve(projectDir, '.storybook');
    const compPath = path.resolve(projectDir, 'src/components/stories');
    const configTplPath = path.resolve(__dirname, '../template/config-tpl');
    const compTplPath = path.resolve(__dirname, '../template/component-tpl');
    fs.ensureDirSync(projectDir);
    logWithSpinner('初始化storybook配置');
    // copy tpl to .storybook
    fs.readdirSync(configTplPath).map(file => {
      copyFiles(path.resolve(configTplPath, file), path.join(sbPath, file));
    });

    fs.ensureDirSync(compPath);
    // copy demo story to project src/components
    fs.readdirSync(compTplPath).map(file => {
      copyFiles(path.resolve(compTplPath, file), path.join(compPath, file));
    });
    stopSpinner();

    resolve();
  });

  // 安装常用依赖
  const deps = [
    '@storybook/addon-knobs',
    'storybook-addon-jsx',
    '@storybook/addon-actions',
    '@storybook/addon-viewport',
    '@storybook/addon-notes',
  ];
  logger.debug(`install ${deps.join(' ')}`);
  logWithSpinner('安装依赖中');
  await util.promisify(shell.exec)(`${npmCmd} i ${deps.join(' ')} -D`, {
    silent: false,
  });
  stopSpinner();
};
