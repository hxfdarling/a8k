/* eslint-disable no-shadow */
const path = require('path');
const resolve = require('resolve');
const { execSync } = require('child_process');
const jest = require('jest');

const Service = require('../Service');
const createJestConfig = require('../utils/createJestConfig');
const { TEST } = require('../const');

process.env.NODE_ENV = TEST;
process.env.BABEL_ENV = TEST;

process.on('unhandledRejection', err => {
  throw err;
});
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
class Test extends Service {
  async start() {
    const { options } = this;
    await new Promise(resolve => {
      this.hooks.beforeDev.callAsync(this, resolve);
    });

    const argv = [];

    if (!process.env.CI && !options.coverage && !options.watchAll) {
      const hasSourceControl = isInGitRepository();
      argv.push(hasSourceControl ? '--watch' : '--watchAll');
    }

    argv.push(
      '--config',
      JSON.stringify(createJestConfig(relativePath => path.resolve(__dirname, '..', relativePath), options.projectDir))
    );

    const env = options.env || 'jsdom';

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

    await new Promise(resolve => {
      this.hooks.afterDev.callAsync(this, async () => {
        resolve();
      });
    });
  }
}

module.exports = (dir, options) => {
  options.type = TEST;
  console.log('​dir, options', dir, options);
  return new Test(dir, options).start();
};
