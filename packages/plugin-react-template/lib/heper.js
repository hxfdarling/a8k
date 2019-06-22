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
    ['common/componentTemplate/index.js.tpl', `${dist}/${name}/index.js`],
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
  [['multi/pageTemplate', `src/pages/${name}`]].forEach(([src, dest]) => {
    src = toArray(src);
    dest = toArray(dest);
    context.fs.copyTpl(context.templatePath(...src), context.destinationPath(...dest), {
      name,
      className: `x-page-${name.toLowerCase()}`,
    });
  });
};

const createSingleExamplePage = (context, name) => {
  [['single/pageTemplate', `src/pages/${name}`]].forEach(([src, dest]) => {
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
