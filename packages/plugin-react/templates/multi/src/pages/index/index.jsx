/* eslint-disable react/no-multi-comp */
import ReactDOM from 'react-dom';
import ProviderContainer from './ProviderContainer';

import './index.scss';

ReactDOM.render(ProviderContainer, document.getElementById('react-body'));

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept();
}
