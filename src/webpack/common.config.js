const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { WebPlugin } = require('web-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { DEV } = require('../const');

const { resolve } = require;
const { env } = process;

function configureCssLoader({ sourceMap, publicPath }) {
  const loaders = [
    {
      loader: resolve('css-loader'),
      options: {
        importLoaders: 2,
        sourceMap,
      },
    },
    {
      loader: resolve('postcss-loader'),
      options: {
        sourceMap,
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
      options: {
        publicPath,
        sourceMap,
      },
    });
  }
  return {
    test: /\.(scss|css)$/,
    use: loaders,
  };
}
// Configure Manifest
const configureManifest = (fileName, { distDir }) => {
  return {
    fileName,
    basePath: distDir,
    map: file => {
      file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
      return file;
    },
  };
};
const configureEntries = options => {
  const { mode } = options;

  const entry = {};
  if (mode === 'single') {
    entry.index = './src/index';
  }
  return entry;
};
const configureBabelLoader = options => {
  const { projectDir } = options;

  return {
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
            // 优化lodash导入
            'babel-plugin-lodash',

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
  };
};

module.exports = options => {
  const { projectDir, mode } = options;

  const config = {
    entry: configureEntries(options),
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
        configureBabelLoader(options),
        configureCssLoader(options),
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
    plugins: [new ManifestPlugin(configureManifest('manifest-legacy.json', options))],
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
