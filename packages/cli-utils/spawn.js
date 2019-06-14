function spawn(cmd, args, options) {
  return new Promise(resolve => {
    const sp = require('child_process').spawn(cmd, args, { stdio: [0, 1, 2], ...options });
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
