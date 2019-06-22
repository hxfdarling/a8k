import React from 'react';
import { hot } from 'react-hot-loader';
import store from './store';

function Container({ time }) {
  return (
    <div>
      hello work, timestamp
      {time}
    </div>
  );
}
export const init = () => {
  store.dispatch({ type: 'test', data: { time: Date.now() } });
};
export default hot(module)(Container);
