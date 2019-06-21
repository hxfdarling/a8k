# 开发指南

> 本文旨在介绍 a8k 项目架构，介绍进行插件开发已经二次开发

## 项目架构

项目采用采用 `hook` 机制以支持插件能力，其中`a8k`包是主项目，集成了 webpack 的必要关键配置和性能优化；`@a8k/babel-preset` 包封装了最新的 JavaScript 特性解析和 jsx 支持。

使用的关键技术：

1. `lerna` 由于项目复杂涉及的技术众多，因此用于 `lerna` 管理多个包(方便发布和调试)
2. `webpack-chain` 为了方便插件动态修改 webpack 配置信息，该库提供灵活的可编程机制动态生成配置文件
3. `webpack-dev-server` 集成 webpack 开发模式的动态更新代码能力
4. `commander`提供命令行能力
5. `webpack`提供模块化打包能力
6. `babel`es 代码转换能力
7. `sass(dart-sass)`提供 sass 预处理语法编译能力
8. `less`提供 less 预处理语法编译能力
9. `post-css`提供 css 兼容性处理
10. `nunjucks`提供 html 模板化能力 [使用文档](https://mozilla.github.io/nunjucks/)
11. `jest` 集成单元测试功能
12. `eslint`检测代码规范
13. `styleint`检测样式规范
14. `acorn`构建结果语法检测
15. `@commitlint/cli`提供 Git commit message 规范检测能力
16. `yeoman-generator` 提供模板项目初始化能力

## 插件开发方式

a8k 提供的插件开发主要依赖于 a8k 实例提供的 hook 机制，通过各种 hook 可以方便的定制构建，随意修改构建配置，同时也可以添加额外的命令行工具，以提升开发体验。下面介绍一些插件的代码结构和可以使用的主要 api。

### 插件结构

```js
module.export = class YouPlugin {
  constructor(options) {
    this.name = 'you plugin name';
    this.options = options;
  }
  // 必须提供的方法，在插件挂载时调用
  apply(context) {
    // context 是a8k实例对象，所有的api由该对象提供
  }
};
```

### API

### context.config

类型`A8kConfig`,可以访问当前项目的配置信息

### context.internals

类型`Internals`,其中参数`mode`表示当前模式是`development`or`production`，用于区分是生产模式构建还是开发模式构建

### context.logger

提供了多个个方法：`error`,`warn`,`info`,`debug`，用于打印统一格式的日志

### context.hook(name:string,fn:Function)

类型`function`，提供两个参数，`name` 表示需要挂载的钩子名称，`fn` 是回调函数。

示例：

```js
class A8kPlugin {
  apply(context) {
    context.hook('chainWebpack', (config, { type }) => {
      if (type === 'browser' && context.internals.mode === 'development') {
        config.plugin('plugin-name').use(require('plugin'), ['params1', 'params2']);
      }
    });
  }
}
```

使用插件,在项目的`a8k.config.js`配置中添加

```js
module.exports = {
  // 省略其他配置
  plugins: ['you-plugin-module'],
  // or plugins:[require("you-plugin-module")]
};
```

### context.registerCommand(name:string):Command

类型`function`，用于注册命令行命令。参数`name`是注册命令的名字，将会返回一个命令对象，可以在上面添加该命令的参数和描述信息以及回调函数。

示例代码：

```js
module.exports = class Plugin {
  apply(context) {
    context
      .registerCommand('demo')
      .description('a8k命令行demo')
      .option('-d,--data [data]', 'external option')
      .action(({ data }) => {
        console.log(data);
      });
  }
};
```

使用方式

```shell
k demo -d test demo
## output: test demo
```

## 模板项目开发

模板项目可以参考 a8k 项目下`packages/plugin-react-template`

> 更多 api 参考[a8k 入口文件定义](https://github.com/hxfdarling/a8k/blob/master/packages/a8k/src/index.ts#L28)
