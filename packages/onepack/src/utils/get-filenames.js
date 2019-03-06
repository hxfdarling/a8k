import { ENV_PROD } from '../const';

export default ({ filenames, filenameHash, webpackMode }) => {
  const useHash = typeof filenameHash === 'boolean' ? filenameHash : webpackMode === ENV_PROD;
  return {
    js: useHash ? 'assets/js/[name].[chunkhash:8].js' : 'assets/js/[name].js',
    css: useHash ? 'assets/css/[name].[contenthash:8].css' : 'assets/css/[name].css',
    font: useHash ? 'assets/fonts/[name].[hash:8].[ext]' : 'assets/fonts/[name].[ext]',
    image: useHash ? 'assets/images/[name].[hash:8].[ext]' : 'assets/images/[name].[ext]',
    chunk: useHash ? 'assets/js/[name].[chunkhash:8].js' : 'assets/js/[name].js',
    ...filenames,
  };
};
