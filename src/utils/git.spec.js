const git = require('./git.js');

test('是Git仓库', async () => {
  // travis 不运行该测试用例
  if (process.env.CI_ENV === 'travis') {
    return;
  }
  const flag = await git.isGitProject();
  expect(flag).toBe(true);
});
