module.exports = {
  base: '/a8k/',
  host: '127.0.0.1',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'a8k',
      description: '集成 webpack + react 的最佳实践配置的构建工具',
    },
  },
  themeConfig: {
    locales: {
      '/': {
        lastUpdated: '上次更新',
        nav: require('./nav/zh'),
      },
    },
  },
  plugins: [
    ['@vuepress/back-to-top', true],
    ['@vuepress/pwa', { serviceWorker: true, updatePopup: true }],
  ],
};
