/* eslint-disable no-restricted-globals,global-require */
import React from 'react';

class Loading extends React.Component {
  state = {};

  render() {
    return (
      <div style={{ 'text-align': 'center' }}>
        <img alt="" src={require('./loading.gif')} />
      </div>
    );
  }
}

export default Loading;
