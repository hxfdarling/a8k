# @a8k/babel-preset

This package includes the Babel preset used by [a8k](https://github.com/hxfdarling/a8k).<br>
Please refer to its documentation:

- [Getting Started](https://hxfdarling.github.io/a8k/guide/) – How to create a new app.
- [User Config](https://hxfdarling.github.io/a8k/config/) – How to custom config with a8k.

## usage

width webpack-chain

```js
chainConfig.module
  .rule('ts')
  .test(/\.(ts|tsx)$/)
  .exclude.clear()
  .add(/(\/|\\)node_modules(\/|\\)/)
  .end()
  .use('babel-loader')
  .loader('babel-loader')
  .options({
    cacheDirectory: path.resolve(cacheDirectory, 'babel-loader'),
    presets: [[require.resolve('@a8k/babel-preset'), { target: 'web' }]],
    plugins: [],
  });
```

## options

### typescript

配置参考[babel-preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript#options)

### target

支持:`node`,`web`

`node`: 构建 Nodejs 环境的代码

`web`: 构建浏览器环境的代码

### useBuiltIns

[babel-preset-env#usebuiltins](https://babeljs.io/docs/en/babel-preset-env#usebuiltins)

### modules

[babel-preset-env#modules](https://babeljs.io/docs/en/babel-preset-env#modules)

### useESModules

[babel-plugin-transform-runtime#useesmodules](https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules)
