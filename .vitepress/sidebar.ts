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
        { text: '概览', link: '/' }
      ]
    }
  ];
}
