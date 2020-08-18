const { LINK, SCRIPT, META, AUDIO, IMG, VIDEO } = require('./const');

const cssLoader = require('./loaders/css');
const jsLoader = require('./loaders/js');
const htmlLoader = require('./loaders/html');
const fileLoader = require('./loaders/file');

const rules = [
  // metaImage
  {
    test(
      node,
      {
        imageAttrs = [
          {
            name: 'itemprop',
            value: 'image',
          },
        ],
      }
    ) {
      return (
        node.nodeName === META &&
        node.attrs.find(({ name, value }) => {
          value = value.trim();
          return imageAttrs.some(item => item.name === name && item.value === value);
        })
      );
    },
    loader: fileLoader,
  },
  // icon
  {
    test(node) {
      return (
        node.nodeName === LINK &&
        node.attrs.find(({ name, value }) => {
          value = value.trim();
          return name === 'rel' && (value === 'shortcut icon' || value === 'icon');
        })
      );
    },
    loader: fileLoader,
  },
  // img
  {
    test(node, options) {
      return node.nodeName === IMG;
    },
    loader: fileLoader,
  },
  // audio
  {
    test(node, options) {
      return node.nodeName === AUDIO;
    },
    loader: fileLoader,
  },
  // video
  {
    test(node, options) {
      return node.nodeName === VIDEO;
    },
    loader: fileLoader,
  },
  // style
  {
    test(node, options) {
      return (
        node.nodeName === LINK &&
        node.attrs.find(({ name, value }) => {
          value = value.trim();
          return name === 'rel' && value === 'stylesheet';
        })
      );
    },
    loader: cssLoader,
  },
  // script
  {
    test(node, options) {
      return node.nodeName === SCRIPT;
    },
    loader: jsLoader,
  },
  // html
  {
    test(node, options) {
      return (
        node.nodeName === LINK &&
        node.attrs.find(({ name, value }) => {
          value = value.trim();
          return name === 'rel' && value === 'html';
        })
      );
    },
    loader: htmlLoader,
  },
];
module.exports = rules;
