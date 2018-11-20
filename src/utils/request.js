const request = require('request');
const querystring = require('querystring');
const { parseString } = require('xml2js');
const iconv = require('iconv-lite');

const TIMEOUT = 50000;
const LOGGER_FUNC_NAMES = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

class Request {
  constructor(opts = {}) {
    this.opts = opts;
    this.timeout = opts.timeout || TIMEOUT;
    this.onLoginStateInvalid = opts.onLoginStateInvalid || (() => {});
    this.initLogger(opts.logger);
    // 设置请求
    this.request = request.defaults(this.opts.requestOptions);
    if (opts.domain) {
      this.domain = opts.domain;
    }
    if (opts.cookies) {
      this.initCookie(opts.cookies);
    }
  }

  /**
   * 设置 logger
   * @memberOf Base
   */
  initLogger(logger = {}) {
    this.logger = logger;

    LOGGER_FUNC_NAMES.forEach(name => {
      if (!this.logger[name]) {
        this.logger[name] = () => {};
      }
    });
  }

  /**
   * 为 request 对象设置默认的cookie
   * @param {Array} cookie cookie
   */
  initCookie(cookie = []) {
    this.cookies = cookie;

    // 为 request 对象设置默认的 cookie
    const jar = request.jar();

    // 遍历 cookie
    this.cookies.forEach(item => {
      // 获取 rtx 名称
      if (['LoginName', 't_uid'].indexOf(item.name) !== -1) {
        this.rtx = item.value;
      }

      // 如果还没查找到 rtx，则可能存在于 'TCOA_TICKET' 中
      if (this.rtx === undefined && item.name === 'TCOA_TICKET') {
        const len = item.value.length;
        if (len > 3) {
          this.rtx = item.value.substring(1, len - 2);
        }
      }
      // 设置 cookie
      jar.setCookie(request.cookie(`${item.name}=${item.value}`), this.domain);
    });
    // 设置请求
    this.request = request.defaults(
      Object.assign(
        {
          jar,
        },
        this.opts.requestOptions
      )
    );
  }

  /**
   * 发出get请求
   * @param {String} 请求的 url
   * @param {Object} params 请求参数
   * @param {Object} options 选项
   */
  get(url, params = {}, options = {}) {
    // 拼接参数
    if (Object.keys(params).length > 0) {
      url += `?${querystring.stringify(params)}`;
    }

    return new Promise((resolve, reject) => {
      this.request.get(
        Object.assign(
          {
            url,
            timeout: this.timeout,
            encoding: null,
          },
          options
        ),
        this.parseBody(resolve, reject, url)
      );
    }).catch(error => {
      // 增加日志
      this.logger.error(`[get] ${url} Error`, error);
      return Promise.reject(error);
    });
  }

  /**
   * 发出post请求
   * @param {String} url url
   * @param {Object} params 请求参数
   * @param {Object} options 选项
   */
  post(url, params = {}, options = {}, type) {
    if (this.showLog) {
      this.logger.debug(`send request post:${url}, params:${JSON.stringify(params)}`);
    }
    switch (type) {
      case 'json':
        return new Promise((resolve, reject) => {
          this.request.post(
            Object.assign(
              {
                url,
                encoding: null,
                json: params,
                timeout: this.timeout,
              },
              options
            ),
            this.parseBody(resolve, reject, url)
          );
        });
      default:
        return new Promise((resolve, reject) => {
          this.request.post(
            Object.assign(
              {
                url,
                encoding: null,
                form: params,
                timeout: this.timeout,
              },
              options
            ),
            this.parseBody(resolve, reject, url)
          );
        });
    }
  }

  /**
   * 统一解析返回OA系统的结果
   * @param {Function} resolve function
   * @param {Function} reject function
   */
  parseBody(resolve, reject) {
    return (err, res, body) => {
      if (err) {
        return reject(err);
      }

      const { statusCode, headers } = res;

      const contentType = headers['content-type'];
      const rejectNeedLogin = () => {
        this.onLoginStateInvalid();
        return reject(new Error('need login'));
      };

      // 3xx 需要登陆
      if (statusCode >= 300 && statusCode < 400) {
        return rejectNeedLogin();
      }

      // 根据不同的数据格式进行处理
      if (contentType.indexOf('text/xml') !== -1) {
        // xml
        body = iconv.decode(body, 'gb2312');
        // 数据处理
        parseString(body, (e, result) => {
          if (e) {
            return reject(e);
          }
          resolve(result);
        });
      } else if (contentType.indexOf('application/json') !== -1) {
        // json
        const decodeBody = iconv.decode(body, 'utf8');
        try {
          const result = JSON.parse(decodeBody);
          resolve(result);
        } catch (e) {
          // 解析失败直接返回 body
          return resolve(body);
        }
      } else {
        body = iconv.decode(body, 'utf8');
        // 需要登录
        if (body.indexOf('<title>企业管理首页</title>') > -1) {
          return rejectNeedLogin();
        }

        return resolve(body);
      }
    };
  }
}

module.exports = Request;
