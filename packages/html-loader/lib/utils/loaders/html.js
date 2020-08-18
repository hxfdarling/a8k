const parse5 = require('parse5');

module.exports = (node, { buffer }) => {
  const result = buffer.toString();
  const htmlDom = parse5.parseFragment(result);
  const { childNodes } = node.parentNode;
  childNodes.splice(childNodes.indexOf(node), 1, ...htmlDom.childNodes);
};
