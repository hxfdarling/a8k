const fs = require('fs-extra');
const pth = require('path');
const archiver = require('archiver');

interface OfflinePackOptions {
  // 黑名单，哪些业务模块资源需要进行屏蔽（模块名列表）
  blackList?: string[];
  // console log出相关信息,
  debug?: boolean;
  // 白名单, 哪些assets进行保护，保证不会进行删除
  whiteAssetsList?: string[];
  // temp folder name
  tempFolderName?: string;
}

class OfflinePackPlugin {
  options: OfflinePackOptions;
  assetsMetadata: {};

  constructor(options: OfflinePackOptions) {
    this.options = options || {};
    this.assetsMetadata = {};
    this.options.tempFolderName = this.options.tempFolderName || 'pack';
  }

  apply(compiler) {
    const done = (stats, callback) => {
      callback = callback || (() => {});
      // { excludeModules: /node_modules/, excludeAssets: /node_modules/ }
      stats = stats.toJson(null);
      const { outputPath } = stats;

      // 所有资产清点
      stats.assets.map(asset => {
        this.assetsMetadata[asset.name] = 0;
        // .html .json .map 不会在扫描列表中，所以先给定值，不予删除
        if (/\.(html|json|map)$/.test(asset.name)) {
          this.assetsMetadata[asset.name] = 1;
        }

        // h5中有一些bodymovin_eb8cc1.js, qqapi_07c66c.js, zepto_222130.js
        // 不予删除
        if (/[\w]+\_[0-9a-z]{6}\.js$/.test(asset.name)) {
          this.assetsMetadata[asset.name] = 1;
        }

        // .woff(2) .eot .ttf字体忽略，不予删除
        if (/\.(woff|woff2|eot|ttf)$/.test(asset.name)) {
          this.assetsMetadata[asset.name] = 1;
        }

        // pc中.swf, sw.js不予删除
        if (/\.swf$/.test(asset.name) || /^sw\.js$/.test(asset.name)) {
          this.assetsMetadata[asset.name] = 1;
        }

        // 白名单
        if (this.options.whiteAssetsList) {
          if (this.options.whiteAssetsList.indexOf(asset.name) >= 0) {
            this.assetsMetadata[asset.name] = 1;
          }
        }
      });

      // scanning
      stats.chunks.map(chunk => {
        // bm: .js .css
        // [ 'assets/css/star_articles_d99c5ede.css', 'assets/js/star_articles_4a306256.js' ]
        chunk.files.map(file => {
          this.assetsMetadata[file]++;
        });
        // assets
        chunk.modules.map(module => {
          module.assets.map(assetName => {
            this.assetsMetadata[assetName]++;
          });
        });
      });

      // 剔除不需要的: 黑名单
      const blackList = this.options.blackList;
      blackList.map(blackItem => {
        // .html
        this.assetsMetadata[`${blackItem}.html`]--;
        const REG_CSS = new RegExp(`(${blackItem})\_[0-9a-z]{8}\.css$`);
        const REG_JS = new RegExp(`(${blackItem})\_[0-9a-z]{8}\.js$`);

        stats.chunks.map(chunk => {
          let matched = false;
          // chunk: .css .js
          chunk.files.map(file => {
            if (REG_CSS.test(file) || REG_JS.test(file)) {
              this.assetsMetadata[file]--;
              matched = true;
            }
          });
          if (matched) {
            // assets
            chunk.modules.map(module => {
              module.assets.map(assetName => {
                this.assetsMetadata[assetName]--;
              });
            });
          }
        });
      });

      // copy whole offline package
      const src = pth.resolve(__dirname, outputPath);
      const dest = pth.resolve(__dirname, outputPath, `../${this.options.tempFolderName}`);
      fs.ensureDirSync(dest);
      fs.copySync(src, dest);

      if (this.options.debug) console.log('[offline-pack-plugin]Options:', this.options);
      for (const key in this.assetsMetadata) {
        const assetPath = pth.resolve(dest, key);
        if (!fs.existsSync(assetPath)) continue;
        if (!this.assetsMetadata[key]) {
          // The business module has no assets references now
          delete this.assetsMetadata[key];
          // unlink
          fs.removeSync(assetPath);
          if (this.options.debug) console.log('[offline-pack-plugin]Remove:', assetPath.red);
        } else {
          // update content: some CDN links should be updated
          updateContentIfNeeded(assetPath, this.options.debug);
        }
      }

      // zip the fudao.qq.com
      makeZipWithDir(dest, this.options.tempFolderName).then(resolve => {
        fs.removeSync(dest);
        callback();
      });
    };

    // Compatibility way inject the callback for webpack
    if (compiler.hooks) {
      compiler.hooks.done.tapAsync('offline-pack-plugin', done);
    } else {
      compiler.plugin('done', done);
    }
  }
}

