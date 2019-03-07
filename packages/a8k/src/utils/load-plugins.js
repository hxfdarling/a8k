import resolveFrom from 'resolve-from';

export default (plugins, cwd) => {
  return plugins
    .map(plugin => {
      if (typeof plugin === 'string') {
        plugin = {
          resolve: plugin,
        };
      }
      if (plugin && plugin.resolve) {
        return {
          ...plugin,
          resolve:
            typeof plugin.resolve === 'string'
              ? require(resolveFrom(cwd, plugin.resolve))
              : plugin.resolve,
        };
      }
      throw new TypeError(`Invalid plugin: ${plugin}`);
    })
    .map(plugin => {
      if (plugin.resolve.default) {
        plugin.resolve = plugin.resolve.default;
      }
      return plugin;
    });
};
