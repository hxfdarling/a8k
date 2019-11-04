import { BUILD_ENV } from '@a8k/common/lib/constants';
import { IResolveWebpackConfigOptions } from '../interface';
import warpFunction from './warpFunction';

export default (
  { filenames, mode }: { filenames: any; mode: any },
  options: IResolveWebpackConfigOptions
) => {
  const useHash = mode === BUILD_ENV.PRODUCTION;
  return {
    js: useHash ? 'assets/js/[name]_[contenthash:8].js' : 'assets/js/[name].js',
    css: useHash ? 'assets/css/[name]_[contenthash:8].css' : 'assets/css/[name].css',
    font: useHash ? 'assets/fonts/[name]_[hash:8].[ext]' : 'assets/fonts/[path]_[name].[ext]',
    image: useHash ? 'assets/images/[name]_[hash:8].[ext]' : 'assets/images/[path]_[name].[ext]',
    file: useHash ? 'assets/files/[name]_[hash:8].[ext]' : 'assets/files/[path]_[name].[ext]',
    chunk: useHash ? 'assets/js/[name]_[chunkhash:8].js' : 'assets/js/[name].js',
    ...warpFunction(filenames)(options),
  };
};
