import React from 'react';
// import { hot } from 'react-hot-loader';
import { connect, Provider } from 'react-redux';
import action from './action_creators';
import store from './store';

function Container() {
  return <div className="container">index</div>;
}

const App = connect(
  state => {
    return state;
  },
  action
)(Container);

const ProviderContainer = (
  <Provider store={store}>
    <App />
  </Provider>
);

export default ProviderContainer;
