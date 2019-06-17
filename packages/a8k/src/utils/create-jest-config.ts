import A8k from '..';

const chalk = require('chalk');
const path = require('path');

export default (context: A8k) => {
  const rootDir = context.resolve();
  const config = {
    rootDir,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    setupFiles: [require.resolve('./jsdom')],
    testMatch: [
      '<rootDir>/tests/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}',
    ],
    testEnvironment: 'jsdom',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': require.resolve('../jest/babelTransform.js'),
      '^.+\\.css$': require.resolve('../jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': require.resolve('../jest/fileTransform.js'),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\](?!@tencent[/\\\\]).+\\.(js|jsx|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    },
    moduleDirectories: [
      context.resolve('src'),
      context.resolve('node_modules'),
      context.rootResolve('node_modules'),
      'node_modules',
    ],
  };
  const overrides = require(path.join(rootDir, 'package.json')).jest;
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
    'setupFiles',
    'testPathIgnorePatterns',
  ];
  if (overrides) {
    supportedKeys.forEach((key) => {
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
          `${'\nOut of the box, a8k only supports overriding ' +
            'these Jest options:\n\n'}${supportedKeys
            .map((key) => chalk.bold(`  \u2022 ${key}`))
            .join('\n')}.\n\n` +
            'These options in your package.json Jest configuration ' +
            `are not currently supported by a8k :\n\n${unsupportedKeys
              .map((key) => chalk.bold(`  \u2022 ${key}`))
              .join('\n')}\n\nIf you wish to override other Jest options, you need to ` +
            `eject from the default setup. You can do so by running ${chalk.bold(
              'npm run eject',
            )} but remember that this is a one-way operation. ` +
            'You may also file an issue with a8k to discuss ' +
            'supporting more options out of the box.\n',
        ),
      );
      process.exit(1);
    }
  }
  return config;
};
