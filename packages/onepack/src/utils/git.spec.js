import 'jest-extended';
import { resolve } from 'path';
import { getBranchName, isGitProject, getBranches } from './git';

test('获取分支名称', async () => {
  expect(await getBranchName(resolve('.'))).toBeString();
});
test('判断是否是git仓库', async () => {
  expect(await isGitProject(resolve('.'))).toBeTrue();
});
test('获取所有分支名称', async () => {
  expect(await getBranches(resolve('.'))).toBeArray();
});
