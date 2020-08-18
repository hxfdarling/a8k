const loaderUtils = require('loader-utils');
const { isLink } = require('../helpers');

module.exports = (node, { options, params, filepath, buffer, emitFile, genPublicPath }) => {
  const { inline } = params;
  const loaderContext = { resourcePath: filepath };
  const result = buffer.toString();
  if (inline) {
    node.nodeName = 'style';
    node.tagName = 'style';
    node.attrs = [{ name: 'type', value: 'text/css' }];
    node.childNodes = [{ nodeName: '#text', value: result, parentNode: node }];
  } else {
    const url = loaderUtils.interpolateName(loaderContext, options.filenames.css, {
      content: result,
    });

    emitFile(url, result);
    node.attrs = node.attrs.map(i => {
      if (isLink(i)) {
        i.value = genPublicPath(url);
      }
      return i;
    });
  }
};
