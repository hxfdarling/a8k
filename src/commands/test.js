const Service = require('../Service');

const { TEST } = require('../const');

process.env.NODE_ENV = TEST;

class DevServer extends Service {
  async start() {
    await new Promise(resolve => {
      this.hooks.beforeDev.callAsync(this, resolve);
    });

    await new Promise(resolve => {
      this.hooks.afterDev.callAsync(this, async () => {
        resolve();
      });
    });
  }
}

module.exports = (dir, options) => {
  options.type = TEST;
  return new DevServer(dir, options).start();
};
