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

> 当然你可以直接在项目目录下面使用 babel 官方配置文件，自定义 babel 配置

### crossOrigin

配置通过 script、link 引用的 js、css 资源是否支持跨域。默认`false`,支持两个值：`true`、`false`

配置为`true`会在所有的 script 标签上加上`crossorigin="anonymous"`,这对于那些将静态资源部署到 CDN 上的应用非常有用，可以让错误捕获程序捕获到来自 CDN 的 js 错误堆栈。如果资源跨域了，但是没配置这个，当出现未捕获的错误时你只会得到`Script Error`错误，这对于处理现网问题非常不利。

### devServer

该顶配置项用于指定开发服务器信息，用于修改 `webpack-dev-server`插件的配置，通常你只需要修改端口信息即可。具体支持的配置项[见文档](https://webpack.js.org/configuration/dev-server/)

## 高级配置项

### retry

JavaScript、css 加载多域名重试配置,配置项支持：`retryPublicPath`,`exclude`

配置示例:

```js
module.exports = {
  retry: {
    retry: {
      retryPublicPath: '//fudao.qq.com/pc/', //重试的地址前缀
      exclude: [/\/\/sqimg\.qq\.com/, /pub\.idqqimg\.com/], // 通过正则表达式，排除不需要重试的文件
    },
  },
};
```

### ssr

类型`boolean`,开启服务器渲染，默认值`false`。

注意：每个页面目录下面必须存在`index.node.jsx`or `index.node.js`文件，这将是服务器直出的入口文件

### ssrConfig

服务器渲染配置，将支持所有页面，如果需要单独配置部分页面直出，请添加 entry 指定需要直出的页面入口文件

`dist`:服务器渲染代码入口构建存放目录，默认值：`./.a8k/entry`

`view`:视图代码存放目录（及 html 模板存放目录),默认值:`./.a8k/view`

`entry`:支持服务器渲染的页面入口文件

配置示例：

```js
module.exports = {
  //省略其他配置
  ssrConfig: {
    entry: {
      providerDiscover: './src/pages/discover/ProviderDiscover',
      providerCourse: './src/pages/course/ProviderCourse',
      providerSearch: './src/pages/search/ProviderSearch',
    },
  },
};
```

### ignorePages

正则表达式，配置`src/pages`目录下面需要排除的文件夹，使用场景是你希望构建不要处理 `src/pages` 目录下面的某些目录（及排除这些目录作为页面处理)

### escheck 检测构建结果是否支持 es5 浏览器

类型：`boolean|{exclude:[],ecmaVersion:string}`,

a8k 编译的结果 JavaScript 代码支持 es5 及以上浏览器运行。但默认情况不会对 node_modules 模块进行代码转换，你可能会意外的引用了第三方模块（没有提供 es5 版本)。为了避免这种意外的 bug 出现，我们提供了默认的构建结果的 es5 检测，如果发现结果中存在非 es5 的代码，将直接报错。

但是，部分文件是可以允许使用高于 es5 版本的 JavaScript 代码的，例如：service worker 脚本，因为支持 service worker 的浏览器对很多 es6 的语法是支持的。

因此，我们提供了额外的配置允许你排除部分文件，配置方式如下：

在 a8k 配置文件中添加如下代码：

```js
module.exports = {
  // ...
  escheck: {
    exclude: ['you-file'], //支持glob匹配规则
  },
};
```

## 自定义 webpack 配置

利用了 webpack-chain 实现自定义配置，具体配置项是`chainWebpack`,该配置项提供一个函数，参数有`config、options`

`config`: 是 WebpackChain 实例对象；

`options`: 中包括了两个重要参数：`type`和`mode`,其中 type 取值`server`或`client`分别标识服务器代码、前端代码,mode 取值`production`或`development`,标识是生产模式还是开发模式

配置示例:

```js
module.exports = {
  //省略其他配置
  /**
   * @param WebpackChain config webpackChain实例对象
   * @param {type:string,mode:string} options 包括:type取值:server、client;mode取值:production、development
   */
  chainWebpack(config, options) {
    //添加自定义loader
    config.module
      .rule('css')
      .test(/\.(scss|css)$/)
      .use('loader-name') //配置一个名字，方便标识
      .loader('style-loader');
    //自定义plugin
    const Plugin = require('you-plugin-module');
    Plugin.__expression = `require('you-plugin-module')`;
    config.plugin('you-plugin-name').use(Plugin, [params1, params2]);
  },
};
```

更多配置方法请参考哦[webpack chain 文档](https://github.com/neutrinojs/webpack-chain)
