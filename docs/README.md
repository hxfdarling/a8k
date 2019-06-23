---
home: true
actionText: 快速上手 →
actionLink: /guide/
features:
  - title: 简洁至上
    details: 用最少的配置启动你的web前端项目开发。
  - title: Webpack驱动
    details: 享受 Webpack 的极致开发体验。
  - title: 高性能
    details: a8k 集成最佳构建实践，你只需关心你的代码，无需关心构建。
  - title: 支持SSR
    details: 支持koa、express等框架，对现有node项目无入侵
  - title: 支持storybook
    details: 内置的storybook，支持快速组件开发
  - title: 不止于此
    details: 强大的插件机制，随心所欲的添加工具、模板、命令行、修改构建配置
footer: MIT Licensed | Copyright © 2019-present zman
---

### 简单上手

```bash
# 安装
yarn global add a8k
# 或者：npm install -g a8k

# 新建一个 项目 文件
k create demo

# 进入项目目录
cd demo

# 开始开发
k dev

# 构建发布文件
k build
```

::: warning 提示
通过`k -h`命令查看帮助，了解更多能力
:::

::: warning 注意
请确保你的 Node.js 版本 >= 8。
:::
