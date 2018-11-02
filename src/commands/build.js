const ImtBuild = require('../ImtBuild');

module.exports = (dir, options) => {
  return new ImtBuild(dir, options).build();
};
