# 配置详解

a8k 封装了大多数 webpack 的配置，将常用的优化配置集成，并且针对 react 技术栈项目做了正对性配置，虽然屏蔽的大多数复杂性，但是为了对不同项目提供一些灵活的配置，a8k 也提供了一些简答且必要的配置项。

> 基于 a8k 的项目，在根目录下会有一个 a8k.config.js 的配置文件，用于项目的自定义配置

## 基本配置项

### mode

mode 用于指定项目是多页面还是单页面，支持两个值：

| 值     | 描述                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| single | 单页面应用，默认继承 react-router 支持路由，切构建的页面都通过动态导入的方式加载页面 js |
| multi  | 多页面应用，每个页面都有自己的入口文件，a8k 会自动抽离公共的代码，在不同的页面间共享    |

### dist

配置构建生产包（即执行`k build`）的结果输出目录，默认值:`dist`即当前项目目录下面的 dist 文件夹下

### publicPath

和 webpack 的 output.publicPath 意义一致，指定在浏览器中所引用的「此输出目录对应的公开 URL」。相对 URL(relative URL) 会被相对于 HTML 页面（或 <base> 标签）解析。相对于服务的 URL(Server-relative URL)，相对于协议的 URL(protocol-relative URL) 或绝对 URL(absolute URL) 也可是可能用到的，或者有时必须用到，

例如：当将资源托管到 CDN 时

```js
module.exports = {
  //...
  publicPath: 'https://cdn.example.com/assets/',
};
```

### cache

配置构建阶段的缓存目录，默认:`node_modules/.cache`。

a8k 默认会缓存构建中 js、css、html、eslint 的结果，只有当这些文件发生变化时才会重新构建，否则其中所有的 webpack loader 都将从缓存中获取结果，目的是为了提高构建性能

### babel

用于指定 babel 需要处理的额外文件或者需要忽略的文件，这在你调试某些库（需要被编译的代码）时非常用，支持两个配置：

`include`：需要处理的文件

`exclude`：不需要处理的文件

include、exclude 的处理规则和 webpack rule conditions 的规则一致，详情见[webpack rules](https://webpack.js.org/configuration/module/#rule-conditions)

使用方法：

```js
module.exports = {
  //...
  babel: {
    include: [/node_modules\/lodash/], //编译lodash
    exclude: [/.*\.min\.js/], //不处理压缩文件
  },
  //...
};
```

### crossOrigin

配置通过 script、link 引用的 js、css 资源是否支持跨域。默认`false`,支持两个值：`true`、`false`

配置为`true`会在所有的 script 标签上加上`crossorigin="anonymous"`,这对于那些将静态资源部署到 CDN 上的应用非常有用，可以让错误捕获程序捕获到来自 CDN 的 js 错误堆栈。如果资源跨域了，但是没配置这个，当出现未捕获的错误时你只会得到`Script Error`错误，这对于处理现网问题非常不利。

### devServer

该顶配置项用于指定开发服务器信息，用于修改 `webpack-dev-server`插件的配置，通常你只需要修改端口信息即可。具体支持的配置项[见文档](https://webpack.js.org/configuration/dev-server/)

## 高级配置项

### retry

### ssrConfig

### ignorePages

## 自定义 webpack 配置

利用了 webpack-chain 实现自定义配置，具体配置项是`chainWebpack`,该配置项提供一个函数，参数有`config、options`