// Code borrowed from `h5/scripts/offpack/index.js`
const updateContentIfNeeded = (file, debug) => {
  if (/\.(js|css)$/.test(file)) {
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file)
        .toString()
        .replace(/[7-9]\.url\.cn\/fudao/g, 'fudao.qq.com')
    );
    if (debug) console.log('[offline-pack-plugin]Update:', file.green);
  } else if (/\.html$/.test(file)) {
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file)
        .toString()
        .replace(/[7-9]\.url\.cn\/fudao/g, 'fudao.qq.com')
        .replace(
          /<\/head>/,
          '<script>window.isPack=true;window.packVersion="' +
            formatDate('YYYYMMDDhhssmm', new Date()) +
            '";</script>$&'
        )
    );
    if (debug) console.log('[offline-pack-plugin]Update:', file.green);
  } else if (/\.(png|ico|gif|jpg|jpeg)$/.test(file)) {
    // 大小小于15000
    if (
      fs.statSync(file).size > 15000 &&
      // FIXME: 这里这样有点不太好，需要进行fix
      !/(champion|emptyScore)/.test(file) &&
      // FIXME: 精灵图
      !/\w*_sprite_\w*\.(png|ico|gif)$/.test(file)
    ) {
      fs.removeSync(file);
      if (debug) console.log('[offline-pack-plugin]Remove[*]:', file.red);
    } else {
      // ignore: 什么也不干，这样会打包进zip
      if (debug) console.log('[offline-pack-plugin]Keep  :', file);
    }
  }
};

const makeZipWithDir = (dir, zipName) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(pth.resolve(dir, `../${zipName}.zip`));
    let archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    output.on('close', function() {
      console.log(
        '[offline-pack-plugin]      :',
        'Zip total size:   ' + archive.pointer() + ' bytes'
      );
      resolve();
    });
    archive.on('error', function(err) {
      reject(err);
    });

    archive.directory(dir, false);

    archive.pipe(output);
    archive.finalize();
  });
};

const formatDate = (pattern, date) => {
  var formatNumber;
  if (typeof date === 'number') {
    date = new Date(date);
  }
  formatNumber = function(data, format) {
    format = format.length;
    data = data || 0;
    if (format === 1) {
      return data;
    } else {
      return String(Math.pow(10, format) + data).slice(-format);
    }
  };
  return pattern.replace(/([YMDhsm])\1*/g, function(format) {
    switch (format.charAt()) {
      case 'Y':
        return formatNumber(date.getFullYear(), format);
      case 'M':
        return formatNumber(date.getMonth() + 1, format);
      case 'D':
        return formatNumber(date.getDate(), format);
      case 'w':
        return date.getDay() + 1;
      case 'h':
        return formatNumber(date.getHours(), format);
      case 'm':
        return formatNumber(date.getMinutes(), format);
      case 's':
        return formatNumber(date.getSeconds(), format);
      default:
        return '';
    }
  });
};

module.exports = OfflinePackPlugin;
