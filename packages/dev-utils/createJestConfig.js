const chalk = require('chalk');
const path = require('path');

module.exports = (resolve, rootDir) => {
  const config = {
    rootDir,
    collectCoverageFrom: ['src/**/*.{js,jsx,tsx}'],
    resolver: require.resolve('jest-pnp-resolver'),
    setupFiles: [require.resolve('./jsdom')],
    testMatch: [
      '<rootDir>/test/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/__test__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}',
    ],
    testEnvironment: 'jsdom',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': resolve('jest/babelTransform.js'),
      '^.+\\.css$': resolve('jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': resolve('jest/fileTransform.js'),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    },
  };
  const overrides = Object.assign({}, require(path.join(rootDir, 'package.json')).jest);
  const supportedKeys = [
    'collectCoverageFrom',
    'coverageReporters',
    'coverageThreshold',
    'globalSetup',
    'globalTeardown',
    'resetMocks',
    'resetModules',
    'snapshotSerializers',
    'watchPathIgnorePatterns',
  ];
  if (overrides) {
    supportedKeys.forEach(key => {
      // eslint-disable-next-line no-prototype-builtins
      if (overrides.hasOwnProperty(key)) {
        config[key] = overrides[key];
        delete overrides[key];
      }
    });
    const unsupportedKeys = Object.keys(overrides);
    if (unsupportedKeys.length) {
      console.error(
        chalk.red(
          `${'\nOut of the box, Create React App only supports overriding '
            + 'these Jest options:\n\n'}${supportedKeys
            .map(key => chalk.bold(`  \u2022 ${key}`))
            .join('\n')}.\n\n`
            + 'These options in your package.json Jest configuration '
            + `are not currently supported by Create React App:\n\n${unsupportedKeys
              .map(key => chalk.bold(`  \u2022 ${key}`))
              .join('\n')}\n\nIf you wish to override other Jest options, you need to `
            + `eject from the default setup. You can do so by running ${chalk.bold(
              'npm run eject'
            )} but remember that this is a one-way operation. `
            + 'You may also file an issue with Create React App to discuss '
            + 'supporting more options out of the box.\n'
        )
      );
      process.exit(1);
    }
  }
  return config;
};
