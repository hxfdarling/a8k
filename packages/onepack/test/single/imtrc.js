module.exports = {
  // 标示是多页面还是单页面应用:single/multi
  mode: 'single',
  // 资源根地址，例如: //7.ur.cn/fudao/pc/
  publicPath: '',
  // dist 目录
  dist: 'dist',
  // 加快热构建的缓存目录，注意不要和其他项目重复
  cache: '.cache',
  // webpack-dev-server配置
  devServer: {
    port: 8080,
  },
  // 直出服务器监听的端口、主机、协议
  ssrDevServer: {
    // protocol:'http',//默认值
    // host:'localhost',// 默认值
    port: 3000, // 必须填写
  },
  // pages目录下需要忽略的文件夹（不作为页面处理）
  ignorePages: ['action_creators', 'action_types', 'reducers'],

  // 配置额外的入口文件，会在每一个page中引用
  entry: {},

  // 修改webpack配置文件
  webpackOverride(config) {
    return config;
  },
  // 添加imt插件
  plugins: [],
};
