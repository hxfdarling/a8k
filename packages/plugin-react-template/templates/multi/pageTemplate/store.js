import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import reducer from './reducer';

const isServer = typeof window === 'undefined';
let __initialState;
if (isServer) {
  __initialState = {};
} else {
  __initialState = window.__initialState;
}

let middleware = applyMiddleware(thunkMiddleware);
if (process.env.NODE_ENV !== 'production' && !isServer) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  middleware = composeEnhancers(middleware);
}

export default createStore(reducer, __initialState, middleware);
