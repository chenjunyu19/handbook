import { defineConfig, type DefaultTheme } from 'vitepress';

import sidebar from './sidebar';

// https://vitepress.dev/zh/reference/site-config
export default defineConfig({
  title: '冒险手册',
  description: '某只「旅行者·空」的笔记本',
  lang: 'zh-CN',
  srcDir: 'src',
  router: {
    prefetchLinks: false
  },
  lastUpdated: true,
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark'
    },
    codeCopyButtonTitle: '复制代码',
    image: {
      lazyLoading: true
    }
  },
  // https://vitepress.dev/zh/reference/default-theme-config
  themeConfig: {
    nav: [
      { text: '页面', link: '/pages/', activeMatch: '^/pages/' },
      { text: '网络', link: '/network/', activeMatch: '^/network/' }
    ],
    sidebar: sidebar(),
    editLink: {
      pattern: 'https://github.com/chenjunyu19/handbook/blob/main/src/:path',
      text: '在 GitHub 上查看此页面'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chenjunyu19/handbook' }
    ],
    search: {
      provider: 'local',
      options: {
        translations: localSearchZhTranslations()
      }
    },
    externalLinkIcon: true,
    notFound: {
      title: '页面未找到',
      quote: '页面可能被移动或删除了，但你可以继续在本站寻找。',
      linkLabel: '前往首页',
      linkText: '前往首页'
    },
    ...themeConfigZhMessages()
  }
});

// https://github.com/vuejs/vitepress/blob/68150a6f3349c1741ed5683e3010d9ecea02f3a8/docs/.vitepress/config/zh.ts
function themeConfigZhMessages(): DefaultTheme.Config {
  return {
    outline: {
      label: '页面导航'
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '多语言'
  };
}

// https://github.com/vuejs/vitepress/blob/e558af6ca092433df057ad22710d8f6b1dd6ba37/docs/zh/reference/default-theme-search.md
function localSearchZhTranslations(): DefaultTheme.LocalSearchOptions['translations'] {
  return {
    button: {
      buttonText: '搜索',
      buttonAriaLabel: '搜索'
    },
    modal: {
      displayDetails: '显示详细列表',
      resetButtonTitle: '重置搜索',
      backButtonTitle: '关闭搜索',
      noResultsText: '没有结果',
      footer: {
        selectText: '选择',
        selectKeyAriaLabel: '输入',
        navigateText: '导航',
        navigateUpKeyAriaLabel: '上箭头',
        navigateDownKeyAriaLabel: '下箭头',
        closeText: '关闭'
      }
    }
  };
}
