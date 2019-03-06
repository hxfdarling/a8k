export default {
  apply: context => {
    context
      .registerCommand('test', '运行 jest 测试', async () => {
        //
      })
      .option('--coverage', 'coverage')
      .option('--watchAll', 'watch')
      .option('--env', 'environment');
  },
  name: 'builtin:test',
};
