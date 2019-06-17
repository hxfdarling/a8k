import { execSync } from 'child_process';
import jest from 'jest';
import path from 'path';
import resolve from 'resolve';
import A8k from '..';
import { ENV_TEST } from '../const';
import createJestConfig from '../utils/create-jest-config';

function isInGitRepository(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}
function resolveJestDefaultEnvironment(name: string) {
  const jestDir = path.dirname(
    resolve.sync('jest', {
      basedir: __dirname,
    }),
  );
  const jestCLIDir = path.dirname(
    resolve.sync('jest-cli', {
      basedir: jestDir,
    }),
  );
  const jestConfigDir = path.dirname(
    resolve.sync('jest-config', {
      basedir: jestCLIDir,
    }),
  );
  return resolve.sync(name, {
    basedir: jestConfigDir,
  });
}

export default class TestCommand {
  public name = 'builtin:test';
  public apply(context: A8k) {
    context
      .registerCommand('test')
      .description('运行 jest 测试')
      .option('-c, --coverage', 'coverage')
      .option('-w, --watchAll', 'watch')
      .option('--env [env]', 'environment', 'jsdom')
      .action(async ({ coverage, watchAll, env }) => {
        process.env.NODE_ENV = ENV_TEST;
        process.env.BABEL_ENV = ENV_TEST;
        context.hooks.invokePromise('beforeTest', context);
        const argv: string[] = [];

        if (!process.env.CI && !coverage) {
          const hasSourceControl = isInGitRepository();
          argv.push(hasSourceControl ? '--watch' : '--watchAll');
        }

        if (watchAll) {
          argv.push('--watchAll');
        }

        argv.push('--config', JSON.stringify(createJestConfig(context)));

        let resolvedEnv;
        try {
          resolvedEnv = resolveJestDefaultEnvironment(`jest-environment-${env}`);
        } catch (e) {
          // ignore
        }
        if (!resolvedEnv) {
          try {
            resolvedEnv = resolveJestDefaultEnvironment(env);
          } catch (e) {
            // ignore
          }
        }
        const testEnvironment = resolvedEnv || env;
        argv.push('--env', testEnvironment);
        jest.run(argv);
      });
  }
}
