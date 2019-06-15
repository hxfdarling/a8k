import React from 'react';
import store from './store';

export default function Container({ work }) {
  return (
    <div>
      timestamp:
      {work}
    </div>
  );
}

Container.prepare = () => {
  store.dispatch({ type: 'test', data: { work: Date.now() } });
};
