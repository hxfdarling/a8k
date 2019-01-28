# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.11.0"></a>

# [0.11.0](https://github.com/hxfdarling/imt/compare/v0.10.5...v0.11.0) (2019-01-28)

### Bug Fixes

- 修复直出调试静态资源加载问题 ([e3a7a0d](https://github.com/hxfdarling/imt/commit/e3a7a0d))
- sourceMap 使用源代码调试 ([4893bac](https://github.com/hxfdarling/imt/commit/4893bac))

### Features

- support imui ([26035c9](https://github.com/hxfdarling/imt/commit/26035c9))

<a name="0.10.5"></a>

## [0.10.5](https://github.com/hxfdarling/imt/compare/v0.10.4...v0.10.5) (2019-01-24)

### Bug Fixes

- 修复 css 重试错误 ([ffa50e8](https://github.com/hxfdarling/imt/commit/ffa50e8))

<a name="0.10.4"></a>

## [0.10.4](https://github.com/hxfdarling/imt/compare/v0.10.3...v0.10.4) (2019-01-23)

### Bug Fixes

- 修复没有配置 dev 无法启动 dev 调试 ([a9f879e](https://github.com/hxfdarling/imt/commit/a9f879e))

<a name="0.10.3"></a>

## [0.10.3](https://github.com/hxfdarling/imt/compare/v0.10.2...v0.10.3) (2019-01-23)

### Bug Fixes

- lock webpack 4.28.4 to fix import error ([ee9d8cb](https://github.com/hxfdarling/imt/commit/ee9d8cb))

<a name="0.10.2"></a>

## [0.10.2](https://github.com/hxfdarling/imt/compare/v0.10.1...v0.10.2) (2019-01-23)

### Bug Fixes

- 锁定 webpack 版本，因为 4.29 存在 import 异常,同时更新其他依赖包 ([1125bb3](https://github.com/hxfdarling/imt/commit/1125bb3))
- 优化 ssr 构建，不输出图片等资源 ([40fad81](https://github.com/hxfdarling/imt/commit/40fad81))

<a name="0.10.1"></a>

## [0.10.1](https://github.com/hxfdarling/imt/compare/v0.10.0...v0.10.1) (2019-01-22)

### Bug Fixes

- 添加锁定版本文件 ([25abc8f](https://github.com/hxfdarling/imt/commit/25abc8f))
- 修复热调试监听端口问题 ([79f64b0](https://github.com/hxfdarling/imt/commit/79f64b0))

<a name="0.10.0"></a>

# [0.10.0](https://github.com/hxfdarling/imt/compare/v0.9.3...v0.10.0) (2019-01-19)

### Features

- 优化 release 代码 ([a012786](https://github.com/hxfdarling/imt/commit/a012786))
- 更新 babel 依赖 ([d6d8668](https://github.com/hxfdarling/imt/commit/d6d8668))

<a name="0.9.3"></a>

## [0.9.3](https://github.com/hxfdarling/imt/compare/v0.9.2...v0.9.3) (2019-01-14)

### Bug Fixes

- 修复非外链 script 添加重试问题 ([ce49512](https://github.com/hxfdarling/imt/commit/ce49512))
- 修复主域重试和 markTime 插件同时使用异常问题 ([c7ea57d](https://github.com/hxfdarling/imt/commit/c7ea57d))

<a name="0.9.2"></a>

## [0.9.2](https://github.com/hxfdarling/imt/compare/v0.9.1...v0.9.2) (2019-01-13)

### Bug Fixes

- 修复没有正确的 js 执行结束埋点 ([4ff722f](https://github.com/hxfdarling/imt/commit/4ff722f))

<a name="0.9.1"></a>

## [0.9.1](https://github.com/hxfdarling/imt/compare/v0.9.0...v0.9.1) (2019-01-13)

### Bug Fixes

- 修复跨域 js 没有添加 crossOrigin ([1261d2c](https://github.com/hxfdarling/imt/commit/1261d2c))

<a name="0.9.0"></a>

# [0.9.0](https://github.com/hxfdarling/imt/compare/v0.8.0...v0.9.0) (2019-01-12)

### Bug Fixes

- 修复资源查找异常 ([010d74d](https://github.com/hxfdarling/imt/commit/010d74d))
- 支持 babel 自定义 include ([f55bf6b](https://github.com/hxfdarling/imt/commit/f55bf6b))

### Features

- merge master ([84d9342](https://github.com/hxfdarling/imt/commit/84d9342))
- merge master ([84a95bb](https://github.com/hxfdarling/imt/commit/84a95bb))
- release 命令删除 option ([e828fa4](https://github.com/hxfdarling/imt/commit/e828fa4))
- release 命令删除 options ([f499984](https://github.com/hxfdarling/imt/commit/f499984))
- 增加 release ([b7d1827](https://github.com/hxfdarling/imt/commit/b7d1827))
- 增加发布命令 ([322ef4a](https://github.com/hxfdarling/imt/commit/322ef4a))
- 增加发布命令 ([5f7f050](https://github.com/hxfdarling/imt/commit/5f7f050))

<a name="0.8.0"></a>

# [0.8.0](https://github.com/hxfdarling/imt/compare/v0.7.0...v0.8.0) (2019-01-09)

### Features

- 添加 GIT 支持 ([bbcdb8a](https://github.com/hxfdarling/imt/commit/bbcdb8a))

<a name="0.7.0"></a>

# [0.7.0](https://github.com/hxfdarling/imt/compare/v0.6.6...v0.7.0) (2019-01-09)

### Bug Fixes

- 优化 options 默认逻辑，优化版本检测逻辑 ([b44b4eb](https://github.com/hxfdarling/imt/commit/b44b4eb))

### Features

- 添加 react-hot-loader 能力 ([b381ffc](https://github.com/hxfdarling/imt/commit/b381ffc))

<a name="0.6.6"></a>

## [0.6.6](https://github.com/hxfdarling/imt/compare/v0.6.5...v0.6.6) (2019-01-08)

### Bug Fixes

- 修复公共 chunk 配置问题 ([d84e6e9](https://github.com/hxfdarling/imt/commit/d84e6e9))

<a name="0.6.5"></a>

## [0.6.5](https://github.com/hxfdarling/imt/compare/v0.6.4...v0.6.5) (2019-01-08)

### Bug Fixes

- 修复公共 chunk 配置问题 ([e008246](https://github.com/hxfdarling/imt/commit/e008246))
- 移除无用插件 ([8e4ad66](https://github.com/hxfdarling/imt/commit/8e4ad66))

<a name="0.6.4"></a>

## [0.6.4](https://github.com/hxfdarling/imt/compare/v0.6.3...v0.6.4) (2019-01-07)

### Bug Fixes

- 添加 postcss-color-function 插件 ([bf69285](https://github.com/hxfdarling/imt/commit/bf69285))
- 添加 postcss-extend-rule 插件 ([c9c8c88](https://github.com/hxfdarling/imt/commit/c9c8c88))

<a name="0.6.3"></a>

## [0.6.3](https://github.com/hxfdarling/imt/compare/v0.6.2...v0.6.3) (2019-01-03)

### Bug Fixes

- 修复资源跨域问题 ([ebd92c0](https://github.com/hxfdarling/imt/commit/ebd92c0))
- 修复 options 获取异常 ([a95e0c4](https://github.com/hxfdarling/imt/commit/a95e0c4))

<a name="0.6.2"></a>

## [0.6.2](https://github.com/hxfdarling/imt/compare/v0.6.1...v0.6.2) (2019-01-03)

### Bug Fixes

- 修复 cache 模块异常 ([aacc28c](https://github.com/hxfdarling/imt/commit/aacc28c))

<a name="0.6.1"></a>

## [0.6.1](https://github.com/hxfdarling/imt/compare/v0.6.0...v0.6.1) (2018-12-27)

### Bug Fixes

- 修复 cache 模块导致报错 ([cec61c5](https://github.com/hxfdarling/imt/commit/cec61c5))

<a name="0.6.0"></a>

# [0.6.0](https://github.com/hxfdarling/imt/compare/v0.5.0...v0.6.0) (2018-12-27)

### Bug Fixes

- 修复服务器渲染调试问题 ([ded9348](https://github.com/hxfdarling/imt/commit/ded9348))
- 修复直出调试不支持 0.0.0.0ip 地址 ([2abdb6e](https://github.com/hxfdarling/imt/commit/2abdb6e))

### Features

- 添加自动获取直出页面，增强直出页面调试能力 ([bc6c533](https://github.com/hxfdarling/imt/commit/bc6c533))
- 添加自动检测新版本 ([f61df71](https://github.com/hxfdarling/imt/commit/f61df71))
- 添加 css sourceMap 可选项 ([3b24c33](https://github.com/hxfdarling/imt/commit/3b24c33))

<a name="0.5.0"></a>

# [0.5.0](https://github.com/hxfdarling/imt/compare/v0.4.17...v0.5.0) (2018-12-26)

### Features

- 添加 node_modules 缓存能力 ([df20c9d](https://github.com/hxfdarling/imt/commit/df20c9d))

<a name="0.4.17"></a>

## [0.4.17](https://github.com/hxfdarling/imt/compare/v0.4.16...v0.4.17) (2018-12-24)

### Bug Fixes

- 修复 retry 插件异常 ([227adbd](https://github.com/hxfdarling/imt/commit/227adbd))

<a name="0.4.16"></a>

## [0.4.16](https://github.com/hxfdarling/imt/compare/v0.4.15...v0.4.16) (2018-12-23)

### Bug Fixes

- 修复在 CI 系统中报告进度 ([28d0447](https://github.com/hxfdarling/imt/commit/28d0447))
- 修复构建结束没有报告耗时 ([798846c](https://github.com/hxfdarling/imt/commit/798846c))

<a name="0.4.15"></a>

## [0.4.15](https://github.com/hxfdarling/imt/compare/v0.4.14...v0.4.15) (2018-12-23)

### Bug Fixes

- 删除  不需要的包，减少依赖

<a name="0.4.14"></a>

## [0.4.14](https://github.com/hxfdarling/imt/compare/v0.4.13...v0.4.14) (2018-12-23)

### Bug Fixes

- 使用 node-sass 替换为 sass

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
