const Nohost = require('./index');

test('Nohost连接性测试', async () => {
  const nohost = new Nohost({});
  await expect(nohost.getAllEnvs()).resolves.toBeInstanceOf(Object);
});
