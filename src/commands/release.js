const fs = require('fs-extra');
const Imt = require('../index.js');
const { done, info } = require('../utils/logger');
const { PROD } = require('../const');
const getOptions = require('../utils/getOptions');
const login = require('../utils/login');

process.env.NODE_ENV = PROD;

module.exports = async (mode, argv) => {
  const options = getOptions(argv);
  options.type = PROD;

  const imt = new Imt(options);

  await new Promise(resolve => {
    imt.hooks.beforeRelease.callAsync(imt, resolve);
  });
  fs.emptyDirSync(options.distDir);
  await new Promise(resolve => {
    info('coming soon');
    login();
    resolve();
  });

  await new Promise(resolve => {
    imt.hooks.afterRelease.callAsync(imt, async () => {
      done(`release ${mode} done!`);
      resolve();
    });
  });
};
