const fs = require('fs-extra');
const path = require('path');
const { spawn, spawnSync, execSync } = require('child_process');

const cwd = process.cwd();
const pkg = require(path.join(cwd, './package.json'));

function getFormatTime(date, split = '-') {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
    `${date.getHours()}`.padStart(2, '0'),
    `${date.getMinutes()}`.padStart(2, '0'),
    `${date.getSeconds()}`.padStart(2, '0'),
    `${date.getMilliseconds()}`.padStart(3, '0'),
  ].join(split);
}

function copyCacheModules(dir) {
  // 复制缓存目录node_modules
  const startCp = Date.now();
  const installMarkFile = path.join(cwd, './node_modules/imt-mark');
  try {
    try {
      fs.accessSync(installMarkFile);
      console.log('已经安装模块，无需从缓存获取');
    } catch (e) {
      const zipFile = path.join(dir, 'node_modules.zip');
      fs.accessSync(zipFile);
      console.log(`开始复制缓存文件: ${zipFile}`);
      spawnSync('unzip', [zipFile, '-d', './'], { cwd });
      const time = (Date.now() - startCp) / 1000;
      console.log(`文件复制结束, 耗时${time}`);
      fs.writeFile(installMarkFile, `install at ${getFormatTime(new Date())}`, err => {
        if (err) {
          console.log(err);
        }
      });
      return time;
    }
  } catch (e) {
    console.log('没有找到缓存模块, 将全量安装');
    console.error(e);
  }
}

function updateCacheModules(cachesDir) {
  console.log('启动缓存更新进程');
  // 异步任务日志记录
  fs.ensureDirSync(`${cachesDir}/log/`);
  const logFileName = `${cachesDir}/log/imt_log_${getFormatTime(new Date())}.log`;
  console.log(logFileName);
  const log = fs.openSync(logFileName, 'a');
  const subprocess = spawn('node', [`${__dirname}/updateCache.js`, cachesDir], {
    cwd,
    detached: true,
    stdio: ['ignore', log, log],
  });
  subprocess.unref();
  console.log(subprocess.spawnargs.join(' '));
}

/**
 * @param {Object} options
 * @param {string} options.cmd 执行的构建命令
 * @param {string} options.cache 缓存目录
 */
module.exports = options => {
  const times = [];
  let { cache, cmd } = options;
  if (cmd) {
    cmd = pkg.scripts[cmd];
  }
  if (!cache) {
    throw Error('not found cache dir!');
  }
  if (!cmd) {
    throw Error(
      `not found "${options.cmd || ' command '}" command, example: imt cache build, build is a npm scripts key`
    );
  }
  const copyTime = copyCacheModules(cache);
  if (copyTime) {
    times.push({ cmd: 'cp 缓存模块', time: copyTime });
  }
  // 执行构建任务
  const startBuild = Date.now();

  function execSyncLogTime(_cmd) {
    _cmd = _cmd.trim();
    const start = Date.now();
    console.log('====================');
    console.log(`开始执行: ${_cmd}`);
    const log = execSync(_cmd, { maxBuffer: 5 * 1024 * 1024, cwd });
    console.log(log.toString('utf8'));
    const time = (Date.now() - start) / 1000;
    console.log(`结束执行: ${_cmd}；耗时: ${time}s`);
    times.push({ cmd: `${_cmd}`, time });
  }
  const cmds = cmd.split('&&');
  cmds.forEach(execSyncLogTime);

  console.log(`构建结束, 全部耗时：${(Date.now() - startBuild) / 1000}s`);
  console.log(
    times
      .sort((a, b) => b.time - a.time)
      .map(i => `${i.time}s -----${i.cmd}`)
      .join('\n')
  );

  updateCacheModules(cache);
};
