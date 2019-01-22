import './index.scss';

console.log('this is index');
import('./components/Loading').then(cmp => {
  cmp.default();
});
