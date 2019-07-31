const validateOptions = require('schema-utils');
const create = require('./create');
const schema = require('./options.json');

module.exports = function(api, options = {}) {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  validateOptions(schema, options, '@a8k/babel-preset');
  return create(api, options, env);
};
