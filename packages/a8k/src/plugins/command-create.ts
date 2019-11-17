import inquirer from 'inquirer';
import A8k from '..';
import create from '../utils/create-by-template';

export default class Create {
  public name = 'builtin:create-from-git';
  public apply(context: A8k) {
    context.registerCreateType('remote', '从远程仓库下载模板', async ({ projectDir }) => {
      const { repo }: any = await inquirer.prompt([
        {
          type: 'input',
          name: 'repo',
          message: '请输入远程仓库地址(例如:hxfdarling/typescript-eslint-starter)',
          validate(value: string) {
            if (value) {
              return true;
            }
            return false;
          },
        },
      ]);
      await create(projectDir, repo, context);
    });
  }
}
