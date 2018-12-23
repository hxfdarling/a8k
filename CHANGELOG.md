# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.4.14"></a>

## [0.4.14](https://github.com/hxfdarling/imt/compare/v0.4.13...v0.4.14) (2018-12-23)

<a name="0.4.13"></a>

## [0.4.13](https://github.com/hxfdarling/imt/compare/v0.4.12...v0.4.13) (2018-12-20)

### Bug Fixes

- 修复不能监听全部网卡问题 ([f3b95c7](https://github.com/hxfdarling/imt/commit/f3b95c7))

<a name="0.4.12"></a>

## [0.4.12](https://github.com/hxfdarling/imt/compare/v0.4.11...v0.4.12) (2018-12-20)

### Bug Fixes

- 添加一个 dev 构建模式 ([dfd8f51](https://github.com/hxfdarling/imt/commit/dfd8f51))
- 修复 dev 模式无法重写监听端口 ([ed241b8](https://github.com/hxfdarling/imt/commit/ed241b8))

<a name="0.4.11"></a>

## [0.4.11](https://github.com/hxfdarling/imt/compare/v0.4.10...v0.4.11) (2018-12-20)

### Bug Fixes

- 删除生产模式删除 console ([b33d194](https://github.com/hxfdarling/imt/commit/b33d194))

<a name="0.4.10"></a>

## [0.4.10](https://github.com/hxfdarling/imt/compare/v0.4.9...v0.4.10) (2018-12-06)

### Bug Fixes

- 修复 vendor.js 没有优先执行|修复 dev 模式不支持 ie 问题 ([964b895](https://github.com/hxfdarling/imt/commit/964b895))

<a name="0.4.9"></a>

## [0.4.9](https://github.com/hxfdarling/imt/compare/v0.4.8...v0.4.9) (2018-12-03)

### Bug Fixes

- 修复不支持 css var 的问题 ([d2bf8f1](https://github.com/hxfdarling/imt/commit/d2bf8f1))

<a name="0.4.8"></a>

## [0.4.8](https://github.com/hxfdarling/imt/compare/v0.4.7...v0.4.8) (2018-12-01)

### Bug Fixes

- 优化调试直出体验，修复直出 view 目录不存在的情况 ([8191471](https://github.com/hxfdarling/imt/commit/8191471))

<a name="0.4.7"></a>

## [0.4.7](https://github.com/hxfdarling/imt/compare/v0.4.6...v0.4.7) (2018-12-01)

### Bug Fixes

- 修复服务端渲染导致图片没有路径问题 ([0ce28c7](https://github.com/hxfdarling/imt/commit/0ce28c7))

<a name="0.4.6"></a>

## [0.4.6](https://github.com/hxfdarling/imt/compare/v0.4.5...v0.4.6) (2018-11-30)

### Bug Fixes

- 更新 html-inline-assets-loader ([9cf1b9e](https://github.com/hxfdarling/imt/commit/9cf1b9e))

<a name="0.4.5"></a>

## [0.4.5](https://github.com/hxfdarling/imt/compare/v0.4.4...v0.4.5) (2018-11-29)

### Bug Fixes

- 修复构建出错无法抛出错误,优化构建过程 ([0cde19f](https://github.com/hxfdarling/imt/commit/0cde19f))
- 修复 json path 引用不支持 ([c48481c](https://github.com/hxfdarling/imt/commit/c48481c))
- not emit error ([f75bb12](https://github.com/hxfdarling/imt/commit/f75bb12))

<a name="0.4.4"></a>

## [0.4.4](https://github.com/hxfdarling/imt/compare/v0.4.3...v0.4.4) (2018-11-28)

### Bug Fixes

- 支持压主域重试代码 ([72370a0](https://github.com/hxfdarling/imt/commit/72370a0))

<a name="0.4.3"></a>

## [0.4.3](https://github.com/hxfdarling/imt/compare/v0.4.2...v0.4.3) (2018-11-28)

### Bug Fixes

- 主域重试修复|暂时这么写硬代码，后续优化 ([fb7819d](https://github.com/hxfdarling/imt/commit/fb7819d))

<a name="0.4.2"></a>

## [0.4.2](https://github.com/hxfdarling/imt/compare/v0.4.1...v0.4.2) (2018-11-28)

### Bug Fixes

- 默认 runtimeChunk 使用一个 ([929c67b](https://github.com/hxfdarling/imt/commit/929c67b))

<a name="0.4.1"></a>

## [0.4.1](https://github.com/hxfdarling/imt/compare/v0.4.0...v0.4.1) (2018-11-28)

### Bug Fixes

- 修复使用 webpack 中的 babel 导致意外的 require ([71ce7a9](https://github.com/hxfdarling/imt/commit/71ce7a9))

<a name="0.4.0"></a>

# [0.4.0](https://github.com/hxfdarling/imt/compare/v0.3.1...v0.4.0) (2018-11-27)

### Bug Fixes

- 开发模式调试直出页面导致 xhr 请求异常 ([ce8dc73](https://github.com/hxfdarling/imt/commit/ce8dc73))
- 热调试 xhr 请求异常 ([0744436](https://github.com/hxfdarling/imt/commit/0744436))
- 修复直出环境下引入 css 错误 ([8581d8d](https://github.com/hxfdarling/imt/commit/8581d8d))
- 修复直出模块导入异常 ([09d7af1](https://github.com/hxfdarling/imt/commit/09d7af1))
- 修复 dev 模式下缓存 html 导致 html 中依赖不能正确解析 ([a234697](https://github.com/hxfdarling/imt/commit/a234697))
- 修复 dev 模式下热更新异常 ([b3d717e](https://github.com/hxfdarling/imt/commit/b3d717e))
- 修复 dist 目录错误 ([cf9ace2](https://github.com/hxfdarling/imt/commit/cf9ace2))
- 修复 node_modules 直出模式下未编译 ([d2b708a](https://github.com/hxfdarling/imt/commit/d2b708a))
- 修复 publicPatch 处理异常 ([861fa46](https://github.com/hxfdarling/imt/commit/861fa46))
- ssr boundle 不分包 ([e64c85a](https://github.com/hxfdarling/imt/commit/e64c85a))

### Features

- 添加 dev 模式下调试 ssr 代码 ([ece80b3](https://github.com/hxfdarling/imt/commit/ece80b3))
- 添加 ssr watch 模式 ([12a5ba3](https://github.com/hxfdarling/imt/commit/12a5ba3))
- 支持特定环境下引入 ([24c1bb7](https://github.com/hxfdarling/imt/commit/24c1bb7))
- sri 支持可选开启 ([f724273](https://github.com/hxfdarling/imt/commit/f724273))
- ssr bundle 不打入 node_modules ([e034660](https://github.com/hxfdarling/imt/commit/e034660))

<a name="0.3.1"></a>

## [0.3.1](https://github.com/hxfdarling/imt/compare/v0.3.0...v0.3.1) (2018-11-22)

### Bug Fixes

- 更新 html-inline-assets-loader|修复无法自动更新缓存问题 ([c55c5eb](https://github.com/hxfdarling/imt/commit/c55c5eb))
- 修复 ssr 构建 svg 未排除 ([bd3e1e8](https://github.com/hxfdarling/imt/commit/bd3e1e8))

<a name="0.3.0"></a>

# [0.3.0](https://github.com/hxfdarling/imt/compare/v0.2.0...v0.3.0) (2018-11-22)

### Bug Fixes

- 修复没有提供 entry 选项导致异常 ([98722e7](https://github.com/hxfdarling/imt/commit/98722e7))

### Features

- 提供 dev 模式下禁用 eslint ([d24262c](https://github.com/hxfdarling/imt/commit/d24262c))
- 添加 commit 初始化 ([6dc4260](https://github.com/hxfdarling/imt/commit/6dc4260))
- 添加 lint 初始化命令 ([16522c6](https://github.com/hxfdarling/imt/commit/16522c6))

<a name="0.2.0"></a>

# [0.2.0](https://github.com/hxfdarling/imt/compare/v0.1.2...v0.2.0) (2018-11-22)

### Bug Fixes

- 修复自动填入 chunk ([268a9bf](https://github.com/hxfdarling/imt/commit/268a9bf))
- 修复 common entry 没有引入的 bug ([265a4dd](https://github.com/hxfdarling/imt/commit/265a4dd))
- 修复 css 中 import bug ([709d69c](https://github.com/hxfdarling/imt/commit/709d69c))
- 选择性支持 postcss-import ([1f7a625](https://github.com/hxfdarling/imt/commit/1f7a625))
- 在静默模式下不处理 Deprecation 提示 ([6b9dd46](https://github.com/hxfdarling/imt/commit/6b9dd46))
- 支持 sass-loader 绝对路径查找 ([7fa4e6e](https://github.com/hxfdarling/imt/commit/7fa4e6e))
- ssr 构建异常 ([1090142](https://github.com/hxfdarling/imt/commit/1090142))

### Features

- 更新 babel-preset-imt,支持 flow ([e6728ad](https://github.com/hxfdarling/imt/commit/e6728ad))
- 提高 dev 模式性能 ([35ce8c1](https://github.com/hxfdarling/imt/commit/35ce8c1))
- 添加进度条 ([cb5f419](https://github.com/hxfdarling/imt/commit/cb5f419))
- dev 模式添加进度条 ([ee76176](https://github.com/hxfdarling/imt/commit/ee76176))

<a name="0.1.2"></a>

## [0.1.2](https://github.com/hxfdarling/imt/compare/v0.1.1...v0.1.2) (2018-11-21)

<a name="0.1.0"></a>

# [0.1.0](https://github.com/hxfdarling/imt/compare/v0.0.5...v0.1.0) (2018-11-21)

### Bug Fixes

- 修复 windows 获取 chrome 异常 ([0d90666](https://github.com/hxfdarling/imt/commit/0d90666))
- 修复 windows 获取 chrome 异常 ([bf650ee](https://github.com/hxfdarling/imt/commit/bf650ee))
- 修复 windows 下面执行 click 异常 ([0b60a86](https://github.com/hxfdarling/imt/commit/0b60a86))
- 修复 windows 下面自动登录问题 ([6819baf](https://github.com/hxfdarling/imt/commit/6819baf))

### Features

- 登录逻辑 ([f2b0cc8](https://github.com/hxfdarling/imt/commit/f2b0cc8))
- 清理缓存目录 ([4087b3d](https://github.com/hxfdarling/imt/commit/4087b3d))
- 添加登录接口 ([d52f53f](https://github.com/hxfdarling/imt/commit/d52f53f))
- 添加 chrome 启动支持 ([a92d1aa](https://github.com/hxfdarling/imt/commit/a92d1aa))
- 支持 jsx-if-direction ([89db40b](https://github.com/hxfdarling/imt/commit/89db40b))
- css 支持缓存，大幅提高热构建速度 ([1236f96](https://github.com/hxfdarling/imt/commit/1236f96))
