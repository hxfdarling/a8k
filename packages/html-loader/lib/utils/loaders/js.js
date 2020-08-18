const loaderUtils = require('loader-utils');
const { isLink } = require('../helpers');

const varName = '__JS_RETRY__';
const babel = require('../babel');
const cache = require('../cache');

module.exports = async (node, { options, params, filepath, isMiniFile, buffer, emitFile, genPublicPath }) => {
  const { inline, noParse } = params;
  const loaderContext = { resourcePath: filepath };
  let result = buffer.toString();
  if (!noParse && !isMiniFile) {
    if (options.cacheDirectory) {
      result = await cache({
        cacheDirectory: options.cacheDirectory,
        options,
        source: result,
        // eslint-disable-next-line no-shadow
        transform: (source, options) => {
          return babel(filepath, source, options);
        },
      });
    } else {
      result = await babel(filepath, result, options);
    }
  }
  if (inline) {
    node.attrs = [];
    node.childNodes = [{ nodeName: '#text', value: result, parentNode: node }];
  } else {
    // 添加主域重试需要标记
    const url = loaderUtils.interpolateName(loaderContext, options.filenames.js, {
      content: result,
    });
    result = `var ${varName}=${varName}||{};\n${varName}["${url}"]=true;${result}`;
    emitFile(url, result);
    node.attrs = node.attrs.map(i => {
      if (isLink(i)) {
        i.value = genPublicPath(url);
      }
      return i;
    });
  }
};
