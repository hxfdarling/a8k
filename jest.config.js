module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  setupTestFrameworkScriptFile: 'jest-extended',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.(spec|test).{js,jsx,ts,tsx}'],
};
