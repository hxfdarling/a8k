import getNpmCommand from '@a8k/cli-utils/npm';
import { execSync } from 'child_process';
import 'colors';
import moment from 'moment';
import semver from 'semver';
import { getConfig, setConfig } from '../utils/global-config';

const { name, version } = require('../../package.json');

const args = [];
const todayStr = moment().format('YYYY-MM-DD');

// START 检查是否需要检查更新
let needCheck = true;
if (getConfig('updateDate') === todayStr && getConfig('needUpdate') === false) {
  needCheck = false;
}
if (needCheck) {
  // END 检查是否需要检查更新
  args.push('-j');
  args.push('--nochecklatest');
  const cmd = getNpmCommand();
  const info: any = JSON.parse(execSync(`${cmd} info ${name} ${args.join(' ')}`).toString());
  let latestVersion = info.versions.pop();
  while (latestVersion) {
    if (!/-/.test(latestVersion)) {
      break;
    }
    latestVersion = info.versions.pop();
  }
  const needUpdate = semver.gt(latestVersion, version);
  if (needUpdate) {
    console.log(
      `目前最新版本的 ${name} 为：${latestVersion.green}, 你的当前版本为：${version.red}`
    );
    console.log(`升级命令：\`$ ${`${cmd} install -g ${name}`.green}\``);
    console.log();
  }
  setConfig({ updateDate: todayStr, needUpdate });
  // 写回缓存
}
