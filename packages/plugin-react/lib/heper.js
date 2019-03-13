const toArray = a => {
  return Array.isArray(a) ? a : [a];
};

/**
 *
 * @param {Generator} context Generator 上下文
 * @param {string} dist 目标目录：src/components,src/pages/xxx/components
 * @param {string} name 组件名称
 * @param {boolean} useConnect 是否使用connect
 */
const createExampleComponent = (context, dist, name, useConnect) => {
  [
    ['common/componentTemplate/index.jsx.tpl', `${dist}/${name}/index.jsx`],
    ['common/componentTemplate/index.scss.tpl', `${dist}/${name}/index.scss`],
  ].forEach(([src, dest]) => {
    src = context.templatePath(...toArray(src));
    dest = context.destinationPath(...toArray(dest));
    context.fs.copyTpl(src, dest, {
      name,
      className: `x-component-${name.toLowerCase()}`,
      useConnect,
    });
  });
};

const createMultiExamplePage = (context, name) => {
  [
    ['multi/pageTemplate/action_creators.js', `src/pages/${name}/action_creators.js`],
    ['multi/pageTemplate/action_types.js', `src/pages/${name}/action_types.js`],
    ['multi/pageTemplate/index.html', `src/pages/${name}/index.html`],
    ['multi/pageTemplate/index.jsx', `src/pages/${name}/index.jsx`],
    ['multi/pageTemplate/index.scss', `src/pages/${name}/index.scss`],
    ['multi/pageTemplate/Container.jsx', `src/pages/${name}/Container.jsx`],
    ['multi/pageTemplate/ProviderContainer.jsx', `src/pages/${name}/ProviderContainer.jsx`],
    ['multi/pageTemplate/reducer.js', `src/pages/${name}/reducer.js`],
    ['multi/pageTemplate/store.js', `src/pages/${name}/store.js`],
  ].forEach(([src, dest]) => {
    src = toArray(src);
    dest = toArray(dest);
    context.fs.copyTpl(context.templatePath(...src), context.destinationPath(...dest), {
      name,
      className: `x-page-${name.toLowerCase()}`,
    });
  });
};

const createSingleExamplePage = (context, name) => {
  [
    ['single/pageTemplate/action_creators.js', `src/pages/${name}/action_creators.js`],
    ['single/pageTemplate/action_types.js', `src/pages/${name}/action_types.js`],
    ['single/pageTemplate/index.jsx', `src/pages/${name}/index.jsx`],
    ['single/pageTemplate/index.scss', `src/pages/${name}/index.scss`],
    ['single/pageTemplate/reducer.js', `src/pages/${name}/reducer.js`],
  ].forEach(([src, dest]) => {
    src = toArray(src);
    dest = toArray(dest);
    context.fs.copyTpl(context.templatePath(...src), context.destinationPath(...dest), {
      name,
      className: `x-page-${name.toLowerCase()}`,
    });
  });
};

module.exports = {
  toArray,
  createExampleComponent,
  createMultiExamplePage,
  createSingleExamplePage,
};
