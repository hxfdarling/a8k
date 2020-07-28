const { LINK, SCRIPT, META } = require('../const');

const linkKeys = ['src', 'href', 'content'];
const isLink = attr => linkKeys.find(i => i === attr.name);
const getLink = node => node.attrs.find(isLink);

// <meta itemprop="image" content="./assets/image.png" />
// 自定义name <meta name="y" content="./assets/image.png" />
function isImage(
  node,
  imageAttrs = [
    {
      name: 'itemprop',
      value: 'image',
    },
  ]
) {
  return Boolean(
    node.nodeName === META &&
      node.attrs.find(({ name, value }) => {
        value = value.trim();
        return imageAttrs.some(item => item.name === name && item.value === value);
      })
  );
}
function isIcon(node) {
  return Boolean(
    node.nodeName === LINK &&
      node.attrs.find(({ name, value }) => {
        value = value.trim();
        return name === 'rel' && (value === 'shortcut icon' || value === 'icon');
      })
  );
}

const isStyle = ({ nodeName, attrs }) => {
  return Boolean(
    nodeName === LINK &&
      attrs.find(({ name, value }) => {
        value = value.trim();
        return name === 'rel' && value === 'stylesheet';
      })
  );
};
const isHtml = ({ nodeName, attrs }) => {
  return Boolean(
    nodeName === LINK &&
      attrs.find(({ name, value }) => {
        value = value.trim();
        return name === 'rel' && value === 'html';
      })
  );
};
const isScript = node => {
  return Boolean(node.nodeName === SCRIPT && getLink(node));
};

function isOtherFile(node, imageAttrs) {
  return Boolean((isImage(node, imageAttrs) || isIcon(node)) && getLink(node));
}
module.exports = { isOtherFile, getLink, isLink, isStyle, isHtml, isScript };
