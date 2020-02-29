const util = require('util');

function spawn(cmd, args, options) {
  if (process.platform === 'win32') {
    cmd = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', cmd, ...args];
    options = util._extend({}, options);
    options.windowsVerbatimArguments = true;
  }
  return new Promise(resolve => {
    const sp = require('child_process').spawn(cmd, args, { stdio: 'inherit', ...options });
    sp.on('error', err => {
      console.trace(err);
    });
    sp.on('close', code => {
      if (code !== 0) {
        process.exit(code);
      } else {
        resolve();
      }
    });
  });
}
module.exports = spawn;
