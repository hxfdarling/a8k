const fs = require('fs-extra');
const path = require('path');

async function copyFiles(src, dist) {
  try {
    await fs.copy(src, dist);
  } catch (err) {
    console.error(err);
  }
}

// 创建.stroybook 及配置文件
module.exports = projectDir => {
  return new Promise((resolve, reject) => {
    fs.ensureDirSync(projectDir);
    // copy tpl to .storybook
    fs.readdirSync(path.resolve(__dirname, '../template')).map(file => {
      copyFiles(path.resolve(__dirname, '../template', file), path.join(projectDir, file));
    })
    resolve();
  });
};
