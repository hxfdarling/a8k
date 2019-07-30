import getNpmCommand from '@a8k/cli-utils/npm';
import spawn from '@a8k/cli-utils/spawn';
import { spinner } from '@a8k/common';
import createGenerator from './create';

export default class PluginCreateTypescriptProject {
  public name = 'builtin:create-ts';

  public options: any;

  constructor(options: any) {
    this.options = options;
  }

  public apply(context: any) {
    context.registerCreateType(
      'typescript-sample',
      '基于typescript的项目',
      async ({ projectDir, name }) => {
        await createGenerator(projectDir, name);
        await context.hooks.invokePromise('afterCreate', context);
        spinner.succeed('File Generate Done');

        const npmCmd = getNpmCommand();

        await spawn(npmCmd, ['i'], { cwd: projectDir });
        spinner.succeed('安装依赖完毕');
        await context.hooks.invokePromise(context);
        spinner.succeed('项目创建完毕');
      }
    );
  }
}
