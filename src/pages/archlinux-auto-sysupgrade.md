# Arch Linux 自动系统更新

Arch Linux 没有官方的自动更新流程，因为用户有责任在进行系统更新前阅读最新的官方消息，并在更新过程中进行值守和干预。但是，对于软路由等工作负载极简的无头系统，我希望它能够完全自动地进行更新，而无需人工干预。

## 实现思路

为了能够定时执行系统更新，我选择使用 systemd 中的[定时器](https://wiki.archlinuxcn.org/wiki/Systemd/%E5%AE%9A%E6%97%B6%E5%99%A8)功能。若仅考虑软件包更新，则定时器只需要执行 `pacman -Syu --noconfirm` 命令即可。为了实现完全的无人值守，还需要考虑服务的自动重启。若是完整系统，则还需要在内核更新后自动重启系统。

若使用过 Ubuntu，则会发现它能够自动检测到需要重启的服务和系统，这个功能由 [needrestart](https://github.com/liske/needrestart) 提供。幸运地，这个程序也能够在 Arch Linux 上使用。可以从 [AUR](https://aur.archlinux.org/) 或 [Arch Linux 中文社区仓库](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/)安装。

最后，还需要清理软件包缓存。若比较激进，可以直接在系统更新后执行 `pacman -Sc --noconfirm`。若比较保守，可以激活 [pacman-contrib](https://archlinux.org/packages/extra/x86_64/pacman-contrib/) 软件包中提供的 `paccache.timer` 定时器实现定期自动清理。

## 参考实现

### 配置 needrestart

首先应确保已经安装了 needrestart 软件包，然后创建文件 `/etc/needrestart/conf.d/auto-restart.conf`，写入以下内容，实现自动重启服务。

```perl
# Restart mode: (l)ist only, (i)nteractive or (a)utomatically.
#
# ATTENTION: If needrestart is configured to run in interactive mode but is run
# non-interactive (i.e. unattended-upgrades) it will fallback to list only mode.
#
$nrconf{restart} = 'a';
```

### 创建自动更新服务

然后创建以下 systemd 服务，可以按需修改内容。它首先会执行系统更新，其中 needrestart 软件包中附带的 pacman 钩子会自动调用 `needrestart` 命令，然后会执行 `sync` 命令将缓存的写操作同步到磁盘中，最后会执行一段 Shell 命令，若内核有更新则会安排系统重启。可以考虑插入一行 `ExecStart=/usr/bin/pacman -Sc --noconfirm` 立即清理缓存。

```shell
systemctl edit --full --force auto-sysupgrade.service
```

```systemd
[Unit]
Description=Automatic sysupgrade
After=network.target network-online.target nss-lookup.target

[Service]
Type=oneshot
ExecStart=/usr/bin/pacman -Syu --noconfirm
ExecStart=/usr/bin/sync
ExecStart=/usr/bin/sh -c "if [[ -n $(needrestart -bk | grep 'NEEDRESTART-KSTA: [23]') ]]; then systemctl reboot --when=auto; fi"
IOSchedulingClass=idle
```

### 创建自动更新定时器

再创建一个 systemd 定时器，安排本地时间每天大约 4 时整触发这个服务，可以按需修改内容。

```shell
systemctl edit --full --force auto-sysupgrade.timer
```

```systemd
[Unit]
Description=Automatic sysupgrade every day

[Timer]
OnCalendar=*-*-* 04:00:00
AccuracySec=1h

[Install]
WantedBy=timers.target
```

最后将这个 systemd 定时器激活并立即启动。

```shell
systemctl enable --now auto-sysupgrade.timer
```

### 收尾

正式投入使用之前最好先测试一下这些命令在目标系统上是否能够正常工作。还可以考虑启用 `paccache.timer` 定时器。
