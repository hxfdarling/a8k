import ProviderContainer from './ProviderContainer';
import store from './store';
import { init } from './Container';

export async function bootstrap(ctx) {
  console.log('TCL: bootstrap -> ctx', ctx);
  init();
  const state = store.getState();
  return { state };
}
export default ProviderContainer;
