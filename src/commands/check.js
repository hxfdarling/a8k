const { execSync } = require('child_process');
const { info, error } = require('../utils/logger');

module.exports = function() {
  try {
    execSync('git fetch origin master');
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString();
    const ancestor = execSync(`git merge-base origin/master ${currentBranch}`).toString();
    const masterLatest = execSync('git log --oneline -n 1 --pretty=format:"%h" origin/master').toString();
    if (ancestor.indexOf(masterLatest) === -1) {
      error(Error("current branch doesn't merge the latest master commit!"));
      process.exit(1);
    } else {
      info('current branch is merged the latest master commit!');
    }
  } catch (e) {
    error(e);
    process.exit(1);
  }
};
