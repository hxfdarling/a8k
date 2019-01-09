const git = require('./git.js');

test('获取分支名称', async () => {
  const name = await git.getBranchName();
  expect(name).toBe('master');
});
