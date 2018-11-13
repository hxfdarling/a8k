const Parser = require('fastparse');
const { LINK, SCRIPT } = require('./const');

module.exports = function parse(html) {
  const results = [];
  let currentTag = {};
  let tagStartEnd = 0;
  const pushTag = () => {
    results.push(currentTag);
    currentTag = {};
    tagStartEnd = 0;
  };
  const processMatch = function(match, name, tag, value, index) {
    (currentTag.attrs = currentTag.attrs || []).push({
      start: index + name.length,
      length: value.length,
      name: name.substr(0, name.indexOf('=')),
      value,
    });
  };
  const parser = new Parser({
    outside: {
      '<!--.*?-->': true,
      '<![CDATA[.*?]]>': true,
      '<[!\\?].*?>': true,
      '</([^>]+)>': (match, tag, index) => {
        if (tag !== currentTag.name) {
          currentTag.end = tagStartEnd;
        } else {
          currentTag.end = index + match.length;
        }
        pushTag();
        return 'outside';
      },
      '<([a-zA-Z\\-:]+)\\s*': function(match, tagName, index) {
        if (tagStartEnd) {
          currentTag.end = tagStartEnd;
          pushTag();
        }
        currentTag.name = tagName;
        currentTag.start = index;
        return 'inside';
      },
    },
    inside: {
      '\\s+': true, // eat up whitespace
      '>': (match, index) => {
        tagStartEnd = index + match.length;
        return 'outside';
      },
      // end of attributes
      '(([0-9a-zA-Z\\-:]+)\\s*=\\s*")([^"]*)"': processMatch,
      "(([0-9a-zA-Z\\-:]+)\\s*=\\s*')([^']*)'": processMatch,
      '(([0-9a-zA-Z\\-:]+)\\s*=\\s*)([^\\s>]+)': processMatch,
    },
  });
  parser.parse('outside', html);
  return results.filter(({ name, attrs = [] }) => {
    switch (name) {
      case SCRIPT:
        if (attrs.find(i => i.name === 'src' && i.value)) {
          return true;
        }
        break;
      case LINK:
        // css
        if (attrs.find(i => i.name === 'rel' && i.value === 'stylesheet')) {
          return true;
        }
        break;
      default:
    }
    return false;
  });
};
