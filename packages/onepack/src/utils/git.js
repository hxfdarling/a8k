const path = require('path');
const { exec } = require('child_process');

module.exports = {
  /**
   * 执行命令
   * @param {String} cmdStr 要执行的命令
   * @param {String} cwd 执行命令所在的目录
   * @returns {String} 失败则抛出异常，否则返回命令执行结果
   */
  execPromise(cmdStr, cwd) {
    const options = {
      cwd,
    };

    return new Promise((resolve, reject) => {
      exec(cmdStr, options, (error, stdout, stderr) => {
        if (error || stderr) {
          return reject(error || stderr);
        }
        resolve(stdout);
      });
    });
  },

  /**
   * 获取分支名称
   * @param {String} fullPath 完整路径
   */
  async getBranchName(fullPath) {
    let name = await this.execPromise('git rev-parse --abbrev-ref HEAD', fullPath);
    if (name) {
      name = name.trim();
    }
    return name;
  },

  /**
   * 获取远程仓库地址
   * @param {String} fullPath 完整路径
   */
  async getStoreAddress(fullPath) {
    let address = await this.execPromise('git remote -v', fullPath);
    if (address) {
      address = address.trim();
    }

    // 一定要是 origin 下的
    [, address] = address.match(/origin\s+(\S+)(\.git)?/);
    if (address.substring(address.length - 4, address.length) !== '.git') {
      address += '.git';
    }

    if (address && address.indexOf('git@git.code.oa.com:') === 0) {
      address = address.replace('git@git.code.oa.com:', 'http://git.code.oa.com/');
    }
    return address;
  },

  /**
   * 获取远程仓库名
   * @param {String} fullPath 项目地址
   */
  async getStoreName(fullPath) {
    const address = await this.getStoreAddress(fullPath);
    return /\/([^/]+)\.git$/.exec(address)[1];
  },

  /**
   * 获取所有分支
   * @param {String} fullPath 路径
   */
  async getBranches(fullPath) {
    try {
      const result = await this.execPromise('git branch', fullPath);
      const list = result
        .match(/\s([\w]*)/g)
        .map(item => {
          return (item || '').trim();
        })
        .filter(item => !!item);
      return list;
    } catch (e) {
      return [];
    }
  },

  /**
   * 切换分支
   * @param {String} name 分支名称
   * @param {String} fullPath 完整路径
   */
  changeBranch(name, fullPath) {
    return this.execPromise(`git checkout ${name}`, path.join(fullPath, './'));
  },

  /**
   * 判断项目是否是git项目
   * @param {String} fullPath 完整路径
   */
  async isGitProject(fullPath) {
    try {
      const result = await this.execPromise('git status', fullPath);
      return result.indexOf('fatal') === -1;
    } catch (e) {
      return false;
    }
  },

  /**
   * 创建分支
   * @param {String} name 分支名称
   * @param {String} cwd 完整路径
   */
  async createBranch(name, cwd) {
    await this.execPromise(`git branch ${name}`, cwd);
  },

  /**
   * 切换分支
   * @param {String} name 分支名称
   * @param {String} cwd 完整路径
   */
  async checkoutBranch(name, cwd) {
    await this.execPromise(`git checkout ${name}`, cwd);
  },
};
