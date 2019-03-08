export default {
  apply: context => {
    context
      .registerCommand('test')
      .description('运行 jest 测试')
      .option('--coverage', 'coverage')
      .option('--watchAll', 'watch')
      .option('--env', 'environment')
      .action(async () => {
        console.log('即将推出');
      });
  },
  name: 'builtin:test',
};
