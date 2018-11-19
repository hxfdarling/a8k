const puppeteer = require('puppeteer-core');
const commandExists = require('command-exists');

async function isCommandExists(cmd) {
  return new Promise((resolve, reject) => {
    commandExists(cmd, (err, exists) => {
      if (err) {
        reject(err);
      } else {
        resolve(exists);
      }
    });
  });
}

async function detectChrome() {
  if (await isCommandExists('google-chrome-unstable')) {
    return 'google-chrome-unstable';
  }
  if (await isCommandExists('google-chrome-beta')) {
    return 'google-chrome-beta';
  }
  if (await isCommandExists('google-stable')) {
    return 'google-stable';
  }
  if (await isCommandExists('google-chrome')) {
    return 'google-chrome';
  }
  if (await isCommandExists('chromium')) {
    return 'chromium';
  }
  if (await isCommandExists('chromium-browser')) {
    return 'chromium-browser';
  }
  // windows
  if (await isCommandExists('chrome')) {
    return 'chrome';
  }
  // macos
  if (await isCommandExists('/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome')) {
    return '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome';
  }
  if (await isCommandExists('/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome')) {
    return '/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome';
  }
  if (await isCommandExists('/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome')) {
    return '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome';
  }
  if (await isCommandExists('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  throw Error("Couldn't detect chrome version installed! use --chrome-binary to pass custom location");
}

process.on('unhandledRejection', err => {
  throw err;
});
async function start() {
  const executablePath = await detectChrome();
  console.log('​executablePath', executablePath);
  const browser = await puppeteer.launch({
    headless: false,
    executablePath,
  });
  const page = await browser.newPage();
  await page.goto('https://www.qq.com');
  console.log(await page.cookies());

  // other actions...
  // await browser.close();
}
start();
