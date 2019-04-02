const parse5 = require('parse5');

const { isStyle, isHtml, isScript, isOtherFile } = require('./helpers');

module.exports = function parse(html) {
  const root = parse5.parse(html);
  const list = [];
  function reducer(node) {
    if (isHtml(node) || isStyle(node) || isScript(node) || isOtherFile(node)) {
      list.push(node);
    }
    if (node.childNodes) {
      node.childNodes.forEach(reducer);
    }
  }
  reducer(root);
  return { list, root };
};
