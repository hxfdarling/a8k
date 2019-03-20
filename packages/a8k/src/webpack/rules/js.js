import path from 'path';
import { ENV_DEV, TYPE_SERVER } from '../../const';

module.exports = (config, context, { type }) => {
  let include = [];
  if (context.config.babel) {
    include = context.config.babel.include || [];
  }

  // TODO 需要抽离成插件？
  // 加载 imui 里的 // @require '.css'
  config.module
    .rule('imui')
    .test(/\.js$/)
    .include.add(context.resolve('node_modules/imui'))
    .end()
    .use('comment-require-loader')
    .loader('comment-require-loader')
    .options({});

  let rule = config.module
    .rule('js')
    .test(/\.(js|mjs|jsx)$/)
    .include // 热重载插件需要被编译
    .add(context.resolve('src'))
    .add(context.resolve('node_modules/@tencent'))
    // 开发模式注入的代码,需要编译，否则 ie 下面不支持const语法
    .add(path.resolve(require.resolve('@a8k/dev-utils/webpackHotDevClient'), '../'))
    .add(/strip-ansi|chalk|ansi-styles|ansi-regex/);

  // 自定义babel处理内容
  include.forEach(i => (rule = rule.add(i)));

  rule
    .end()
    // 忽略哪些压缩的文件
    .exclude.add(/(.|_)min\.js$/)
    .end()
    .use('babel-loader')
    .loader('babel-loader')
    .options({
      babelrc: false,
      // cacheDirectory 缓存babel编译结果加快重新编译速度
      cacheDirectory: path.resolve(context.config.cache, 'babel-loader'),
      presets: [[require.resolve('babel-preset-a8k'), { isSSR: type === TYPE_SERVER }]],
      plugins: [
        context.internals.mode === ENV_DEV && require.resolve('react-hot-loader/babel'),
      ].filter(Boolean),
    });
};
