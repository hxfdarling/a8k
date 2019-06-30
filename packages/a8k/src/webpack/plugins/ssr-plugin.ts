import { logger } from '@a8k/common';
import fs from 'fs-extra';
import path from 'path';
import webpack from 'webpack';
import { A8kConfig } from '../../interface';
import { IEntry } from '../../utils/entry';

class SSRPlugin {
  public options: {
    entry: IEntry[];
    ssrConfig: A8kConfig['ssrConfig'];
  };
  constructor(options: any) {
    this.options = options;
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.afterEmit.tap('ssr', async (compilation: any) => {
      const { assets } = compilation;
      if (!this.options.ssrConfig) {
        return;
      }
      const {
        ssrConfig: { entry: customEntry, viewPath },
        entry,
      } = this.options;

      fs.ensureDirSync(viewPath);

      const entryMap = entry
        .map(({ name }: IEntry) => {
          return {
            name,
            fileName: `${name}.html`,
          };
        })
        .filter(({ name }) => {
          if (customEntry === true || !customEntry) {
            return true;
          }
          if (customEntry.indexOf(name)) {
            return true;
          }
          return false;
        })
        .reduce((result: any, { fileName }) => {
          const targetFile = path.join(viewPath, fileName);
          logger.debug(`ssr-plugin: generate ssr html "${targetFile}" from "${fileName}"`);
          result[fileName] = targetFile;
          return result;
        }, {});

      for (const assetPath of Object.keys(assets)) {
        let targetFile = assetPath;

        const queryStringIdx = targetFile.indexOf('?');

        if (queryStringIdx >= 0) {
          targetFile = targetFile.substr(0, queryStringIdx);
        }
        if (entryMap[targetFile]) {
          const asset = assets[assetPath];
          let content = asset.source();
          if (!Buffer.isBuffer(content)) {
            content = Buffer.from(content, 'utf8');
          }
          try {
            fs.writeFileSync(entryMap[targetFile], content, 'utf-8');
          } catch (e) {
            logger.error(`Unable to write asset to disk:\n${e}`);
          }
        }
      }
    });
  }
}

module.exports = SSRPlugin;
