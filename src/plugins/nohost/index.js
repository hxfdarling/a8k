const Request = require('../../utils/request');

class Nohost extends Request {
  constructor(opts = {}) {
    super(opts);
    this.logger.debug('初始化nohost...');
    this.opts.requestOptions = {
      proxy: 'http://100.66.102.75:8080',
    };
  }

  getHeader(nohost) {
    return {
      authorization: 'Basic bm9ob3N0OjE1ZWU2NzdjNjBlZDFjYjk2YjU0OGRjMDU1NDFiY2FlYzA3ZTIzNGU=',
      'content-type': 'application/x-www-form-urlencoded',
      'x-nohost-account-name': nohost || this.rtx,
      'x-nohost-auth-key': 'nohost@imweb',
    };
  }

  /**
   * 获取我的配置列表
   */
  getMyEnvs() {
    const options = {
      headers: this.getHeader(),
    };
    return this.get('http://nohost.oa.com:8080/open-api/list', {}, options);
  }

  /**
   * 所有人配置列表
   */
  getAllEnvs() {
    const options = {
      headers: this.getHeader(),
    };
    return this.get('http://nohost.oa.com:8080/cgi-bin/list', {}, options);
  }

  /**
   * 获取后台测试的配置列表
   */
  async getSvrEnvs(accounts = []) {
    const tasks = [];
    accounts.forEach(account => {
      tasks.push(
        this.get(
          'http://nohost.oa.com:8080/open-api/list',
          {},
          {
            headers: this.getHeader(account),
          }
        )
      );
    });

    const results = await Promise.all(tasks);

    const envs = [];
    results.forEach((result, i) => {
      result.list.forEach(env => {
        env.fullName = `@${accounts[i]}/${env.name}`;
        envs.push(env);
      });
    });

    return {
      ec: 0,
      list: envs,
    };
  }

  /**
   * 新增配置
   * @param {String} name 配置名称
   * @param {String} cgi 配置的CGI
   */
  async addMyEnv(name, cgi) {
    const value = this.getConfigByName(name, cgi);
    const options = {
      headers: this.getHeader(),
    };
    const result = await this.post(
      'http://nohost.oa.com:8080/open-api/add-env',
      {
        name,
        value,
      },
      options
    );
    return result;
  }

  /**
   * 修改配置
   * @param {String} name 配置名称
   * @param {String} newName 新名称
   */
  async modify(name, newName) {
    const options = {
      headers: this.getHeader(),
    };
    const result = await this.post(
      'http://nohost.oa.com:8080/rename-env',
      {
        name,
        newName,
      },
      options
    );
    return result;
  }

  /**
   * 删除配置
   * @param {String} name 配置名称
   */
  async remove(name) {
    const options = {
      headers: this.getHeader(),
    };
    const result = await this.post(
      'http://nohost.oa.com:8080/open-api/remove-env',
      {
        name,
      },
      options
    );
    return result;
  }

  /**
   * 根据配置名称生成配置
   * @param {String} name 配置名称
   */
  getConfigByName(name, cgi) {
    let result = `@${name}`;
    if (cgi) {
      result = `${cgi}\n${result}`;
    }
    return result;
  }
}

module.exports = Nohost;
