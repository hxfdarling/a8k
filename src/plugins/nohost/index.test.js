const Nohost = require('./index');

test('Nohost 获取所有配置信息', async () => {
  const nohost = new Nohost({});
  nohost.rtx = 'edenhliu';
  await expect(nohost.getAllEnvs()).resolves.toBeInstanceOf(Object);
});
test('Nohost 获取个人配置', async () => {
  const nohost = new Nohost({});
  nohost.rtx = 'edenhliu';
  await expect(nohost.getMyEnvs()).resolves.toBeInstanceOf(Object);
});
test('Nohost 后台人员配置', async () => {
  const nohost = new Nohost({});
  nohost.rtx = 'edenhliu';
  await expect(nohost.getSvrEnvs()).resolves.toBeInstanceOf(Object);
});
test('Nohost 添加配置', async () => {
  const nohost = new Nohost({});
  nohost.rtx = 'edenhliu';
  await expect(nohost.addMyEnv('test_imt_nohost', 'fudao.qq.com/cgi-bin/ 10.100.69.120:8080')).resolves.toBeInstanceOf(
    Object
  );
});
test('Nohost 删除配置', async () => {
  const nohost = new Nohost({});
  nohost.rtx = 'edenhliu';
  await expect(nohost.remove('test_imt_nohost')).resolves.toBeInstanceOf(Object);
});
