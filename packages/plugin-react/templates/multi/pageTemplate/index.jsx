import ReactDOM from 'react-dom';
import ProviderContainer from './ProviderContainer';
import Container from './Container';

import './index.scss';

Container.prepare();
ReactDOM.render(ProviderContainer, document.getElementById('react-body'));
if (module.hot) {
  module.hot.accept();
}
