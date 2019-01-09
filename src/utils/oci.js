const axios = require('axios');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const url = require('url');
const git = require('./git');

const OCI_SERVER = 'http://dev.orange-ci.oa.com';

const EVENT_TYPE = {
  NOHOST: 'nohost', // 测试环境部署
  NOHOST_ZY: 'nohost_zy', // 测试环境部署+织云
  RELEASE_ARS: 'release_ars', // 现网免测发布
  RELEASE_ARS_ZY: 'release_ars_zy', // 现网免测发布+织云
  RELEASE_TEST_ARS: 'release_test_ars', // 现网提测发布
  RELEASE_TEST_ARS_ZY: 'release_test_ars_zy', // 现网提测发布+织云
};

/**
 *
 * @param {string} projectPath 启动CI，git仓库本地地址
 * @param {string} type 发布类型
 * @returns {string} 返回 CI 构建生成的 ID
 */
async function start(projectPath, type) {
  const token = readFileSync(resolve(projectPath, '.orange-ci.token'))
    .toString()
    .trim();
  const branch = await git.getBranchName(projectPath);
  const remoteUrl = await git.getStoreAddress(projectPath);
  const slug = url.parse(remoteUrl).path.substr(1);
  const data = {
    timeout: 3000,
    method: 'POST',

    url: `${OCI_SERVER}/api/build/start`,
    headers: {
      'X-Gitlab-Token': token,
      'Content-Type': 'application/json',
    },
    data: {
      slug,
      branch,
      user: 'edenhliu',
      event: `api_trigger_${type}`,
    },
    // proxy: {
    //   host: '127.0.0.1',
    //   port: 8899,
    // },
  };
  const result = await axios(data);
  console.log('​start -> result', result.data);
  return result;
}
/**
 * 查询构建进度
 *
 * @param {string} id 构建ID
 */
function getStatus(id) {
  console.log('getStatus:', id);
}
module.exports = { EVENT_TYPE, start, getStatus };

// TODO: 测试代码
const projectPath = '/Users/liuhua/work/code/pc';
start(projectPath, EVENT_TYPE.NOHOST);
