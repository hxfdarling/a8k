/* eslint-disable no-shadow */
const path = require('path');
const resolve = require('resolve');
const { execSync } = require('child_process');
const jest = require('jest');

const createJestConfig = require('../utils/createJestConfig');
const { TEST } = require('../const');
const Imt = require('../index');

const cwd = process.cwd();

process.env.NODE_ENV = TEST;
process.env.BABEL_ENV = TEST;

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

module.exports = async options => {
  options.type = TEST;
  options.projectDir = cwd;

  const imt = new Imt(options);
  const { hooks } = imt;
  await new Promise(resolve => {
    hooks.beforeTest.callAsync(imt, resolve);
  });

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
        options.projectDir
      )
    )
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
    hooks.afterTest.callAsync(imt, async () => {
      resolve();
    });
  });
};
