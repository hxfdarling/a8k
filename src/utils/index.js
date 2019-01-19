function toCamelCase(str) {
  return str.replace(/(_)(\w)/g, (match, p1, p2) => {
    return p2.toUpperCase();
  });
}

function toCamelessCase(str) {
  return str.replace(/([A-Z])/g, (match, p1) => {
    return `_${p1.toLowerCase()}`;
  });
}

module.exports = {
  toCamelCase,
  toCamelessCase,
};
