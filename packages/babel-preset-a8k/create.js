module.exports = function(api, options, env) {
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  const isEnvTest = env === 'test';
  const { isSSR } = options;
  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      `${'Using `babel-preset-imt` requires that you specify `NODE_ENV` or '
        + '`BABEL_ENV` environment variables. Valid values are "development", '
        + '"test", and "production". Instead, received: '}${JSON.stringify(env)}.`
    );
  }

  return {
    presets: [
      isEnvTest && [
        // ES features necessary for user's Node version
        require('@babel/preset-env').default,
        {
          targets: {
            node: 'current',
          },
        },
      ],
      (isEnvProduction || isEnvDevelopment) && [
        // Latest stable ECMAScript features
        require('@babel/preset-env').default,
        {
          // no longer works with IE 10
          targets: {
            ie: 10,
          },
          // Users cannot override this behavior because this Babel
          // configuration is highly tuned for ES5 support
          ignoreBrowserslistConfig: true,
          // 转化为commonjs，为了支持module.exports => export default
          modules: 'commonjs',
        },
      ],
      [
        require('@babel/preset-react').default,
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isEnvDevelopment || isEnvTest,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          useBuiltIns: true,
        },
      ],
      [require('@babel/preset-flow').default],
    ].filter(Boolean),
    plugins: [
      [require('babel-plugin-jsx-if-directive'), {}],
      // 优化lodash导入
      require('babel-plugin-lodash'),

      // Polyfills the runtime needed for async/await, generators, and friends
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime
      [
        require('@babel/plugin-transform-runtime').default,
        {
          corejs: false,
          regenerator: true,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          // We should turn this on once the lowest version of Node LTS
          // supports ES Modules.
          useESModules: isSSR ? false : isEnvDevelopment || isEnvProduction,
        },
      ],

      // Stage 0
      require('@babel/plugin-proposal-function-bind').default,

      // Stage 1
      require('@babel/plugin-proposal-export-default-from').default,
      require('@babel/plugin-proposal-logical-assignment-operators').default,
      [require('@babel/plugin-proposal-optional-chaining').default, { loose: false }],
      [require('@babel/plugin-proposal-pipeline-operator').default, { proposal: 'minimal' }],
      [require('@babel/plugin-proposal-nullish-coalescing-operator').default, { loose: false }],
      require('@babel/plugin-proposal-do-expressions').default,

      // Stage 2
      [require('@babel/plugin-proposal-decorators').default, { legacy: true }],
      require('@babel/plugin-proposal-function-sent').default,
      require('@babel/plugin-proposal-export-namespace-from').default,
      require('@babel/plugin-proposal-numeric-separator').default,
      require('@babel/plugin-proposal-throw-expressions').default,

      // Stage 3
      require('@babel/plugin-syntax-dynamic-import').default,
      require('@babel/plugin-syntax-import-meta').default,
      [require('@babel/plugin-proposal-class-properties').default, { loose: false }],
      require('@babel/plugin-proposal-json-strings').default,

      // other

      // Experimental macros support. Will be documented after it's had some time
      // in the wild.
      require('babel-plugin-macros'),
      // Necessary to include regardless of the environment because
      // in practice some other transforms (such as object-rest-spread)
      require('@babel/plugin-transform-destructuring').default,
      // The following two plugins use Object.assign directly, instead of Babel's
      // extends helper. Note that this assumes `Object.assign` is available.
      // { ...todo, completed: true }
      [
        require('@babel/plugin-proposal-object-rest-spread').default,
        {
          useBuiltIns: true,
        },
      ],
      isEnvProduction && [
        // Remove PropTypes from production build
        require('babel-plugin-transform-react-remove-prop-types').default,
        {
          removeImport: true,
        },
      ],

      // Transform dynamic import to require
      isEnvTest && require('babel-plugin-dynamic-import-node'),
    ].filter(Boolean),
  };
};
