import logger from '@a8k/cli-utils/logger';
import fs from 'fs-extra';
import path from 'path';
import { deleteLoading } from '../../utils/ssr';
import { BUILD_ENV } from '../../const';

class SSRPlugin {
  options: {
    mode: BUILD_ENV;
    ssrConfig: { entry: any; view: string };
    dist: string;
  };

  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('ssr', async () => {
      let { outputFileSystem } = compiler;
      const {
        ssrConfig: { entry, view },
        dist,
      } = this.options;

      if (this.options.mode === BUILD_ENV.PRODUCTION) {
        // 在非dev模式下outputFileSystem不可用
        outputFileSystem = fs;
        logger.debug('use os fileSystem');
      } else {
        logger.debug('use os compiler.outputFileSystem');
      }

      fs.ensureDirSync(view);
      Object.keys(entry).forEach(key => {
        const pageName = entry[key].split('/');
        const file = `${pageName[pageName.length - 2]}.html`;
        const srcFile = path.join(dist, file);
        const targetFile = path.join(view, file);
        logger.debug(`ssr-plugin: generate ssr html "${targetFile}" from "${srcFile}"`);
        if (outputFileSystem.existsSync(srcFile)) {
          const data = deleteLoading(outputFileSystem.readFileSync(srcFile).toString());
          fs.writeFileSync(targetFile, data);
        } else {
          console.log();
          logger.warn(`ssr-plugin: ssr entry "${key}" not found html file!`);
        }
      });
    });
  }
}

module.exports = SSRPlugin;
