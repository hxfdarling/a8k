const queryParse = require('query-parse');

const linkKeys = ['src', 'href', 'content'];
const isLink = attr => linkKeys.find(i => i === attr.name);
const getLink = node => {
  if (!node || !node.attrs) {
    return null;
  }
  return node.attrs.find(isLink);
};

function getParams(node) {
  const link = getLink(node);
  if (link) {
    const temp = link.value.split('?');
    const query = queryParse.toObject(temp[1] || '');
    Object.keys(query).forEach(key => {
      if (query[key] === '') {
        query[key] = true;
      }
    });
    const { _inline: inline, _dist: dist, _noparse: noParse } = query;
    const needInclude = !dist || (dist && process.env.NODE_ENV === 'production');
    return { inline, dist, noParse, needInclude, filename: temp[0] };
  }
  return null;
}
module.exports = { getParams, isLink, getLink };
