# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.7.0](https://github.com/hxfdarling/a8k/compare/v1.6.6...v1.7.0) (2019-04-02)


### Features

* 添加stylelint支持 ([cd48b8c](https://github.com/hxfdarling/a8k/commit/cd48b8c))





## [1.6.6](https://github.com/hxfdarling/a8k/compare/v1.6.5...v1.6.6) (2019-04-02)


### Bug Fixes

* 回滚webpack版本到4.28.4,修复动态import异常 ([666ee38](https://github.com/hxfdarling/a8k/commit/666ee38))





## [1.6.5](https://github.com/hxfdarling/a8k/compare/v1.6.4...v1.6.5) (2019-04-02)

**Note:** Version bump only for package a8k-packages





## [1.6.4](https://github.com/hxfdarling/a8k/compare/v1.6.3...v1.6.4) (2019-04-02)

**Note:** Version bump only for package a8k-packages





## [1.6.3](https://github.com/hxfdarling/a8k/compare/v1.6.2...v1.6.3) (2019-04-01)


### Bug Fixes

* 提供babel的排除接口,清理缓存能力 ([30825ab](https://github.com/hxfdarling/a8k/commit/30825ab))
* 修复eslint规则变化依然缓存上次结果 ([579f90e](https://github.com/hxfdarling/a8k/commit/579f90e))





## [1.6.2](https://github.com/hxfdarling/a8k/compare/v1.6.1...v1.6.2) (2019-03-29)

**Note:** Version bump only for package a8k-packages





## [1.6.1](https://github.com/hxfdarling/a8k/compare/v1.6.0...v1.6.1) (2019-03-29)

**Note:** Version bump only for package a8k-packages





# [1.6.0](https://github.com/hxfdarling/a8k/compare/v1.5.0...v1.6.0) (2019-03-25)


### Features

* 默认支持lodash-es的编译 ([5ecb423](https://github.com/hxfdarling/a8k/commit/5ecb423))





# [1.5.0](https://github.com/hxfdarling/a8k/compare/v1.4.2...v1.5.0) (2019-03-20)


### Features

* 支持直接导出构建分析文件 ([9106f69](https://github.com/hxfdarling/a8k/commit/9106f69))
* 支持自动剔除moment中的多余local文件 ([87c5f88](https://github.com/hxfdarling/a8k/commit/87c5f88))





## [1.4.2](https://github.com/hxfdarling/a8k/compare/v1.4.1...v1.4.2) (2019-03-20)

### Bug Fixes

- 消除循环依赖 ([e608e83](https://github.com/hxfdarling/a8k/commit/e608e83))
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

**Note:** Version bump only for package a8k-packages

# [1.3.0](https://github.com/hxfdarling/a8k/compare/v1.2.0...v1.3.0) (2019-03-13)

### Bug Fixes

- 修复 ssr 模式 watch 失效 ([9e4241e](https://github.com/hxfdarling/a8k/commit/9e4241e))
- 修复 ssr 模式 watch 失效 ([81f071a](https://github.com/hxfdarling/a8k/commit/81f071a))
- 修复 ssr 模式 watch 失效 ([faf88c7](https://github.com/hxfdarling/a8k/commit/faf88c7))

### Features

- 支持单独创建组件和 page ([8f6c61d](https://github.com/hxfdarling/a8k/commit/8f6c61d))
- 支持单独创建组件和 page ([cfe6c8b](https://github.com/hxfdarling/a8k/commit/cfe6c8b))

# [1.2.0](https://github.com/hxfdarling/a8k/compare/v1.1.5...v1.2.0) (2019-03-12)

### Features

- 添加创建组件能力 ([ea6ade0](https://github.com/hxfdarling/a8k/commit/ea6ade0))

## [1.1.5](https://github.com/hxfdarling/a8k/compare/v1.1.4...v1.1.5) (2019-03-11)

### Bug Fixes

- 修复 webpackOveride 支持问题 ([7490967](https://github.com/hxfdarling/a8k/commit/7490967))

## [1.1.4](https://github.com/hxfdarling/a8k/compare/v1.1.3...v1.1.4) (2019-03-11)

### Bug Fixes

- 兼容旧版本 imt 修改 webpack 配置接口 ([c341989](https://github.com/hxfdarling/a8k/commit/c341989))
- 修复版本检测问题 ([fd6aa58](https://github.com/hxfdarling/a8k/commit/fd6aa58))

## [1.1.3](https://github.com/hxfdarling/a8k/compare/v1.1.2...v1.1.3) (2019-03-08)

**Note:** Version bump only for package a8k-packages

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
