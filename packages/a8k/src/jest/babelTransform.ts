const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-a8k')],
  babelrc: true,
  configFile: false,
});
