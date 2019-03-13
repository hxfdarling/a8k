module.exports = {
  // 标示是多页面还是单页面应用:single/multi
  mode:"<%= app %>",
  // 资源根地址，例如: //7.ur.cn/fudao/pc/
  publicPath:"",
  // dist 目录
  dist: 'public/cdn',
  // 加快热构建的缓存目录，注意不要和其他项目重复
  cache: '.cache',
  // webpack-dev-server配置
  devServer: {
    port: 8080,
  },
  babel:{
    // 配置需要babel解析的路径
    include:[],
  },
  // 直出服务器监听的端口、主机、协议
  ssrDevServer: {
    // protocol:'http',//默认值
    // host:'localhost',// 默认值
    port: 3000,  // 必须填写
  },
  // pages目录下需要忽略的文件夹（不作为页面处理）
  ignorePages: ['action_creators', 'action_types', 'reducers'],
  <% if(retry) { %>
  // 主域重试，有该值表示开启
  retry: {
    // 重试的根地址，和publicPath对应，例如://fudao.qq.com/pc/
    retryPublicPath: '',
    // 排除非我们自己控制的JS
    exclude: [],
    // 下面这些上报点，更具需要填写，如果需要统计重试的情况，请填写monitor上面申请的点
    JS_SUCC_MSID: '', // 成功上报点
    JS_FAIL_MSID: '', // 失败上报点
    CSS_SUCC_MSID: '', // CSS成功
    CSS_FAIL_MSID: '', // CSS失败
    JS_RETRY_SUCC_MSID: '', // JS重试成功
    JS_RETRY_FAIL_MSID: '', // JS重试失败
    CSS_RETRY_SUCC_MSID: '', // CSS重试成功
    CSS_RETRY_FAIL_MSID: '', // CSS重试失败
  },
  <% } %>
  // 配置额外的入口文件，会在每一个page中引用
  entry:{
    vendor:['./src/assets/polyfill.js','./src/assets/vendor.js'],
  },
  <% if(ssr) { %>
  // 服务器直出页面
  ssrConfig:{
    // 构建后的js存放目录，默认值: node_modules/components
    dist:'app/components',
    // 构建后html模板存放目录,默认值: app/views
    // view:'',
    // 服务器直出页面入口
    entry:{
      index:'./src/pages/index/ProviderContainer.jsx',
    },
  },
  <% } %>
  // 修改webpack配置文件
  chainWebpack() {

  },
  plugins: [],
};
