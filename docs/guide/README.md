# IMT 文档

## 使用方法

安装

```shell
npm i -g imt-cli
```

生成模板

```shell
imt create [projectName]
```

启动开发服务器

```shell
imt dev
```

dev 调试直出模式

```shell
imt dev -s
```

构建前端代码

```shell
imt build
```

运行 jest 测试

```shell
imt test
```

## 现有项目如何接入？

在项目根目录添加配置文件:`.imtrc.js`
添加如下配置：

```js
const publicPath = '//7.url.cn/fudao/pc/';
module.exports = {
  // 标示是多页面还是单页面应用:single/multi
  mode: 'multi',
  // dist 目录
  dist: 'public/cdn',
  // 加快热构建的缓存目录
  cache: '/tmp/fudao_qq_com_pc',
  // 是否将 JS 标签配置 crossOrigin='anonymous'
  crossOrigin: false,
  // webpack-dev-server配置
  devServer: {
    port: 7475,
  },
  // 主域重试
  retry: {
    // 重试地址
    retryPublicPath: '//fudao.qq.com/pc/',
    // 排除非我们自己控制的JS
    exclude: [/\/\/sqimg\.qq\.com/],
    // 自定义上报
    JS_SUCC_MSID: '', // JS成功
    JS_FAIL_MSID: '', //  JS失败
    CSS_SUCC_MSID: '', //  CSS成功
    CSS_FAIL_MSID: '', //  CSS失败
    JS_RETRY_SUCC_MSID: '', //  JS重试成功
    JS_RETRY_FAIL_MSID: '', //  JS重试失败
    CSS_RETRY_SUCC_MSID: '', //  CSS重试成功
    CSS_RETRY_FAIL_MSID: '', //  CSS重试失败
  },
  // 服务器直出页面
  ssrConfig: {
    // js存放目录
    // dist:'',// 默认：'node_modules/components'
    // html存放目录
    // view:'',//默认: 'app/views'
    // 入口文件
    entry: {
      providerDiscover: './src/pages/discover/ProviderDiscover',
      providerCourse: './src/pages/course/ProviderCourse',
      providerSearch: './src/pages/search/ProviderSearch',
    },
  },
  // cdn部署路径
  publicPath,
  // pages目录下需要忽略的文件夹（不作为页面处理）
  ignorePages: ['action_creators', 'action_types', 'reducers'],
  // 修改webpack配置
  webpackOverride(config, options) {
    // options.type 值有ssr,development,production,
    // 分别是：服务器直出代码，开发模式代码，生产模式代码
    // 修改webpack配置
    return config;
  },
};
```

## 帮助

```shell
imt -h
```
