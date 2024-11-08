import { type DefaultTheme } from 'vitepress';

export default function sidebar(): DefaultTheme.Sidebar {
  return {
    '/pages/': {
      base: '/pages',
      items: sidebarPages()
    }
  };
}

function sidebarPages(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '零散页面',
      items: [
        { text: '概览', link: '/' },
        { text: '8051 开发环境（C51 汇编）', link: '/mcu-8051-dev-c51' },
        { text: '给你的 C/C++ 代码“消毒”', link: '/sanitize-your-c-cpp-code' },
        { text: '使用 skopeo 复制 Docker 镜像', link: '/skopeo-copy-images' }
      ]
    }
  ];
}
