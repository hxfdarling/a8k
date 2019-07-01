import { logger } from '@a8k/common';
import fs from 'fs-extra';
import path from 'path';
import A8k from '..';

const extensions = ['.js', '.ts', '.jsx', '.tsx'];
const extensionsReg = RegExp('(' + extensions.join('|') + ')$');
const getReallyFile = (file: string) =>
  extensions
    .map((ext: string) => file + ext)
    .find((tmp: string) => {
      try {
        fs.statSync(tmp);
        return tmp;
      } catch (e) {
        //
      }
    });
const getReallyEntry = (file: string) => {
  try {
    let reallyFile = getReallyFile(file);
    if (reallyFile) {
      return reallyFile;
    }
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      reallyFile = getReallyFile(path.join(file, 'index'));
      if (reallyFile) {
        return reallyFile;
      } else {
        logger.error(
          `Not found index.{js,ts,jsx,tsx} in ${file} is directory, please check you a8k.config.js`
        );
        process.exit(-1);
      }
    } else {
      return file;
    }
  } catch (e) {
    logger.error(file + ' entry not found, please check you a8k.config.js "entry"');
    process.exit(-1);
  }
};
const getTemplate = (entry: string, context: A8k) => {
  const dirName = path.dirname(entry);
  const fileName = path.basename(entry);

  let template = path.join(dirName, fileName.replace(/\.([^.]+)$/, '.html'));
  // 如果没有配置，将使用template
  if (!fs.existsSync(template)) {
    template = context.config.template;
  }
  return template;
};

const getStandardEntry = (context: A8k) => {
  const { pagesPath, ignorePages, initEntry } = context.config;
  return fs
    .readdirSync(pagesPath)
    .filter((item: string) => !ignorePages.includes(item))
    .map((item: string) => getReallyEntry(path.join(pagesPath, item)))
    .map((file: string) => {
      let name = path.dirname(file);
      if (name === pagesPath) {
        // 如果页面没有目录，只是pagesPath下的一个文件
        name = path.basename(file).replace(path.extname(file), '');
      } else {
        // 获取当前页面的目录名称
        name = path.basename(name);
      }
      const template = getTemplate(file, context);

      const chunks = [name];
      return {
        entry: [...initEntry, file].filter(Boolean),
        chunks,
        template,
        name,
      };
    });
};
const getCustomEntry = (context: A8k) => {
  const { entry, initEntry } = context.config;
  return Object.keys(entry).map((name: string) => {
    let file = entry[name];
    if (!Array.isArray(file)) {
      file = [file];
    }
    file = file
      .map((i: (context: A8k) => string | string) => (typeof i === 'function' ? i(context) : i))
      .map((i: string) => context.resolve(i))
      .map(getReallyEntry);
    const chunks = [name];
    // 使用最有一个文件作为入口文件
    const template = getTemplate(file[file.length - 1], context);
    return {
      entry: [...initEntry, ...file],
      chunks,
      template,
      name,
    };
  });
};

export const getEntry = (context: A8k): IEntry[] => {
  const { entry } = context.config;
  const isCustomEntry = entry && Object.keys(entry).length >= 0;
  return (!isCustomEntry ? getStandardEntry(context) : getCustomEntry(context)).map(item => {
    item.entry = item.entry.map((i: string) => {
      // 清理entry后面的扩展名
      return i.replace(extensionsReg, '');
    });
    return item;
  });
};

export interface IEntry {
  name: string;
  template: string;
  chunks: string[];
  entry: string[];
}
