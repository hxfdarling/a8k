import createJestConfig from '@a8k/dev-utils/createJestConfig';
import { execSync } from 'child_process';
import jest from 'jest';
import path from 'path';
import resolve from 'resolve';
// import logger from '@a8k/cli-utils/logger';
import { ENV_TEST } from '../const';

process.env.NODE_ENV = ENV_TEST;
process.env.BABEL_ENV = ENV_TEST;
function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}
function resolveJestDefaultEnvironment(name) {
  const jestDir = path.dirname(
    resolve.sync('jest', {
      basedir: __dirname,
    })
  );
  const jestCLIDir = path.dirname(
    resolve.sync('jest-cli', {
      basedir: jestDir,
    })
  );
  const jestConfigDir = path.dirname(
    resolve.sync('jest-config', {
      basedir: jestCLIDir,
    })
  );
  return resolve.sync(name, {
    basedir: jestConfigDir,
  });
}

export default {
  apply: context => {
    context
      .registerCommand('test')
      .description('运行 jest 测试')
      .option('--coverage', 'coverage')
      .option('--watchAll', 'watch')
      .option('--env [env]', 'environment', 'jsdom')
      .action(async ({ coverage, watchAll, env }) => {
        const options = { coverage, watchAll, env };
        context.hooks.invokePromise('beforeTest', context);
        const argv = [];

        if (!process.env.CI && !options.coverage && !options.watchAll) {
          const hasSourceControl = isInGitRepository();
          argv.push(hasSourceControl ? '--watch' : '--watchAll');
        }

        argv.push(
          '--config',
          JSON.stringify(
            createJestConfig(
              relativePath => path.resolve(__dirname, '..', relativePath),
              context.resolve()
            )
          )
        );

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

        await context.hooks.invokePromise('afterTest', context);
      });
  },
  name: 'builtin:test',
};
