# imt

## 使用方法

安装

```shell
tnpm i -g @tencent/imt
```

生成模板

```shell
imt create [projectName]
```

启动开发服务器

```shell
imt dev
```

构建前端代码

```shell
imt build
```

构建 SSR 代码

```shell
imt ssr
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
  dist: 'public/cdn',
  // 加快热构建的缓存目录
  cacheDir: '/tmp/fudao_qq_com_pc',
  devServer: {
    port: 7475,
  },
  // 主域重试
  retry: {
    // 重试地址
    retryPublicPath: '//fudao.qq.com/pc/',
    // 排除非我们自己控制的JS
    exclude: [/\/\/sqimg\.qq\.com/],
  },
  // 服务器直出页面
  ssrConfig: {
    entry: {
      providerDiscover: './src/pages/discover/ProviderDiscover',
      providerCourse: './src/pages/course/ProviderCourse',
      providerSearch: './src/pages/search/ProviderSearch',
    },
  },
  publicPath,
  ignorePages: ['action_creators', 'action_types', 'reducers'],
  webpackOverride(config, options) {
    // 修改webpack配置
    return config;
  },
};
```

## 帮助

```shell
imt -h
```
