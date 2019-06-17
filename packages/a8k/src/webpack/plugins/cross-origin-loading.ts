import HtmlWebpackPlugin from 'html-webpack-plugin';

class CrossOriginLoading {
  public apply(compiler) {
    compiler.hooks.compilation.tap('CrossOriginLoading', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
        'CrossOriginLoading',
        (data, next) => {
          if (data.assetTags.scripts) {
            data.assetTags.scripts.forEach((item) => {
              item.attributes.crossOrigin = 'anonymous';
            });
          }
          next(null, data);
        },
      );
    });
  }
}

module.exports = CrossOriginLoading;
