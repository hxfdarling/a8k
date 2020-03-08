import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import action from './action_creator';
import App from './App';
import './index.scss';
import store from './store';

const WrapApp = connect(state => state, action)(App);

ReactDOM.render(
  <Provider store={store}>
    <WrapApp />
  </Provider>,
  document.getElementById('react-body')
);
