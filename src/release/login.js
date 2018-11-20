const { launch } = require('../utils/chrome');
const Request = require('../utils/request');
const logger = require('../utils/logger');
const db = require('../utils/db');

// const { JB_URL, ARS_URL, ZY_URL } = require('../utils/urls');

const checkLogin = (page, url) => {
  return new Promise(resolve => {
    const flag = page.url().indexOf(url) >= 0;
    if (flag) {
      resolve();
    } else {
      setTimeout(async () => {
        await checkLogin(page, url);
        resolve();
      }, 100);
    }
  });
};
async function login(url) {
  let browser = await launch({ headless: true });
  let page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const supportAutoLogin = await page.evaluate(() => {
    const ioalogin = document.querySelector('#div_ioalogin');
    if (ioalogin.style.display === 'none') {
      return false;
    }
    return true;
  });
  if (supportAutoLogin) {
    await page.evaluate(() => document.querySelector('#btn_smartlogin').click());
  } else {
    await browser.close();
    browser = await launch({
      headless: false,
    });
    page = await browser.newPage();
    await page.goto(url);
  }
  await checkLogin(page, url);
  const cookies = await page.cookies();
  await browser.close();
  await db.set(`cookies:${url}`, cookies).write();
  return cookies;
}
async function checkLoginStatus(url, cookies) {
  const request = new Request({ logger, cookies, domain: url });
  try {
    await request.get(url);
  } catch (e) {
    return false;
  }
  return true;
}

async function loginAndCheck(url) {
  const cookies = await db.get(`cookies:${url}`).value();
  try {
    if (cookies && (await checkLoginStatus(url, cookies))) {
      return true;
    }
  } catch (e) {}
  await login(url);
  return true;
}
module.exports = { login, loginAndCheck };
