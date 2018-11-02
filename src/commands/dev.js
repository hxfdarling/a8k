const ImtBuild = require('../ImtBuild');

module.exports = (dir, options) => {
  options.env = 'development';
  return new ImtBuild(dir, options).dev();
};
