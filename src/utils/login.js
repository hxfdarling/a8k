const { launch } = require('./chrome');

const url = 'http://jb.oa.com/';

const checkLogin = page => {
  return new Promise(resolve => {
    const flag = page.url().indexOf(url) >= 0;
    if (flag) {
      resolve();
    } else {
      setTimeout(async () => {
        await checkLogin(page);
        resolve();
      }, 100);
    }
  });
};
const getCookies = page => {
  return new Promise(async resolve => {
    const cookies = await page.cookies();
    if (cookies.find(({ name }) => name === 'TCOA_TICKET')) {
      const str = cookies.map(({ name, value }) => `${name}=${value}`).join(';');
      resolve(str);
    } else {
      setTimeout(async () => {
        const str = await getCookies(page);
        resolve(str);
      }, 100);
    }
  });
};
async function login() {
  let browser = await launch();
  let page = await browser.newPage();
  await page.goto(url);
  const supportAutoLogin = await page.evaluate(() => {
    const ioaloign = document.querySelector('#div_ioalogin');
    if (ioaloign.style.display === 'none') {
      return false;
    }
    return true;
  });
  if (supportAutoLogin) {
    await page.evaluate(() => document.querySelector('#btn_smartlogin').click());
  } else {
    browser.close();
    browser = await launch({
      defaultView: {
        width: 1000,
        height: 1000,
      },
      headless: false,
    });
    page = await browser.newPage();
    await page.goto(url);
  }
  await checkLogin(page);
  const cookies = await getCookies(page);
  await browser.close();
  console.log(cookies);
  return cookies;
}
module.exports = login;
login();
