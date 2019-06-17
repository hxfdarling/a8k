export function deleteLoading(str) {
  const s = str.substring(
    str.indexOf('<!--CLIENT_ONLY_START-->'),
    str.lastIndexOf('<!--CLIENT_ONLY_END-->'),
  );
  return str.replace(s, '');
}
