const { launch } = require('../utils/chrome');
const Request = require('./request');
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
      return;
    }
  } catch (e) {}
  await login(url);
}
module.exports = { login, loginAndCheck };
// async function test() {
//   await loginAndCheck(JB_URL);
//   console.log(JB_URL, '登录成功');
//   await loginAndCheck(ZY_URL);
//   console.log(ZY_URL, '登录成功');
//   await loginAndCheck(ARS_URL);
//   console.log(ARS_URL, '登录成功');
// }
// test();
