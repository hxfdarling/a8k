import WebpackChain from 'webpack-chain';

export default (config: WebpackChain) => {
  config.module
    .rule('ts')
    .test(/\.tsx?$/)
    .use('ts-loader')
    .loader('ts-loader');
};
