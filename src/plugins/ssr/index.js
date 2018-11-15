const fs = require('fs-extra');
const path = require('path');

function deleteLoading(str) {
  const s = str.substring(str.indexOf('<!--CLIENT_ONLY_START-->'), str.lastIndexOf('<!--CLIENT_ONLY_END-->'));
  return str.replace(s, '');
}
class SSR {
  apply(imt) {
    imt.hooks.afterSSRBuild.tapAsync('ssr', (context, callback) => {
      const {
        ssrConfig: { entry, viewDir },
        distDir,
      } = context.options;

      Object.keys(entry).forEach(key => {
        const pageName = entry[key].split('/');
        const file = `${pageName[pageName.length - 2]}.html`;
        const srcFile = path.join(distDir, file);
        const targetFile = path.join(viewDir, file);
        const data = deleteLoading(fs.readFileSync(srcFile).toString());
        fs.writeFileSync(targetFile, data);
      });
      callback();
    });
  }
}
module.exports = SSR;
