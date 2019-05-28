import logger from '@a8k/cli-utils/logger';
import fs from 'fs-extra';
import path from 'path';
import { deleteLoading } from '../../utils/ssr';

class SSRPlugin {
  options: { ssrConfig: { entry: any; view: string }; dist: string };

  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tap('ssr', async () => {
      const { outputFileSystem } = compiler;
      const {
        ssrConfig: { entry, view },
        dist,
      } = this.options;
      fs.ensureDirSync(view);
      Object.keys(entry).forEach(key => {
        const pageName = entry[key].split('/');
        const file = `${pageName[pageName.length - 2]}.html`;
        const srcFile = path.join(dist, file);
        const targetFile = path.join(view, file);
        if (outputFileSystem.existsSync(srcFile)) {
          logger.debug(`ssr-plugin: generate ssr html "${targetFile}" from "${srcFile}"`);
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
