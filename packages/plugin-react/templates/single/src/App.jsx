import React from 'react';
import { hot } from 'react-hot-loader';
import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import './index.scss';
import routers, { menus } from './routers';

function App() {
  return (
    <HashRouter basename="/">
      <div className="box">
        <ul className="menu">
          {menus.map(({ page, title }) => (
            <li key={page}>
              <Link to={`/${page.toLowerCase()}`}>{title}</Link>
            </li>
          ))}
        </ul>
        <div className="content">
          <Switch>
            {routers.map(({ component, page }) => {
              return <Route key={page} exact path={page.toLowerCase()} component={component} />;
            })}
            <Route
              render={() => {
                return <div className="container">not found</div>;
              }}
            />
          </Switch>
        </div>
      </div>
    </HashRouter>
  );
}
export default hot(module)(App);
