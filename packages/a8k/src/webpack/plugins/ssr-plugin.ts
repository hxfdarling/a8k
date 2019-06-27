import { logger } from '@a8k/common';
import fs from 'fs-extra';
import path from 'path';
import webpack from 'webpack';

class SSRPlugin {
  public options: {
    pagesDir: string;
    ssrConfig: { entry: { [key: string]: string }; view: string };
  };
  constructor(options: any) {
    this.options = options;
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.afterEmit.tap('ssr', async compilation => {
      const { assets } = compilation;

      const {
        ssrConfig: { entry, view },
        pagesDir,
      } = this.options;

      let list = [];
      if (entry) {
        list = Object.keys(entry).map((key: string) => {
          const pageName = entry[key].split('/');
          const file = `${pageName[pageName.length - 2]}.html`;
          return file;
        });
      } else {
        list = (await fs.readdir(pagesDir))
          .map((file: string) => path.basename(file))
          .map((name: string) => {
            const file = `/${name}.html`;
            return file;
          });
      }
      const map = list.reduce((p: any, file: string) => {
        const targetFile = path.join(view, file);
        logger.debug(`ssr-plugin: generate ssr html "${targetFile}" from "${file}"`);
        p[file.replace('/', '')] = targetFile;
        return p;
      }, {});

      for (const assetPath of Object.keys(assets)) {
        let targetFile = assetPath;

        const queryStringIdx = targetFile.indexOf('?');

        if (queryStringIdx >= 0) {
          targetFile = targetFile.substr(0, queryStringIdx);
        }
        if (map[targetFile]) {
          const asset = assets[assetPath];
          let content = asset.source();
          if (!Buffer.isBuffer(content)) {
            content = Buffer.from(content, 'utf8');
          }
          try {
            fs.writeFileSync(map[targetFile], content, 'utf-8');
          } catch (e) {
            logger.error(`Unable to write asset to disk:\n${e}`);
          }
        }
      }
    });
  }
}

module.exports = SSRPlugin;
