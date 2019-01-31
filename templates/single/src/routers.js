import LoadingComponent from 'components/LoadingComponent';
import React from 'react';
import Loadable from 'react-loadable';
import { connect, Provider } from 'react-redux';
import action from './action_creator';
import store from './store';

const menus = [{ title: 'example page', page: 'example' }];
function wrapComponent(page) {
  const App = connect(
    state => state,
    action
  )(
    Loadable({
      loader: () => import(/* webpackExclude: /components/ */
        `./pages/${page}/index.jsx`),
      loading: LoadingComponent,
    })
  );
  return () => (
    <Provider store={store}>
      <App />
    </Provider>
  );
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
