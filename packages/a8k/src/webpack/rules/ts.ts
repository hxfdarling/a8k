import WebpackChain from 'webpack-chain';

export default (configChain: WebpackChain) => {
  configChain.module
    .rule('ts')
    .test(/\.tsx?$/)
    .use('ts-loader')
    .loader('ts-loader');
};
