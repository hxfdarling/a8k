import React from 'react';
import { connect, Provider } from 'react-redux';
import action from './action_creators';
import Container from './Container';
import './index.scss';
import store from './store';

const App = connect(
  state => {
    return state;
  },
  action
)(Container);

const ProviderApp = props => (
  <Provider store={store}>
    <App {...props} />
  </Provider>
);
export default ProviderApp;
