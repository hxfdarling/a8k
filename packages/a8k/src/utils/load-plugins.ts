import resolveFrom from 'resolve-from';

function requireFrom(dir: string, filePath: string): string {
  try {
    return require(filePath);
  } catch (e) {
    return require(resolveFrom(dir, filePath));
  }
}

export default (plugins: any[], cwd: string) => {
  return plugins
    .map((plugin: string | [string, any[]]) => {
      if (!Array.isArray(plugin)) {
        plugin = [plugin, []];
      }
      if (plugin && plugin[0]) {
        return [
          typeof plugin[0] === 'string' ? requireFrom(cwd, plugin[0]) : plugin[0],
          plugin[1],
          plugin[0],
        ];
      }
      throw new TypeError(`Invalid plugin: ${plugin}`);
    })
    .map((plugin: any) => {
      if (plugin[0].default) {
        plugin[0] = plugin[0].default;
      }
      return plugin;
    });
};
