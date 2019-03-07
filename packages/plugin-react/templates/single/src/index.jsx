import { throttle } from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { HashRouter, Route, Switch, Link } from 'react-router-dom';
import action from './action_creator';
import './index.scss';
import routers, { menus } from './routers';
import store from './store';

class App extends Component {
  static defaultProps = {};

  onWindowResize = throttle(() => {
    const { updateTableSize } = this.props;
    const menuWidth = 256;
    const contentPadding = 96;
    const width = document.querySelector('.crm-wrap').getBoundingClientRect().width
      - menuWidth
      - contentPadding;
    updateTableSize(width);
  }, 300);

  componentDidMount() {
    window.onresize = this.onWindowResize;
    this.onWindowResize();
  }

  render() {
    return (
      <HashRouter basename="/">
        <div className="crm-wrap">
          <ul>
            {menus.map(({ page, title }) => (
              <li key={page}>
                <Link to={`/${page.toLowerCase()}`}>{title}</Link>
              </li>
            ))}
          </ul>
          <div className="crm-content">
            <Switch>
              {routers.map(({ component, page }) => {
                return <Route key={page} exact path={page.toLowerCase()} component={component} />;
              })}
              <Route
                render={() => {
                  return <div className="crm-container">not found</div>;
                }}
              />
            </Switch>
          </div>
        </div>
      </HashRouter>
    );
  }
}
const WrapApp = connect(
  state => state,
  action
)(App);

ReactDOM.render(
  <Provider store={store}>
    <WrapApp />
  </Provider>,
  document.getElementById('react-body')
);
