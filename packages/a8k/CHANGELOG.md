# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.9.0](https://github.com/hxfdarling/a8k/compare/v1.8.7...v1.9.0) (2019-05-21)

### Bug Fixes

- 修复 webpack 动态导入错误 ([9e99b45](https://github.com/hxfdarling/a8k/commit/9e99b45))

### Features

- 添加自动清理旧缓存能力 ([6e71140](https://github.com/hxfdarling/a8k/commit/6e71140))

## [1.8.7](https://github.com/hxfdarling/a8k/compare/v1.8.6...v1.8.7) (2019-05-20)

### Bug Fixes

- 修复 webpack 动态导入错误 ([84e3108](https://github.com/hxfdarling/a8k/commit/84e3108))

## [1.8.6](https://github.com/hxfdarling/a8k/compare/v1.8.5...v1.8.6) (2019-05-20)

**Note:** Version bump only for package a8k

## [1.8.5](https://github.com/hxfdarling/a8k/compare/v1.8.4...v1.8.5) (2019-04-18)

### Bug Fixes

- 清理命令添加清除 SSR 构建结果 ([dd8e609](https://github.com/hxfdarling/a8k/commit/dd8e609))

## [1.8.4](https://github.com/hxfdarling/a8k/compare/v1.8.3...v1.8.4) (2019-04-18)

### Bug Fixes

- 兼容旧版本 imt ([e25dffb](https://github.com/hxfdarling/a8k/commit/e25dffb))

## [1.8.3](https://github.com/hxfdarling/a8k/compare/v1.8.2...v1.8.3) (2019-04-18)

### Bug Fixes

- 兼容旧版本 imt ([2f95c8e](https://github.com/hxfdarling/a8k/commit/2f95c8e))

## [1.8.2](https://github.com/hxfdarling/a8k/compare/v1.8.1...v1.8.2) (2019-04-18)

### Bug Fixes

- 修复依赖问题 ([8d56c3c](https://github.com/hxfdarling/a8k/commit/8d56c3c))

## [1.8.1](https://github.com/hxfdarling/a8k/compare/v1.8.0...v1.8.1) (2019-04-18)

### Bug Fixes

- 修复支出配置识别错误 ([6c0faad](https://github.com/hxfdarling/a8k/commit/6c0faad))

# [1.8.0](https://github.com/hxfdarling/a8k/compare/v1.7.1...v1.8.0) (2019-04-18)

### Bug Fixes

- 优化默认的服务器渲染 js 存放目录 ([db30a9b](https://github.com/hxfdarling/a8k/commit/db30a9b))

### Features

- 添加了 jsconfig 初始化能力 ([18bee4b](https://github.com/hxfdarling/a8k/commit/18bee4b))

## [1.7.1](https://github.com/hxfdarling/a8k/compare/v1.7.0...v1.7.1) (2019-04-08)

### Bug Fixes

- 修复 plugin 不支持顺序问题,导致 sw 插件不能再 html 插件之后执行 ([3a576d9](https://github.com/hxfdarling/a8k/commit/3a576d9))

# [1.7.0](https://github.com/hxfdarling/a8k/compare/v1.6.6...v1.7.0) (2019-04-02)

### Features

- 添加 stylelint 支持 ([cd48b8c](https://github.com/hxfdarling/a8k/commit/cd48b8c))

## [1.6.6](https://github.com/hxfdarling/a8k/compare/v1.6.5...v1.6.6) (2019-04-02)

### Bug Fixes

- 回滚 webpack 版本到 4.28.4,修复动态 import 异常 ([666ee38](https://github.com/hxfdarling/a8k/commit/666ee38))

## [1.6.5](https://github.com/hxfdarling/a8k/compare/v1.6.4...v1.6.5) (2019-04-02)

**Note:** Version bump only for package a8k

## [1.6.4](https://github.com/hxfdarling/a8k/compare/v1.6.3...v1.6.4) (2019-04-02)

**Note:** Version bump only for package a8k

## [1.6.3](https://github.com/hxfdarling/a8k/compare/v1.6.2...v1.6.3) (2019-04-01)

### Bug Fixes

- 提供 babel 的排除接口,清理缓存能力 ([30825ab](https://github.com/hxfdarling/a8k/commit/30825ab))
- 修复 eslint 规则变化依然缓存上次结果 ([579f90e](https://github.com/hxfdarling/a8k/commit/579f90e))

## [1.6.2](https://github.com/hxfdarling/a8k/compare/v1.6.1...v1.6.2) (2019-03-29)

**Note:** Version bump only for package a8k

## [1.6.1](https://github.com/hxfdarling/a8k/compare/v1.6.0...v1.6.1) (2019-03-29)

**Note:** Version bump only for package a8k

# [1.6.0](https://github.com/hxfdarling/a8k/compare/v1.5.0...v1.6.0) (2019-03-25)

### Features

- 默认支持 lodash-es 的编译 ([5ecb423](https://github.com/hxfdarling/a8k/commit/5ecb423))

# [1.5.0](https://github.com/hxfdarling/a8k/compare/v1.4.2...v1.5.0) (2019-03-20)

### Features

- 支持直接导出构建分析文件 ([9106f69](https://github.com/hxfdarling/a8k/commit/9106f69))
- 支持自动剔除 moment 中的多余 local 文件 ([87c5f88](https://github.com/hxfdarling/a8k/commit/87c5f88))

## [1.4.2](https://github.com/hxfdarling/a8k/compare/v1.4.1...v1.4.2) (2019-03-20)

### Bug Fixes

- 优化模块 id 生成规则，使用原生配置 ([a792e57](https://github.com/hxfdarling/a8k/commit/a792e57))

## [1.4.1](https://github.com/hxfdarling/a8k/compare/v1.4.0...v1.4.1) (2019-03-20)

### Bug Fixes

- 修复项目中使用了 unknow require 语法，导致无法正确查找依赖 ([4358793](https://github.com/hxfdarling/a8k/commit/4358793))

# [1.4.0](https://github.com/hxfdarling/a8k/compare/v1.3.1...v1.4.0) (2019-03-18)

### Bug Fixes

- 更新 webpack-retry-plugin ([4c27bf6](https://github.com/hxfdarling/a8k/commit/4c27bf6))
- 修复 link 全局依赖时，无法正确编译相关文件 ([f76440e](https://github.com/hxfdarling/a8k/commit/f76440e))
- 修复 lodash 模块没有解析依赖问题 ([fc82303](https://github.com/hxfdarling/a8k/commit/fc82303))
- 移除对 mainFields 的修改 ([f823776](https://github.com/hxfdarling/a8k/commit/f823776))

### Features

- 添加动态导入默认不处理子目录 ([c658a6c](https://github.com/hxfdarling/a8k/commit/c658a6c))

## [1.3.1](https://github.com/hxfdarling/a8k/compare/v1.3.0...v1.3.1) (2019-03-13)

**Note:** Version bump only for package a8k

# [1.3.0](https://github.com/hxfdarling/a8k/compare/v1.2.0...v1.3.0) (2019-03-13)

### Bug Fixes

- 修复 ssr 模式 watch 失效 ([9e4241e](https://github.com/hxfdarling/a8k/commit/9e4241e))
- 修复 ssr 模式 watch 失效 ([81f071a](https://github.com/hxfdarling/a8k/commit/81f071a))
- 修复 ssr 模式 watch 失效 ([faf88c7](https://github.com/hxfdarling/a8k/commit/faf88c7))

# [1.2.0](https://github.com/hxfdarling/a8k/compare/v1.1.5...v1.2.0) (2019-03-12)

**Note:** Version bump only for package a8k

## [1.1.5](https://github.com/hxfdarling/a8k/compare/v1.1.4...v1.1.5) (2019-03-11)

### Bug Fixes

- 修复 webpackOveride 支持问题 ([7490967](https://github.com/hxfdarling/a8k/commit/7490967))

## [1.1.4](https://github.com/hxfdarling/a8k/compare/v1.1.3...v1.1.4) (2019-03-11)

### Bug Fixes

- 兼容旧版本 imt 修改 webpack 配置接口 ([c341989](https://github.com/hxfdarling/a8k/commit/c341989))
- 修复版本检测问题 ([fd6aa58](https://github.com/hxfdarling/a8k/commit/fd6aa58))

## [1.1.3](https://github.com/hxfdarling/a8k/compare/v1.1.2...v1.1.3) (2019-03-08)

**Note:** Version bump only for package a8k

## [1.1.2](https://github.com/hxfdarling/a8k/compare/v1.1.1...v1.1.2) (2019-03-08)

### Bug Fixes

- 修复 jest 运行异常 ([88ad00c](https://github.com/hxfdarling/a8k/commit/88ad00c))
- 优化测试配置 ([99663c6](https://github.com/hxfdarling/a8k/commit/99663c6))
- 支持覆盖 jest 的 setUp 设置 ([8102119](https://github.com/hxfdarling/a8k/commit/8102119))

## [1.1.1](https://github.com/hxfdarling/a8k/compare/v1.1.0...v1.1.1) (2019-03-08)

### Bug Fixes

- 修复环境变量错误，导致 babel 处理异常 ([f6e953d](https://github.com/hxfdarling/a8k/commit/f6e953d))

# [1.1.0](https://github.com/hxfdarling/a8k/compare/v1.0.8-alpha.0...v1.1.0) (2019-03-08)

### Bug Fixes

- 修复了 retry 不生效的 bug | 修复了 crossOrigin 配置错误 | 优化的 webpack.config 生成策略 ([3749df7](https://github.com/hxfdarling/a8k/commit/3749df7))

### Features

- support jest ([91edaf0](https://github.com/hxfdarling/a8k/commit/91edaf0))
- support jest ([9f6e49b](https://github.com/hxfdarling/a8k/commit/9f6e49b))
- support jest ([36ecc13](https://github.com/hxfdarling/a8k/commit/36ecc13))
