import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

class CrossOriginLoading {
  public apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap('CrossOriginLoading', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('CrossOriginLoading', (data: any, next: any) => {
        if (data.assetTags.scripts) {
          data.assetTags.scripts.forEach((item: any) => {
            item.attributes.crossOrigin = 'anonymous';
          });
        }
        next(null, data);
      });
    });
  }
}

module.exports = CrossOriginLoading;
