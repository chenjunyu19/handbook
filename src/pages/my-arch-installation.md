# 我的 Arch Linux 安装

下面记录了一种充满偏见的但是最小化配置步骤的 Arch Linux 安装流程。

## 环境假设

- x86-64 [UEFI](https://wiki.archlinuxcn.org/wiki/UEFI) 系统。
- [安全启动](https://wiki.archlinuxcn.org/wiki/UEFI/%E5%AE%89%E5%85%A8%E5%90%AF%E5%8A%A8)已关闭。
- 全盘格式化单系统安装。
- 设备具有互联网连接。
- 设备具有正常的性能。
- 使用美式键盘布局。

## 磁盘挂载

首先启动到 live 系统，检查网络连接、磁盘、时间和日期。确认无误后，对磁盘进行分区，使用 GUID 分区表，至少需要分配一个 EFI 系统分区和一个 `Linux root (x86-64)` 类型分区。随后进行分区格式化和挂载。

> [!TIP]
>
> 如果需要完全清理一个已有分区的磁盘，可以使用 [wipefs](https://man.archlinux.org/man/wipefs.8) 命令。
>
> 例如使用 `wipefs -a /dev/sda*` 可以清理 sda 上的文件系统和分区表标识。

| 分区类型            | 文件系统类型 | live 系统挂载点 |
| ------------------- | ------------ | --------------- |
| Linux root (x86-64) | ext4         | `/mnt`          |
| EFI 系统分区        | FAT          | `/mnt/efi`      |

> [!WARNING]
>
> EFI 系统分区大小建议 1 GiB 起步，因为后续会将[统一内核映像（UKI）](https://wiki.archlinuxcn.org/wiki/%E7%BB%9F%E4%B8%80%E5%86%85%E6%A0%B8%E6%98%A0%E5%83%8F)放置在此分区中。
>
> 分区类型设置很重要！因为后续将由 [systemd-gpt-auto-generator](https://man.archlinux.org/man/core/systemd/systemd-gpt-auto-generator.8) 用于自动分区挂载。

::: details 示例命令

```shell
mkfs.fat /dev/sda1
mkfs.ext4 /dev/sda2
systemd-mount /dev/sda2 /mnt
systemd-mount /dev/sda1 /mnt/efi
```

:::

## 预写入配置文件

由于在新根文件系统中还未安装基础系统，因此没有基础文件结构，部分目录需要先手动创建。

### pacman

根据个人喜好编辑主配置文件 `/etc/pacman.conf`，例如打开 `Color` 和 `VerbosePkgLists` 选项，添加 [Arch Linux 中文社区仓库](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/)。

```ini
[archlinuxcn]
Server = https://mirrors.cernet.edu.cn/archlinuxcn/$arch
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
Server = https://repo.archlinuxcn.org/$arch
```

编辑镜像列表文件 `/etc/pacman.d/mirrorlist`，将合适的镜像站点放置在文件顶部。

```ini
Server = https://mirrors.cernet.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
Server = https://geo.mirror.pkgbuild.com/$repo/os/$arch
```

### mkinitcpio

编辑 `/mnt/etc/mkinitcpio.conf.d/hook-systemd-nocmdline.conf`，写入以下内容，使 mkinitcpio 默认使用基于 systemd 的初始化流程。请注意我移除了有关键盘布局和控制台的钩子，因为通常情况下它没有实用性。另外我还添加了 `_optnocmdline=1`，它等效于在运行 `mkinitcpio` 时添加 `--no-cmdline` 选项，阻止生成初始化内存盘时从当前运行的系统中收集命令行参数。这是因为基于 systemd 的初始化内存盘会自动根据分区类型等信息选择根块，添加命令行参数指定它时不必要的。如果你希望添加命令行参数，则应当移除 `_optnocmdline=1` 并按照 `mkinitcpio` 的相关文档编写配置文件。

```shell
HOOKS=(base systemd autodetect microcode modconf kms block filesystems fsck)
_optnocmdline=1
```

编辑 `/mnt/etc/mkinitcpio.d/linux.preset`，写入以下内容，以生成和使用统一内核映像（UKI）。这里假设你使用默认的 `linux` 内核软件包。

```shell
# mkinitcpio preset file for the 'linux' package

ALL_kver="/boot/vmlinuz-linux"

PRESETS=('default' 'fallback')

default_uki="/efi/EFI/Linux/arch-linux.efi"

fallback_uki="/efi/EFI/Linux/arch-linux-fallback.efi"
fallback_options="-S autodetect"
```

提前创建 UKI 生成目标文件夹，否则会生成失败。

```shell
mkdir -pv /mnt/efi/EFI/Linux
```

::: details 不使用引导加载程序的配置

可以直接将 UKI 生成在 UEFI 默认文件路径中，在无需写入 UEFI 变量、无需安装引导加载程序的情况下实现启动。这适用于整个磁盘上仅安装这一个操作系统的情况。注意后续不要安装任何引导加载器或其他操作系统，否则 UKI 可能会被覆盖。

`linux.preset` 文件相应修改为以下内容。

```shell
# mkinitcpio preset file for the 'linux' package

ALL_kver="/boot/vmlinuz-linux"

PRESETS=('default')

default_uki="/efi/EFI/BOOT/BOOTx64.EFI"
```

创建目标文件夹的命令。

```shell
mkdir -pv /mnt/efi/EFI/BOOT
```

:::

### Locale

可以自行选择其他或更多 locale。

```shell
echo 'zh_CN.UTF-8 UTF-8' > /mnt/etc/locale.gen
```

> [!TIP]
>
> 使用 Linux Framebuffer 控制台时可以通过 `export LANG=C.UTF-8` 临时切换为英文环境以解决无法显示汉字的问题。

## 安装基本系统

根据你实际使用的 CPU，添加 [`amd-ucode`](https://archlinux.org/packages/core/any/amd-ucode/) 或者 [`intel-ucode`](https://archlinux.org/packages/extra/any/intel-ucode/) 软件包，以及其他你想安装的软件包。

```shell
pacstrap -GiP /mnt base base-devel linux linux-firmware bash-completion nano
```

## 安装后写入配置文件

### 基本信息

```shell
systemd-firstboot --root=/mnt --locale=zh_CN.UTF-8 --timezone=Asia/Shanghai --hostname=主机名
```

### 网络

```shell
cp -v /etc/systemd/network/*.network /mnt/etc/systemd/network/
ln -sfv ../run/systemd/resolve/stub-resolv.conf /mnt/etc/resolv.conf
systemctl --root=/mnt enable systemd-{network,resolve,timesync}d.service
```

::: details 替代的网络配置文件

`80-wifi-station.network`

```systemd
[Match]
Type=wlan
WLANInterfaceType=station

[Network]
DHCP=yes
MulticastDNS=true
IPv6PrivacyExtensions=yes
IgnoreCarrierLoss=3s

[DHCPv4]
RouteMetric=600

[IPv6AcceptRA]
RouteMetric=600
```

`89-ethernet.network`

```systemd
[Match]
Type=ether
Kind=!*

[Network]
DHCP=yes
MulticastDNS=true
IPv6PrivacyExtensions=yes

[DHCPv4]
RouteMetric=100

[IPv6AcceptRA]
RouteMetric=100
```

:::

### sudo

授予 `wheel` 组成员权限。

```shell
echo '%wheel ALL=(ALL:ALL) ALL' > /mnt/etc/sudoers.d/01-wheel
chmod 0440 /mnt/etc/sudoers.d/01-wheel
```

## 新系统内配置

使用 [`systemd-nspawn`](https://wiki.archlinuxcn.org/wiki/Systemd-nspawn)（或者 [`arch-chroot`](https://man.archlinux.org/man/arch-chroot.8)）进入新系统，进行如下操作。

- 生成 locale。
- 安装 [`systemd-boot`](https://wiki.archlinuxcn.org/wiki/Systemd-boot) 引导加载程序。
- 设置 root 密码。
- 创建普通用户。
- 设置普通用户密码。

```shellsession
root@archiso ~ # systemd-nspawn -D /mnt
░ Spawning container mnt on /mnt.
░ Press Ctrl-] three times within 1s to kill container.
[root@mnt ~]# locale-gen
Generating locales...
  zh_CN.UTF-8... done
Generation complete.
[root@mnt ~]# bootctl install
Created "/efi/EFI/systemd".
Created "/efi/EFI/BOOT".
Created "/efi/loader".
Created "/efi/loader/keys".
Created "/efi/loader/entries".
Copied "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" to "/efi/EFI/systemd/systemd-bootx64.efi".
Copied "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" to "/efi/EFI/BOOT/BOOTX64.EFI".
Random seed file /efi/loader/random-seed successfully written (32 bytes).
[root@mnt ~]# systemctl enable systemd-boot-update.service
Created symlink '/etc/systemd/system/sysinit.target.wants/systemd-boot-update.service' → '/usr/lib/systemd/system/systemd-boot-update.service'.
[root@mnt ~]# passwd
New password:
Retype new password:
passwd: password updated successfully
[root@mnt ~]# useradd -m -N -G wheel 普通用户
[root@mnt ~]# passwd 普通用户
New password:
Retype new password:
passwd: password updated successfully
[root@mnt ~]# exit
logout
Container mnt exited successfully.
root@archiso ~ #
```

## 结束

卸载文件系统并重新启动。

```shell
systemd-umount /mnt
systemctl reboot
```

之后可以阅读[《建议阅读》](https://wiki.archlinuxcn.org/wiki/%E5%BB%BA%E8%AE%AE%E9%98%85%E8%AF%BB)及其相关文章。
