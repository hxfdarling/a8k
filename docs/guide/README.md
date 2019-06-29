# 简介

> 集成 webpack 构建最佳实践以及性能优化，集成常见的开发辅助工具，集成模板项目

## 拥有什么能力

1. 集成 React 模板项目，支持 SSR
2. 集成 webpack 最佳实践配置
3. 提供高性能的构建体验
4. 提供优雅的开发体验
5. 提供工程化的必要命令行工具
6. JavaScript 代码规范检测(eslint)
7. css/sass/less 代码规范检测(styleint)
8. 构建结果 es5 代码检测,避免兼容问题
9. git 代码提交消息规范检测，避免开发人员随意提交日志
10. 支持插件机制，灵活可自定义构建配置或命令行工具
11. 内置 @storybook/react 插件，支持使用 storybook 运行项目组件

## 使用方法

安装

```shell
npm i -g a8k
```

创建项目

```shell
mkdir test && cd test

k create
```

启动开发服务器

```shell
k dev
```

开发模式调试直出代码

```shell
k dev -s
```

构建前端代码

```shell
k build
```

运行 jest 测试

```shell
k test
```

初始化 storybook

```shell
k sb-init
```

运行 storybook

```shell
k sb
```

## 模板项目目录结构

为了规范化项目，我们的模板项目规定了最基本的文件结构如下：

```
├── src 源代码目录
|   ├── assets  公共资源目录
|   |   ├── css  公共样式
|   |   ├── images 公共图片
|   |   ├── fonts 字体
|   ├── common 公共代码
|   |   ├── rem.js 移动端屏幕适配
|   |   ├── template.html html模板
|   |   └── vendor.js 第三方库
|   ├── components 公共组件
|   |   ├── Example
|   ├── pages 页面目录
|   |   ├── index 页面(url路径以目录名命名)
|   |   |   ├── index.jsx 前端入口文件
|   |   |   ├── index.html html模板文件
|   |   |   ├── index.node.jsx 直出入口文件
├── .commitlintrc.js commit信息规范配置
├── .editorconfig 编辑器格式化同步
├── .eslintrc.js eslint配置
├── .gitignore  git 忽略文件配置
├── .gitmessage commit提示信息
├── .prettierrc prettier 格式化配置
├── a8k.config.js a8k构建配置
├── jsconfig.json jsconfig配置，为了让vscode支持绝对路径智能感知
└── package.json
```

## 现有项目如何接入

在项目根目录添加配置文件:`a8k.config.js`
添加如下配置：

```js
const publicPath = '//7.url.cn/fudao/pc/';
module.exports = {
  type: 'react', // 项目类型
  // 标示是多页面还是单页面应用:single/multi
  mode: 'multi',
  // dist 目录
  dist: 'dist',
  // cdn部署路径
  publicPath,
  // 是否将 JS 标签配置 crossOrigin='anonymous'
  crossOrigin: false,
  // 配置babel需要处理的模块或者忽略的模块，支持正则和绝对路径
  babel: {
    include: [],
    exclude: [],
  },
  // webpack-dev-server配置
  // 详细配置可以参考webpack-dev-server官方文档
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
    // 入口文件,注意如果不配置，将默认认为所有页面支持直出
    entry: ['index'],
  },
  // pages目录下需要忽略的文件夹（不作为页面处理）
  ignorePages: ['action_creators', 'action_types', 'reducers'],
  chainWebpack(config, { type, mode }) {
    if (type === 'browser') {
      // 客户端代构建
      if (mode === 'production') {
        // 生产模式代码
        config.plugin('pwa').use(require('xxx'), [params1, params2]);
      } else {
        // 开发模式代码
      }
    }
    if (type === 'node') {
      // 服务器代码构建
      if (mode === 'production') {
        // 生产模式代码
      } else {
        // 开发模式代码
      }
    }
  },
};
```

## 直出项目如何接入

运行:`k create example react` 初始化一个多页面应用，可以参考其配置，使用`@a8k/ssr-koa-middleware`中间件，添加到 koa 应用的中间件上， 将自动处理支持直出的路由。

> 注意不要修改 `ssrConfig` 的 `dist|view` 配置, 因为该中间件依赖默认的路径寻找依赖

例如：

```js
const Koa = require('koa');
const path = require('path');
const ssr = require('@a8k/ssr-koa-middleware').default;
const {
  ssrConfig: { port },
} = require('../a8k.config.js');

const app = new Koa();

app.use(ssr());
app.use(require('koa-static')(path.join(__dirname, '../dist/'), {}));

app.listen(port, () => {
  console.log();
  console.log(`http://localhost:${port}`);
});
```

## 帮助

```shell
k -h
```
