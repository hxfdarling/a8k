const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { WebPlugin } = require('web-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const WebpackBar = require('webpackbar');
const fs = require('fs-extra');

const ReportStatusPlugin = require('./plugins/report-status-plugin');

const { DEV, PROD } = require('../const');

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
    loaders.unshift({
      loader: resolve('style-loader'),
      options: {
        sourceMap,
      },
    });
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
const pages = './src/pages';
const getPages = options => {
  const { projectDir, ignorePages = [] } = options;
  const pagesDir = path.join(projectDir, pages);
  return fs.readdirSync(pagesDir).filter(item => {
    if (ignorePages.includes(item)) {
      return false;
    }
    let filepath = path.join(pagesDir, item, 'index.js');

    if (!fs.existsSync(filepath)) {
      filepath = `${filepath}x`; // jsx
    }
    if (!fs.existsSync(filepath)) {
      return false;
    }
    return true;
  });
};
const configureEntries = options => {
  const { mode = [] } = options;

  const entry = {};
  if (mode === 'single') {
    entry.index = './src/index';
  } else {
    getPages(options).forEach(file => {
      const name = path.basename(file);
      entry[name] = `${pages}/${file}/index`;
    });
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
          cacheDirectory: path.resolve(options.cacheDir, 'babel-loader'),
          presets: [require('babel-preset-imt')],
        },
      },
    ],
    // 只命中 src 目录里的jsx?文件，加快webpack搜索速度
    include: [path.resolve(projectDir, 'src'), path.resolve(projectDir, 'node_modules/@tencent')],
  };
};
const configureHtmlLoader = options => {
  return {
    test: /\.(html|njk|nunjucks)$/,
    use: [
      {
        loader: resolve('html-loader'),
        options: {
          minimize: options.mini && env.NODE_ENV === PROD,
        },
      },
      // 自动处理html中的相对路径引用 css/js文件
      resolve('html-inline-assets-loader'),
      {
        loader: resolve('nunjucks-html-loader'),
        options: {
          // Other super important. This will be the base
          // directory in which webpack is going to find
          // the layout and any other file index.njk is calling.
          searchPaths: ['./src'],
        },
      },
    ],
  };
};
module.exports = options => {
  const { projectDir, mode } = options;

  const config = {
    entry: configureEntries(options),
    output: {
      crossOriginLoading: 'anonymous',
    },
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
        configureHtmlLoader(options),
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
    plugins: [
      new WebpackBar({
        profile: options.analyzer,
      }),
      new ReportStatusPlugin({
        mode: env.NODE_ENV,
        showFileStats: true,
        devServer: options.devServer,
      }),
      new ManifestPlugin(configureManifest('manifest-legacy.json', options)),
    ],
  };

  if (mode === 'single') {
    config.plugins.push(
      new HtmlWebpackPlugin({
        // https://github.com/jantimon/html-webpack-plugin/issues/870
        // html-webpack-plugin@next or chunksSortMode: 'none',
        filename: 'index.html',
        template: './src/index.html',
      })
    );
  }
  if (mode === 'multi') {
    getPages(options).forEach(file => {
      const name = path.basename(file);
      file = `${pages}/${file}/index.html`;
      console.log('TCL: file', file);
      config.plugins.push(
        new HtmlWebpackPlugin({
          filename: `${name}.html`,
          template: file,
        })
      );
    });
  }

  config.plugins.push(
    // 支持js资源完整性校验
    // https://www.w3.org/TR/SRI/
    new SriPlugin({
      hashFuncNames: ['sha256', 'sha384'],
      enabled: env.NODE_ENV === PROD,
    })
  );

  return config;
};
