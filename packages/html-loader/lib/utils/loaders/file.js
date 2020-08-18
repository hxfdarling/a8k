const loaderUtils = require('loader-utils');
const { isLink } = require('../helpers');

module.exports = (node, { options, filepath, buffer, emitFile, genPublicPath }) => {
  const loaderContext = { resourcePath: filepath };
  const url = loaderUtils.interpolateName(loaderContext, options.filenames.image, {
    content: buffer,
  });
  emitFile(url, buffer);
  node.attrs = node.attrs.map(i => {
    if (isLink(i)) {
      i.value = genPublicPath(url);
    }
    return i;
  });
};
