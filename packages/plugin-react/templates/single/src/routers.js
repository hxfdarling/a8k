import React from 'react';
import Loadable from 'react-loadable';

const menus = [{ title: 'index page', page: 'index' }];

function wrapComponent(page) {
  return Loadable({
    loader: () => import(/* webpackExclude: /components/ */
      `./pages/${page}/index.jsx`),
    loading: () => <div>loading</div>,
  });
}
const routers = [];

function node(nodes, parentTitles = []) {
  nodes.map(({ page, title, children }) => {
    if (page) {
      routers.push({
        component: wrapComponent(page),
        path: [...parentTitles, title],
        page: `/${page}`,
      });
    } else if (children) {
      node(children, [...parentTitles, title]);
    }
  });
}
node(menus);

export default routers;
export { menus };
