const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');

process.on('unhandledRejection', err => {
  throw err;
});

exports.launch = async (options = {}) => {
  const executablePath = findChrome();
  const browser = await puppeteer.launch({
    executablePath,
    ...options,
  });
  return browser;
};
