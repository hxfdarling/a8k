const { transform } = require('@babel/core');

module.exports = (code, options) => {
  const babelOptions = {
    minified: options.minimize,
    presets: [
      [
        require('@babel/preset-env').default,
        {
          // no longer works with IE 10
          targets: {
            ie: 10,
          },
          // Users cannot override this behavior because this Babel
          // configuration is highly tuned for ES5 support
          ignoreBrowserslistConfig: true,
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
