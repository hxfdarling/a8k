import { BUILD_ENV } from '../const';

export default ({ filenames, mode }) => {
  const useHash = mode === BUILD_ENV.PRODUCTION;
  return {
    js: useHash ? 'assets/js/[name]_[chunkhash:8].js' : 'assets/js/[name].js',
    css: useHash ? 'assets/css/[name]_[contenthash:8].css' : 'assets/css/[name].css',
    font: useHash ? 'assets/fonts/[name]_[hash:8].[ext]' : 'assets/fonts/[path]_[name].[ext]',
    image: useHash ? 'assets/images/[name]_[hash:8].[ext]' : 'assets/images/[path]_[name].[ext]',
    chunk: useHash ? 'assets/js/[name]_[chunkhash:8].js' : 'assets/js/[name].js',
    ...filenames,
  };
};
