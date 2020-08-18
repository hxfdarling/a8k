const parse5 = require('parse5');
const fs = require('fs-extra');
const path = require('path');

const { getParams, getLink } = require('./helpers');
const rules = require('./rules');

function getFilepath(filename, options) {
  const { baseDir, rootDir } = options;
  let filepath = path.join(baseDir, filename);
  if (!fs.existsSync(filepath)) {
    // 绝对路径支持~
    const absoluteFile = path.join(rootDir, filename.replace(/^~/, ''));
    if (fs.existsSync(absoluteFile)) {
      filepath = absoluteFile;
    } else {
      throw new Error(`not found file: ${filename} \n in ${baseDir} or ${rootDir}`);
    }
  }
  return filepath;
}

function hasSource(node) {
  const link = getLink(node);
  // 没有资源
  if (
    !link ||
    !link.value ||
    // url资源不处理
    /^(\/\/|https?:|data:;base64)/.test(link.value)
  ) {
    return false;
  }
  return true;
}
const cwd = process.cwd();
module.exports = async (content, options, { emitFile }) => {
  options = {
    publicPath: '/',
    baseDir: cwd,
    rootDir: cwd,
    ...options,
  };
  const { publicPath } = options;

  const root = parse5.parse(content);

  function genPublicPath(url) {
    return [publicPath.replace(/\/$/, ''), url].join(publicPath ? '/' : '');
  }

  async function reducer(node) {
    if (node.childNodes) {
      // 深度优先
      await Promise.all(node.childNodes.map(reducer));
    }

    if (!hasSource(node)) {
      return;
    }

    const params = getParams(node);
    // 只有生产模式需要
    if (!params.needInclude) {
      const { childNodes } = node.parentNode;
      childNodes.splice(childNodes.indexOf(node), 1);
      return;
    }
    const rule = rules.find(item => Boolean(item.test(node, options)));
    if (rule) {
      const filepath = getFilepath(params.filename, options);
      const isMiniFile = /\.min\.(js|css)$/.test(filepath);
      const buffer = await fs.readFile(filepath);
      await rule.loader(node, {
        options,
        params,
        filepath,
        isMiniFile,
        buffer,
        emitFile,
        genPublicPath,
      });
    }
  }
  await reducer(root);
  return parse5.serialize(root);
};
