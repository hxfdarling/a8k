const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('@a8k/babel-preset')],
  babelrc: true,
  configFile: false,
});
