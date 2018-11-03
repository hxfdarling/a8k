const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { WebPlugin } = require('web-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { DEV } = require('../const');

const { resolve } = require;
const { env } = process;

function getCssLoader() {
  const loaders = [
    resolve('css-loader'),
    {
      loader: resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        ident: 'postcss',
        plugins: () => [
          require('postcss-import'),
          require('postcss-extend'),
          require('postcss-simple-vars'),
          require('postcss-nested-ancestors'),
          require('postcss-nested'),
          require('postcss-hexrgba'),
          require('autoprefixer'),
          require('postcss-flexbugs-fixes'),

          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
        ],
      },
    },
  ];
  if (env.NODE_ENV === DEV) {
    loaders.unshift(resolve('style-loader'));
  } else {
    loaders.unshift({
      loader: MiniCssExtractPlugin.loader,
      options: { publicPath: env.IMT_ENV_PUBLIC_PATH },
    });
  }
  return loaders;
}
// Configure Manifest
const configureManifest = fileName => {
  return {
    fileName,
    basePath: env.IMT_ENV_DIST_DIR,
    map: file => {
      file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
      return file;
    },
  };
};
const configureEntries = () => {
  const mode = env.IMT_ENV_MODE;

  const entry = {};
  if (mode === 'single') {
    entry.index = './src/index';
  }
  return entry;
};

module.exports = () => {
  const projectDir = env.IMT_ENV_PROJECT_DIR;
  const mode = env.IMT_ENV_MODE;

  const config = {
    entry: configureEntries(),
    // 出错不继续编译
    bail: true,
    resolve: {
      // 加快搜索速度
      modules: [path.resolve(projectDir, 'src'), path.resolve(projectDir, 'node_modules')],
      // es tree-shaking
      mainFields: ['jsnext:main', 'browser', 'main'],
      // 加快编译速度
      alias: {},
      extensions: ['.jsx', '.js'],
    },
    module: {
      // 这些库都是不依赖其它库的库 不需要解析他们可以加快编译速度
      noParse: /node_modules\/(moment|chart\.js)/,
      rules: [
        {
          test: /\.jsx?$/,
          // cacheDirectory 缓存babel编译结果加快重新编译速度
          use: [
            {
              loader: resolve('babel-loader'),
              options: {
                babelrc: false,
                cacheDirectory: true,
                presets: [resolve('@babel/preset-env'), resolve('@babel/preset-react')],
                plugins: [
                  '@babel/plugin-transform-runtime',

                  // Stage 0
                  '@babel/plugin-proposal-function-bind',

                  // Stage 1
                  '@babel/plugin-proposal-export-default-from',
                  '@babel/plugin-proposal-logical-assignment-operators',
                  ['@babel/plugin-proposal-optional-chaining', { loose: false }],
                  ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
                  ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
                  '@babel/plugin-proposal-do-expressions',

                  // Stage 2
                  ['@babel/plugin-proposal-decorators', { legacy: true }],
                  '@babel/plugin-proposal-function-sent',
                  '@babel/plugin-proposal-export-namespace-from',
                  '@babel/plugin-proposal-numeric-separator',
                  '@babel/plugin-proposal-throw-expressions',

                  // Stage 3
                  '@babel/plugin-syntax-dynamic-import',
                  '@babel/plugin-syntax-import-meta',
                  ['@babel/plugin-proposal-class-properties', { loose: false }],
                  '@babel/plugin-proposal-json-strings',

                  // 'react-hot-loader/babel',
                ].map(item => {
                  if (Array.isArray(item)) {
                    item[0] = resolve(item[0]);
                  } else {
                    item = resolve(item);
                  }
                  return item;
                }),
              },
            },
          ],
          // 只命中 src 目录里的jsx?文件，加快webpack搜索速度
          include: [path.resolve(projectDir, 'src'), path.resolve(projectDir, 'node_modules/@tencent')],
        },
        {
          test: /\.scss$/,
          use: getCssLoader(),
          include: [path.resolve(projectDir, 'src')],
        },
        {
          test: /\.css$/,
          use: getCssLoader(),
        },
        {
          // svg 直接inline
          test: /\.svg$/,
          use: {
            loader: resolve('svg-inline-loader'),
            options: {
              classPrefix: true,
            },
          },
          include: [path.resolve(projectDir, 'src')],
        },
        {
          // 项目外svg 直接拷贝过来
          test: /.svg$/,
          use: {
            loader: resolve('file-loader'),
            options: {
              name: '[name]_[hash].[ext]',
            },
          },
          exclude: [path.resolve(projectDir, 'src')],
        },
        {
          // 其它文件直接拷贝
          test: /\.(gif|png|jpe?g|eot|woff|ttf|pdf)$/,
          use: {
            loader: resolve('file-loader'),
            options: { name: '[name]_[hash].[ext]' },
          },
        },
      ],
    },
    plugins: [new ManifestPlugin(configureManifest('manifest-legacy.json'))],
  };

  if (mode === 'single') {
    config.plugins.push(
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(projectDir, './src/index.html'),
      })
    );
  }
  return config;
};
