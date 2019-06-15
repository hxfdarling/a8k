import logger from '@a8k/cli-utils/logger';
import fs from 'fs-extra';
import path from 'path';
import webpack from 'webpack';
import { BUILD_ENV } from '../../const';
import { deleteLoading } from '../../utils/ssr';

class SSRPlugin {
  options: {
    mode: BUILD_ENV;
    pagesDir: string;
    ssrConfig: { entry: { [key: string]: string }; view: string };
    dist: string;
  };
  constructor(options: any) {
    this.options = options;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.afterEmit.tap('ssr', async () => {
      const { inputFileSystem } = compiler;
      const {
        ssrConfig: { entry, view },
        pagesDir,
        dist,
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
      list.forEach((file: string) => {
        const srcFile = path.join(dist, file);
        const targetFile = path.join(view, file);
        logger.debug(`ssr-plugin: generate ssr html "${targetFile}" from "${srcFile}"`);
        let exists = false;
        try {
          inputFileSystem.statSync(srcFile);
          exists = true;
        } catch (e) {}
        if (exists) {
          const data = deleteLoading(inputFileSystem.readFileSync(srcFile).toString());
          fs.writeFileSync(targetFile, data);
        } else {
          console.log();
          logger.warn(`ssr-plugin: ssr entry "${file}" not found!`);
        }
      });
    });
  }
}

module.exports = SSRPlugin;
