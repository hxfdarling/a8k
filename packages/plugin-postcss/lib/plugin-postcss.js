const logger = require('@a8k/cli-utils/logger');
const loadConfig = require('@a8k/cli-utils/load-config');
const path = require('path');

const TYPE_SERVER = 'server';
// const TYPE_CLIENT = 'client';
const ENV_PROD = 'production';

module.exports = class PluginPostcss {
  constructor(options) {
    this.name = 'plugin-postcss';
    this.options = options;
  }

  apply(context) {
    context.chainWebpack((config, { type, sourceMap, cssSourceMap, ssr }) => {
      config.resolveLoader.modules.add(path.join(__dirname, '../node_modules'));
      config.module.rules.delete('css');
      config.module.rules.delete('sass');

      if (type === TYPE_SERVER) {
        // 服务端渲染，直接忽略css
        return;
      }

      const hasPostCSSConfig = loadConfig.resolveSync({
        files: [
          'postcss.config.js',
          'package.json',
          '.postcssrc',
          '.postcssrc.js',
          '.postcssrc.yaml',
          '.postcssrc.json',
        ],
        packageKey: 'postcss',
        cwd: context.options.baseDir,
      });
      let postCssConfig = {};
      if (hasPostCSSConfig) {
        logger.debug(`Applying custom PostCSS config at ${hasPostCSSConfig}`);
      } else {
        logger.debug('Applying buildint PostCSS config');
        postCssConfig = {
          parser: require('postcss-scss'), // sass迁移postcss需要，新项目不需要
          plugins: [
            require('postcss-partial-import')({
              path: [context.resolve('src')],
            }),
            require('postcss-url'),
            require('postcss-advanced-variables'),
            require('postcss-nested'),
            require('postcss-custom-media'),
            require('postcss-custom-properties')({
              preserve: false,
            }),
            require('postcss-extend-rule'),
            require('postcss-color-function'),
            require('autoprefixer')({
              browsers: [
                'Firefox >= 20',
                'Safari >= 6',
                'Explorer >= 9',
                'Chrome >= 21',
                'Android >= 4.0',
              ],
            }),
          ].filter(Boolean),
        };
      }

      const rule = config.module
        .rule('css')
        .test(/\.(scss|css)$/)
        .use('cache-loader')
        .loader('cache-loader')
        .options({
          cacheDirectory: path.join(context.config.cache, 'cache-loader-css'),
        })
        .end()
        .use('css-loader')
        .loader('css-loader')
        .options({
          importLoaders: 1,
          sourceMap,
        })
        .end()
        .use('postcss-loader')
        .loader('postcss-loader')
        .options({
          sourceMap,
          ...postCssConfig,
        })
        .end();

      // 生产模式和服务器渲染调试时，开启这个模式防止样式抖动
      const needExtraCss = context.internals.mode === ENV_PROD || ssr;

      if (!needExtraCss) {
        rule
          .use('style-loader')
          .before('cache-loader')
          .loader('style-loader')
          .options({
            // https://github.com/webpack-contrib/style-loader/issues/107
            singleton: !cssSourceMap,
            sourceMap,
          })
          .end();
      } else {
        const MiniCssExtractPlugin = require('mini-css-extract-plugin');
        rule
          .use('MiniCssExtractPlugin.loader')
          .before('cache-loader')
          .loader(MiniCssExtractPlugin.loader)
          .options({
            publicPath: context.config.publicPath,
            sourceMap,
          })
          .end();
      }
    });
  }
};
