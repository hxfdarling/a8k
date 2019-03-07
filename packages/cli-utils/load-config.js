const JoyCon = require('joycon').default;
const path = require('path');

module.exports = new JoyCon({
  // Only read up to current working directory
  stopDir: path.dirname(process.cwd()),
});
