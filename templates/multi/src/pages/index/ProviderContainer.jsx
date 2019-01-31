import React from 'react';
import { connect, Provider } from 'react-redux';
import action from './action_creators';
import Container from './Container';
import store from './store';

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
