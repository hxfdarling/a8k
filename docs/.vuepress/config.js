module.exports = {
  base: '/a8k/',
  host: '127.0.0.1',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'A8K',
      description: '基于 webpack 的最佳实践配置的前端工程化工具',
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
