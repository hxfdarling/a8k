const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { WebPlugin } = require('web-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { resolve } = require;
module.exports = ({ projectDir, env, imtConfig: { mode }, imtrc: { cdn } }) => {
  console.log(__dirname);
  const isDev = env === 'development';
  const entry = {
    vendor: './src/assets/vendor',
  };

  if (mode === 'single') {
    entry.index = './src/index';
  }
  function getCssLoader() {
    const scssUse = [
      resolve('css-loader'),
      {
        loader: resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [],
        },
      },
    ];
    if (isDev) {
      scssUse.unshift(resolve('style-loader'));
    } else {
      scssUse.unshift({
        loader: MiniCssExtractPlugin.loader,
        options: { publicPath: cdn },
      });
    }
    return scssUse;
  }
  const config = {
    entry,
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

                presets: [
                  resolve('babel-preset-es2015'),
                  resolve('babel-preset-stage-2'),
                  resolve('babel-preset-react'),
                ],
                plugins: [
                  resolve('babel-plugin-transform-runtime'),
                  resolve('babel-plugin-add-module-exports'),
                  resolve('babel-plugin-transform-decorators-legacy'),
                  resolve('babel-plugin-transform-class-properties'),
                  // resolve('react-hot-loader/babel'),
                ],
              },
            },
          ],
          // 只命中 src 目录里的jsx?文件，加快webpack搜索速度
          include: [path.resolve(projectDir, 'src'), path.resolve(projectDir, 'node_modules/@tencent')],
        },
        {
          test: /\.scss$/,
          use: getCssLoader().concat(resolve('sass-loader')),
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
    plugins: [],
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
