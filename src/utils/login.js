const CDP = require('chrome-remote-interface');
const shell = require('shelljs');

const port = '9333';
async function example() {
  let client;
  try {
    // connect to endpoint
    client = await CDP({ port });
    // extract domains
    const { Network, Page } = client;
    // setup handlers
    Network.requestWillBeSent(params => {
      console.log(params.request.url);
    });
    // // enable events then start!
    // await Network.enable();
    // await Page.enable();
    await Page.navigate({ url: 'https://www.qq.com' });
    // await Page.loadEventFired();
  } catch (err) {
    console.error(err);
  }
  // await client.close();
}

const start = () => {
  const argv = [
    `--user-data-dir=node_modules/.imt_${port}`,
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
  ].join(' ');

  shell.exec(`/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome ${argv}`);
  example();
};
module.exports = start;
