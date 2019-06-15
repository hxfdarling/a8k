import ProviderContainer from './ProviderContainer';
import store from './store';
import Container from './Container';

export async function bootstrap(ctx) {
  await Container.prepare();
  const state = store.getState();
  return { state };
}
export default ProviderContainer;
