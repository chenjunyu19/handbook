# 理解 UEFI 系统的引导

得益于微软自 Windows 8 以来对 UEFI 引导的推广，目前 UEFI 引导已取代老式引导（MBR 引导），成为 PC 中的主流引导方式。UEFI 引导能够为我们在单个磁盘上进行多重引导带来极大的便利，同时修改系统的启动项也变得十分方便。

## UEFI 固件

固件是计算机系统启动时加载的第一个软件。举一个形象的例子，向单片机（MCU）下载（也被称为“烧录”）的程序就是一种固件。在 PC 平台中，固件通常又被称为 BIOS，是计算机硬件和操作系统之间的桥梁。UEFI 固件会在计算机系统启动时初始化必要的硬件组件，随后加载约定好的启动项。

UEFI 固件可能会基于 [EDK II](https://github.com/tianocore/edk2) 项目进行开发。

## EFI 可执行文件和 EFI 系统分区

一个适用于 EFI 平台的引导加载程序或实用程序就是文件系统上的一个普通的 `.efi` 扩展名的文件，我们称这种文件为 EFI 可执行文件。EFI 可执行文件是一种 PE（Portable Executable）格式的可执行文件，因此在某些操作系统上也会被错误识别为 Windows/DOS 程序。

正确安装的常规操作系统会将其使用的引导加载程序统一放置在一个分区中，这个分区被称为 EFI 系统分区（EFI System Partition，ESP），并且在分区表中具有专属的分区类型。在分区表中正确地标记 ESP 可以让操作系统识别并进行特殊的优化处理。比如，Windows 系统不会自动给 ESP 分配盘符，同时在“磁盘管理”管理单元中不允许用户对 ESP 进行任何操作，可以防止用户意外对系统产生破坏。

通常来说，进行 UEFI 引导的磁盘会使用 GUID 分区表（GPT），但使用传统的 DOS 分区表也是可以的，尽管会存在一些兼容性问题。UEFI 规范要求固件能够读取 FAT12、FAT16、FAT32 文件系统。为了最大化兼容性，通常选用 FAT32 文件系统。但是请注意，分区需要足够大才能成为一个合规的 FAT32 文件系统，具体可参考 [EFI 系统分区 -  Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/EFI_%E7%B3%BB%E7%BB%9F%E5%88%86%E5%8C%BA)。

事实上，任何 EFI 可执行文件可以放置在磁盘中的任何物理分区上的受支持的文件系统中，甚至不要求分区被标记为 ESP。

## UEFI 启动项

前面提到，EFI 可执行文件的放置是非常灵活的。为了使 UEFI 固件“知道”这些可执行文件的存放位置，操作系统或用户需要进行“登记”，确切来说是向 UEFI 变量中写入一个启动条目。然后，用户可以指定这些条目的顺序，UEFI 固件在系统启动时将按顺序尝试启动。这些修改都可以在操作系统中使用合适的工具完成，而无需进入固件设置界面。

除此之外，部分 UEFI 固件也会在用户界面中提供一个选项，允许用户浏览文件系统，并选择一个 EFI 可执行文件进行启动。又或者，可以使用 UEFI Shell 启动，只需要像在命令提示符（CMD）中一样进行导航和执行可执行文件即可，以下是一个例子。

```shellsession
Shell> FS0:
FS0:\> cd EFI\Microsoft\Boot
FS0:\EFI\Microsoft\Boot> bootmgfw.efi
```

UEFI 固件还会针对它可识别的分区自动生成对应的缺省启动条目，只需要将 EFI 可执行文件放在指定的位置 `\EFI\BOOT\BOOT{设备类型缩写}.EFI` 即可，它与平台有关。以下是从 [UEFI 规范 2.11 版](https://uefi.org/specs/UEFI/2.11/03_Boot_Manager.html#removable-media-boot-behavior)中摘抄的表格。

|                             | File Name Convention |
|-----------------------------|----------------------|
| 32-bit                      | BOOTIA32.EFI         |
| x64                         | BOOTx64.EFI          |
| Itanium architecture        | BOOTIA64.EFI         |
| AArch32 architecture        | BOOTARM.EFI          |
| AArch64 architecture        | BOOTAA64.EFI         |
| RISC-V 32-bit architecture  | BOOTRISCV32.EFI      |
| RISC-V 64-bit architecture  | BOOTRISCV64.EFI      |
| RISC-V 128-bit architecture | BOOTRISCV128.EFI     |
| LoongArch32 architecture    | BOOTLOONGARCH32.EFI  |
| LoongArch64 architecture    | BOOTLOONGARCH64.EFI  |

这非常适合用于制作可启动的可移动磁盘。

## 多重引导

基于上述内容，不难发现，要实现多重引导，只需要简单地运行不同操作系统的安装程序即可。在系统引导时，根据提示按下指定的按键进入引导菜单，即可选择要启动的启动项，实现启动不同的操作系统。

## 结语

UEFI 固件与传统 BIOS 相比，其功能的丰富性和易用性已大大提升，许多商业 PC 产品的固件设置等用户界面已经有图形界面、鼠标输入、网络连接等功能。我个人认为 UEFI 固件已经是一个简易的“操作系统”，尤其考虑到它启动真正的操作系统的方式。
