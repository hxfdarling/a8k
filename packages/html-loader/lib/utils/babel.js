const { transform } = require('@babel/core');

module.exports = (filename, code, options) => {
  const babelOptions = {
    filename,
    minified: options.minimize,
    presets: [
      [
        require('@a8k/babel-preset'),
        {
          target: 'web',
          useBuiltIns: false,
        },
      ],
    ],
  };
  return new Promise((resolve, reject) => {
    transform(code, babelOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info.code);
      }
    });
  });
};
