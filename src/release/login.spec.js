const { loginAndCheck } = require('./login');
const { JB_URL, ARS_URL, ZY_URL } = require('../utils/urls');

test('登录JB状态检测', async () => {
  await expect(loginAndCheck(JB_URL)).resolves.toBe(true);
});
test('登录ARS状态检测', async () => {
  await expect(loginAndCheck(ARS_URL)).resolves.toBe(true);
});
test('登录ZY状态检测', async () => {
  await expect(loginAndCheck(ZY_URL)).resolves.toBe(true);
});
