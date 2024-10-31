import { defineConfig, type DefaultTheme } from 'vitepress';

// https://vitepress.dev/zh/reference/site-config
export default defineConfig({
  title: "冒险手册",
  description: "某只「旅行者·空」的笔记本",
  lang: 'zh-CN',
  srcDir: 'src',
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
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chenjunyu19/handbook' }
    ],
    externalLinkIcon: true,
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
