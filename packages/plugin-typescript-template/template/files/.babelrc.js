module.exports = {
  presets: ['@babel/typescript', '@babel/preset-env', '@babel/preset-react'],
  plugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true, // `style: true` 会加载 less 文件
      },
    ],
  ],
};
