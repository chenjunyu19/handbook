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
        { text: '使用 skopeo 复制 Docker 镜像', link: '/skopeo-copy-images' },
        { text: '一些 Windows 注册表路径', link: '/windows-registry-paths' },
        { text: '安装 VC++ 可再发行包', link: '/install-vcredist' },
        { text: 'MSYS2', link: '/msys2' },
        { text: 'AVR 开发环境（GCC）', link: '/mcu-avr-dev-gcc' },
        { text: 'systemd 系统的“开机自启”', link: '/systemd-autostart' },
        { text: '我的 Arch Linux 安装', link: '/my-arch-installation' },
        { text: 'Tailscale 的 netfilter 规则', link: '/tailscale-netfilter-mode' },
        { text: '理解 UEFI 系统的引导', link: '/uefi-boot' },
        { text: '多出口网络中的 DNS', link: '/dns-in-multi-wan' },
        { text: 'Arch Linux 自动系统更新', link: '/archlinux-auto-sysupgrade' },
      ]
    }
  ];
}
