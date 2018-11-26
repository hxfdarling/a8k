const fs = require('fs-extra');
const path = require('path');
const { warn } = require('../../../utils/logger');

function deleteLoading(str) {
  const s = str.substring(str.indexOf('<!--CLIENT_ONLY_START-->'), str.lastIndexOf('<!--CLIENT_ONLY_END-->'));
  return str.replace(s, '');
}

class SSRPlugin {
  constructor(options) {
    this.options = Object.assign({}, options);
  }

  apply(compiler) {
    const { host, port, https } = this.options.devServer;
    const protocol = https ? 'https://' : 'http://';
    const isAnyHost = host === '0.0.0.0';
    const reallyHost = isAnyHost ? 'localhost' : host;
    const baseUrl = `//${reallyHost}:${port}`;
    const code = `<head>
<base href="${baseUrl}"/>
<script>
window.__devServer__={
  protocol: "${protocol.replace('://', '')}",
  hostname: "${reallyHost}",
  port: ${port},
}
</script>
`;
    compiler.hooks.done.tap('xxxxx', async () => {
      const { outputFileSystem } = compiler;
      const {
        ssrConfig: { entry, view },
        dist,
      } = this.options;
      Object.keys(entry).forEach(key => {
        const pageName = entry[key].split('/');
        const file = `${pageName[pageName.length - 2]}.html`;
        const srcFile = path.join(dist, file);
        const targetFile = path.join(view, file);
        if (outputFileSystem.existsSync(srcFile)) {
          let data = deleteLoading(outputFileSystem.readFileSync(srcFile).toString());
          data = data.replace(/<head>/, code);
          fs.writeFileSync(targetFile, data);
        } else {
          console.log();
          warn(`ssr entry "${key}" not found html file!`);
        }
      });
    });
  }
}

module.exports = SSRPlugin;
