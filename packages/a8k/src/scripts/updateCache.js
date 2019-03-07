const { spawnSync } = require('child_process');
const commandExists = require('command-exists').sync;

const dir = process.argv[2];

if (!dir) {
  throw Error('没有指定缓存目录,无法进行缓存');
}
let npmCmd = 'npm';
if (commandExists('tnpm')) {
  npmCmd = 'tnpm';
}
console.log('工作目录', dir);
function spawnSyncX(...args) {
  const result = spawnSync(...args);
  if (result.stdout) {
    console.log(result.stdout.toString());
  }
  if (result.stderr) {
    console.log(result.stderr.toString());
  }
}
const startTime = Date.now();
spawnSyncX('mkdir', ['-p', dir]);
spawnSyncX('cp', ['./package.json', `${dir}/package.json`]);
console.log('安装包');
spawnSyncX(npmCmd, ['i'], {
  cwd: dir,
});
console.log('生成压缩文件');
spawnSyncX('rm', ['./tmp.zip']);
spawnSyncX('zip', ['-rqy0', 'tmp.zip', './node_modules/'], {
  cwd: dir,
});
console.log('复制压缩文件');
spawnSyncX('mv', ['-f', './tmp.zip', './node_modules.zip'], {
  cwd: dir,
});
console.log(`缓存更新完毕,耗时:${(Date.now() - startTime) / 1000}s`);
