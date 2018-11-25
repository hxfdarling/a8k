const fs = require('fs-extra');
const path = require('path');
const { warn } = require('../../utils/logger');

function deleteLoading(str) {
  const s = str.substring(str.indexOf('<!--CLIENT_ONLY_START-->'), str.lastIndexOf('<!--CLIENT_ONLY_END-->'));
  return str.replace(s, '');
}
class SSR {
  apply(imt) {
    imt.hooks.afterSSRBuild.tapAsync('ssr', (context, callback) => {
      const {
        ssrConfig: { entry, view },
        dist,
      } = context.options;

      Object.keys(entry).forEach(key => {
        const pageName = entry[key].split('/');
        const file = `${pageName[pageName.length - 2]}.html`;
        const srcFile = path.join(dist, file);
        const targetFile = path.join(view, file);
        if (fs.existsSync(srcFile)) {
          const data = deleteLoading(fs.readFileSync(srcFile).toString());
          fs.writeFileSync(targetFile, data);
        } else {
          console.log();
          warn(`ssr entry "${key}" not found html file!`);
        }
      });
      callback();
    });
  }
}
module.exports = SSR;
