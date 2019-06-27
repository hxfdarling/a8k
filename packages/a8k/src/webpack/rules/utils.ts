import { BUILD_ENV } from '@a8k/common/lib/constants';
import A8k from '../..';

export function genCssModulesName(context: A8k) {
  return context.internals.mode === BUILD_ENV.DEVELOPMENT
    ? '[local]-[hash:base64:6]'
    : '[hash:base64:6]';
}
