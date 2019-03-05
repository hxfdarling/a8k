const HtmlWebpackPlugin = require('html-webpack-plugin');

class MarkTimePlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const { code = 'var T=window.T||{};T.mainEnd=Date.now();' } = this.options;
    compiler.hooks.compilation.tap('MarkTimePlugin', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('MarkTimePlugin', (data, next) => {
        if (data.assetTags.scripts) {
          data.assetTags.scripts.push({
            tagName: 'script',
            voidTag: false,
            attributes: {},
            innerHTML: code,
          });
        }
        next(null, data);
      });
    });
  }
}

module.exports = MarkTimePlugin;
