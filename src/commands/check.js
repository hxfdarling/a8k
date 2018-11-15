const { execSync } = require('child_process');

module.exports = function() {
  execSync('git fetch origin master');

  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString();
  const ancestor = execSync(`git merge-base origin/master ${currentBranch}`).toString();
  const masterLatest = execSync('git log --oneline -n 1 --pretty=format:"%h" origin/master').toString();

  if (ancestor.indexOf(masterLatest) === -1) {
    throw new Error("current branch doesn't merge the latest master commit!");
  } else {
    console.log('current branch is merged the latest master commit!');
  }
};
