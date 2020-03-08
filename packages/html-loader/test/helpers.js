const vm = require('vm');
const path = require('path');

const del = require('del');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

function evaluated(output, modules, moduleId = 1) {
  let m;
  try {
    const fn = vm.runInThisContext(
      `(function(module, exports, require) {var __webpack_public_path__ = '/webpack/public/path/';${output}})`
    );
    m = { exports: {}, id: moduleId };
    fn(m, m.exports, module => {
      if (module.indexOf('runtime/api') >= 0) {
        // eslint-disable-next-line global-require
        return require('../src/runtime/api');
      }
      if (/^-!.*?!.*$/.test(module)) {
        // eslint-disable-next-line no-param-reassign
        module = module.replace(/-!(.*)?!/, '');
      }
      return `{${module}}`;
    });
  } catch (e) {
    console.error(output); // eslint-disable-line no-console
    throw e;
  }
  delete m.exports.toString;
  delete m.exports.i;
  return m.exports;
}

const moduleConfig = config => {
  return {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: path.resolve(__dirname, '../'),
            options: (config.loader && config.loader.options) || {},
          },
        ],
      },
    ],
  };
};
const pluginsConfig = config => [].concat(config.plugins || []);
const outputConfig = config => {
  return {
    publicPath: config.publicPath || '',
    path: path.resolve(__dirname, `../outputs/${config.output ? config.output : ''}`),
    filename: '[name].bundle.js',
  };
};

function compile(fixture, config = {}, options = {}) {
  // webpack Config
  config = {
    mode: 'development',
    devtool: config.devtool || 'sourcemap',
    context: path.resolve(__dirname, 'fixtures'),
    entry: path.resolve(__dirname, 'fixtures', fixture),
    output: outputConfig(config),
    module: moduleConfig(config),
    plugins: pluginsConfig(config),
    optimization: {
      runtimeChunk: true,
    },
    resolve: {
      alias: {},
    },
  };

  // Compiler Options
  options = { output: false, ...options };

  if (options.output) {
    del.sync(config.output.path);
  }

  const compiler = webpack(config);

  if (!options.output) {
    compiler.outputFileSystem = new MemoryFS();
  }

  return new Promise((resolve, reject) =>
    compiler.run((error, stats) => {
      if (error) {
        return reject(error);
      }
      return resolve(stats);
    })
  );
}

module.exports = {
  compile,
  evaluated,
};
