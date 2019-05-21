module.exports = config => {
  config.module
    .rule('ts')
    .test(/\.tsx?$/)
    .use('ts-loader')
    .loader('ts-loader');
};
