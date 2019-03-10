import ReactDOM from 'react-dom';
import ProviderContainer from './ProviderContainer';

import './index.scss';

ReactDOM.render(ProviderContainer, document.getElementById('react-body'));
if (module.hot) {
  module.hot.accept();
}
