# MSYS2

[MSYS2](https://www.msys2.org/) 是一个适用于 Windows 的软件分发和构建平台。

此页面旨在提供使用 MSYS2 所需知识的简要概述和一站式导航。建议首次使用 MSYS2 的读者先通读全文再开始操作。

## 获取和配置

### 下载 MSYS2 基本系统

> [!IMPORTANT]
>
> 你**可以**直接按照[快速上手](https://www.msys2.org/)中的说明，使用安装程序安装 MSYS2，**但是**只能使用安装程序完成初始安装，而不能使用安装程序进行“升级”，因此会出现在 [WinGet](https://github.com/microsoft/winget-cli) 等程序包管理器中提示可以“升级”但是又没有办法“升级”的情况。
>
> 事实上，MSYS2 是“绿色软件”，因此下面描述的安装方法基于自解压程序。

下载 <https://repo.msys2.org/distrib/msys2-x86_64-latest.sfx.exe> 到安装磁盘的根目录，例如 `C:\`。如果需要放置在子目录内，需要确保路径是本地普通 NTFS 卷上的仅 ASCII 短路径。

> [!TIP]
>
> 在中国大陆，可以选用地理位置较近的镜像来获得更快的下载速度。下面是一些例子。
>
> - [教育网联合镜像站智能重定向服务](https://mirrors.cernet.edu.cn/msys2/distrib/msys2-x86_64-latest.sfx.exe)
> - 华中地区
>   - [上海交通大学 Linux 用户组 软件源镜像服务](https://mirrors.sjtug.sjtu.edu.cn/msys2/distrib/msys2-x86_64-latest.sfx.exe)
>   - [中国科学技术大学开源软件镜像](https://mirrors.ustc.edu.cn/msys2/distrib/msys2-x86_64-latest.sfx.exe)
> - 华北地区
>   - [北京外国语大学开源软件镜像站](https://mirrors.bfsu.edu.cn/msys2/distrib/msys2-x86_64-latest.sfx.exe)
>   - [清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/msys2/distrib/msys2-x86_64-latest.sfx.exe)

下载完成后，双击运行，会弹出一个控制台（终端模拟器）窗口，显示解压的状态和进度。等待自动解压完成后，确认出现了 `msys64` 文件夹，随后可以删除 `msys2-x86_64-latest.sfx.exe`。本文后续都将以 `C:\msys64` 为示例，如果不一致需要自行修改相关路径。

### 修改 pacman 配置

这是一项可选的建议操作。

::: details 去除多余的软件仓库

例如，我不需要除了 `msys` 和 `ucrt64` 以外的软件仓库，因此可以使用文本编辑器（例如记事本）打开 `C:\msys64\etc\pacman.conf`。

然后在文件的后半部分找到仓库的定义，把其他仓库的定义给注释掉（在每行的开头添加 `#`），就像下面这样。

```ini
#[clangarm64]
#Include = /etc/pacman.d/mirrorlist.mingw

#[mingw32]
#Include = /etc/pacman.d/mirrorlist.mingw

#[mingw64]
#Include = /etc/pacman.d/mirrorlist.mingw

[ucrt64]
Include = /etc/pacman.d/mirrorlist.mingw

#[clang32]
#Include = /etc/pacman.d/mirrorlist.mingw

#[clang64]
#Include = /etc/pacman.d/mirrorlist.mingw

[msys]
Include = /etc/pacman.d/mirrorlist.msys
```

:::

::: details 修改软件包仓库地址（配置镜像）

在中国大陆地区，可能需要修改镜像列表才能够从软件仓库顺利下载文件。使用文本编辑器编辑 `C:\msys64\etc\pacman.d\mirrorlist.mingw` 和 `C:\msys64\etc\pacman.d\mirrorlist.msys` 这两个文件，写入你喜爱的镜像站。以下是一个例子。

`mirrorlist.mingw` 的内容如下。

```ini
Server = https://mirrors.cernet.edu.cn/msys2/mingw/$repo/
Server = https://mirrors.ustc.edu.cn/msys2/mingw/$repo/
Server = https://mirrors.tuna.tsinghua.edu.cn/msys2/mingw/$repo/

Server = https://mirror.msys2.org/mingw/$repo/
Server = https://repo.msys2.org/mingw/$repo/
```

`mirrorlist.msys` 的内容如下。

```ini
Server = https://mirrors.cernet.edu.cn/msys2/msys/$arch/
Server = https://mirrors.ustc.edu.cn/msys2/msys/$arch/
Server = https://mirrors.tuna.tsinghua.edu.cn/msys2/msys/$arch/

Server = https://mirror.msys2.org/msys/$arch/
Server = https://repo.msys2.org/msys/$arch/
```

:::

### 确认要使用的终端模拟器

MSYS2 默认的[终端模拟器](https://www.msys2.org/docs/terminals/)是 Mintty，但我个人更喜欢使用 Windows 终端。

::: details 使用 Mintty（默认）

在 MSYS2 的根目录下有 `msys2.exe`、`ucrt64.exe` 等若干图标相似的可执行文件，这些是内置的快捷启动器，也是使用安装程序安装时创建的快捷方式的目标。直接运行即可打开对应的 MSYS2 Shell。

可以点击窗口左上角的图标，点击 `Options...` 打开选项，配置语言和外观。

:::

::: details 与 Windows 终端集成

编辑 Windows 终端的配置文件，参考以下示例添加配置文件。

```json
{
    "profiles":
    {
        "list":
        [
            {
                "commandline": "C:/msys64/msys2_shell.cmd -defterm -no-start",
                "guid": "{71160544-14d8-4194-af25-d05feeac7233}",
                "icon": "C:/msys64/msys2.ico",
                "name": "MSYS2 - MSYS"
            },
            {
                "commandline": "C:/msys64/msys2_shell.cmd -defterm -no-start -ucrt64",
                "guid": "{17da3cac-b318-431e-8a3e-7fcdefe6d114}",
                "icon": "C:/msys64/ucrt64.ico",
                "name": "MSYS2 - MinGW UCRT x64"
            }
        ]
    }
}
```

:::

::: details 与 Visual Studio Code 集成

编辑 Visual Studio Code 的配置文件，参考以下示例添加配置文件。

```json
{
    "terminal.integrated.profiles.windows": {
        "MSYS2": {
            "path": "C:/msys64/msys2_shell.cmd",
            "args": [
                "-defterm",
                "-here",
                "-no-start"
            ],
            "icon": "terminal-bash"
        }
    }
}
```

:::

### 首次启动

启动任意 MSYS2 Shell，耐心等待首次初始化直到完成。在中国大陆，如果没有进行特殊的网络配置，可能会看见 `WKD: Connection timed out` 提示，此时可以直接关闭，然后重新打开即可。

### 更新所有软件包

在 MSYS2 Shell 中运行以下命令。

```shell
pacman -Syu --noconfirm
```

观察终端中的输出，确保命令顺利执行完成。如果命令执行到一半窗口突然消失，或者出现 `To complete this update all MSYS2 processes including this terminal will be closed. Confirm to proceed [Y/n]` 提示信息后程序突然终止的情况，只需要重新打开 Shell 然后再次执行上述命令继续完成更新即可。

## 概念

以下是我对 MSYS2 相关技术概念的**个人理解**，同时附上了可供进一步了解的相关链接。可能会存在错误，欢迎讨论和指正。

### Cygwin

提到 [Cygwin](https://cygwin.com/) 时它可能会有两种含义：

- 整个 Cygwin 项目：一系列预编译开源软件的集合，类似 Linux 发行版，但是运行在 Windows 上。
- Cygwin 运行时：`cygwin1.dll` 等文件，是一个兼容层，在程序运行时动态将 POSIX 系统调用转换为 Windows 系统调用，模拟类 Unix 环境。

通过 Cygwin，不需要大量修改代码即可将 Unix 程序程序编译到 Windows 平台上，在兼容层之上运行。

### MinGW 和 MSYS

[MinGW](https://sourceforge.net/projects/mingw/)（Minimalist GNU for Windows）是 [GCC](https://gcc.gnu.org/)（GNU Compiler Collection）的原生 Windows 移植。更确切地说，MinGW 项目提供一系列库和头文件，使得 GCC 可以用于构建不依赖兼容层运行时的原生 x86 Windows 应用程序。

MSYS 是 MinGW 的一个附属项目，分叉自 Cygwin，用于配套提供必要的类 Unix 命令行环境。没有找到 MSYS 项目的独立页面，可以参考 [MSYS2 历史](https://www.msys2.org/wiki/History/#msys-and-mingw) 页面。

这两个项目已处于停滞状态。

### MinGW-w64

> [!NOTE]
>
> 请注意 MinGW 与 MinGW-w64 是两个不同的项目。

[MinGW-w64](https://www.mingw-w64.org/) 是 MinGW 的分叉，提供 64 位和新 API 支持。它同样提供一系列库、头文件和工具，使得 GCC 和 [LLVM](https://www.llvm.org/) 等工具链能够构建原生 Windows 应用程序。

MinGW-w64 项目本身并不打算成为一个软件发行版。根据前面的描述，它的主要作用是给现有的工具链“赋能”，而不是独立使用。浏览项目主页上的[下载页面](https://www.mingw-w64.org/downloads/)可能有助于理解这点。

### MSYS2 的环境

MSYS2 是 MSYS 的精神继承者，除此之外两者并无太多联系。从大体上分，MSYS2 中包含两类环境。

第一类是以 Cygwin 为基础的模拟 POSIX 环境，命名为 `MSYS`，包含 `bash`、`coreutils` 等软件包组成的基本 Unix 命令行环境，仅用于提供一个最小化的开发、构建环境，而不像 Cygwin 项目那样大量提供预编译的 POSIX 模拟软件。

::: details `MSYS` 环境的细节

前面提到，Cygwin 运行时的核心是 `cygwin1.dll`，而 `MSYS` 环境的运行时是 Cygwin 运行时的分叉，运行时库被命名为 `msys-2.0.dll`，由 [`msys2-runtime`](https://packages.msys2.org/base/msys2-runtime) 软件包提供。

鉴于 POSIX 环境与 Windows 环境具有显著差异，建议阅读 [MSYS2 与 Cygwin 的差异](https://www.msys2.org/wiki/How-does-MSYS2-differ-from-Cygwin/) 页面，以了解文件路径自动转换等特性。

:::

第二类是通过基于 MinGW-w64 的工具链构建的原生 Windows 应用程序环境，以使用的具体工具链/运行时命名，例如 `MINGW64`、`UCRT64`、`CLANG64`。软件仓库内不仅包含 GCC 等基础工具链，还包含大量预编译的原生应用程序，不依赖 MSYS2（Cygwin）运行时，而是依赖 Microsoft C 运行时。

> [!TIP]
>
> 你**可以**将 MinGW-w64 环境（例如 `UCRT64` 对应的 `C:\msys64\ucrt64\bin`）加入到 `PATH` 变量以换取更便捷的使用体验，但是**不要**将 `MSYS` 环境（`C:\msys64\usr\bin`）加入到 `PATH` 变量中，因为 POSIX 模拟软件不能很好地与原生 Windows 应用程序集成和交互。
>
> 修改 `PATH` 变量前应明确自己在做什么，了解这样做产生的后果。

[环境](https://www.msys2.org/docs/environments/)页面详细描述了不同环境之间的差异。总的来说，在一般情况下，`MSYS` 环境中不需要安装太多软件，MinGW-w64 类环境只需要挑选一个使用（通常选择 `UCRT64`），并主要在 MinGW-w64 类环境中使用和开发程序。这也是在前面的安装步骤中有“去除多余的软件仓库”的原因。

| 环境名称 | 工具链 | C 运行时                              | C++ 运行时 | 用户 API  |
|----------|--------|---------------------------------------|------------|-----------|
| MSYS     | GCC    | Cygwin                                | libstdc++  | POSIX     |
| MINGW64  | GCC    | MSVCRT（Microsoft Visual C++ 运行时） | libstdc++  | Windows   |
| UCRT64   | GCC    | UCRT（通用 C 运行时）                 | libstdc++  | Windows   |
| CLANG64  | LLVM   | UCRT（通用 C 运行时）                 | libc++     | Windows   |

::: details 在线切换环境的方法

除了在启动 MSYS2 Shell 时选定环境，还可以通过搭配 `source` 和 `shell` 命令随时切换。

以下是一串示例，注意 Shell 提示符中的内容。

```shellsession
User@Hostname MSYS ~
$ source shell ucrt64

User@Hostname UCRT64 ~
$ source shell clang64

User@Hostname CLANG64 ~
$ source shell msys

User@Hostname MSYS ~
$
```

:::

## 使用和维护

### 文件系统

`MSYS` 环境中的应用程序（POSIX 模拟软件）不能理解 Windows 路径，需要使用 Unix 路径。其中，根目录 `/` 是 MSYS2 的安装目录。为了能够访问到其他位置，形如 `/d/` 的 Unix 路径会指向对应的 Windows 分区 `D:\`。事实上，这是通过挂载实现的，在 MSYS2 Shell 中运行 `mount` 命令可以查看当前的挂载信息。

```shellsession
$ mount
C:/msys64 on / type ntfs (binary,noacl,auto)
C:/msys64/usr/bin on /bin type ntfs (binary,noacl,auto)
C: on /c type ntfs (binary,noacl,posix=0,user,noumount,auto)
D: on /d type ntfs (binary,noacl,posix=0,user,noumount,auto)
```

MinGW-w64 环境中的应用程序是原生 Windows 应用程序，因此可以正常使用 Windows 路径，不需要改写为 Unix 路径。

### 软件包管理

MSYS2 使用 [Arch Linux](https://archlinux.org/) 同款的 [pacman](https://www.archlinux.org/pacman/) 软件包管理器，运行于 `MSYS` 环境内，下面简要介绍它的常用基本操作。

```shell
# 从服务器下载新的软件包数据库并升级所有已安装的软件包
pacman -Syu

# 在软件包数据库中搜索软件包（后接正则表达式）
pacman -Ss

# 安装软件包（后接软件包名）
pacman -S

# 删除软件包及其配置文件和不再需要的依赖关系（后接软件包名）
pacman -Rns

# 清理安装包缓存
pacman -Sc
```

所有 MinGW-w64 环境的包都具有前缀 `mingw-w64[-变体]-<体系结构>-`，可以通过环境变量 `MINGW_PACKAGE_PREFIX` 获取。例如，`UCRT64` 环境的前缀为 `mingw-w64-ucrt-x86_64-`，软件包的所有内容都会被安装至 `/ucrt64/` 目录下。

> [!IMPORTANT]
>
> 永远不要使用其他包管理器（例如 `pip`）在 MSYS2 系统内（例如 `/usr/` 和 `/ucrt64/`）安装软件包！这样做会产生破坏和混乱。

> [!TIP]
>
> - 更多 pacman 介绍：[MSYS2 文档](https://www.msys2.org/docs/package-management/)、[ArchWiki](https://wiki.archlinux.org/title/Pacman)、[Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/Pacman)
> - pacman 提示和技巧：[MSYS2 文档](https://www.msys2.org/docs/package-management-tips/)、[ArchWiki](https://wiki.archlinux.org/title/Pacman/Tips_and_tricks)、[Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/Pacman/%E6%8F%90%E7%A4%BA%E5%92%8C%E6%8A%80%E5%B7%A7)
> - 如果你更熟悉 `apt` 或 `dnf` 等软件包管理器，可以参考命令对应关系：[ArchWiki](https://wiki.archlinux.org/title/Pacman/Rosetta)、[Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/Pacman/%E5%90%84%E8%BD%AF%E4%BB%B6%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8%E5%91%BD%E4%BB%A4%E5%AF%B9%E5%BA%94%E5%85%B3%E7%B3%BB)

## 用例

下面的用例均假设处于 MinGW-w64 环境的 MSYS2 Shell 中。

### GCC

```shell
# 安装 MinGW-w64 环境下的 gcc
pacman -S "$MINGW_PACKAGE_PREFIX"-gcc

# 创建空文件 main.c
touch main.c

# 使用默认文件关联打开 main.c
# 随便写点代码，例如 Hello World
start main.c

# 编译
gcc -g -Og -o main.exe main.c

# 运行
./main.exe
```

> [!TIP]
>
> 使用 `cygcheck` 和 `ldd` 命令可以帮助你确定需要分发的动态链接库（DLL）！结果中任何不属于 Windows 的库（或者说位于 MSYS2 目录内的库）都需要与程序一同分发给用户，尽管下面的示例并没有很好地体现这一点。
>
> ```shellsession
> $ cygcheck ./main.exe
> C:\msys64\home\User\main.exe
>   C:\WINDOWS\system32\KERNEL32.dll
>     C:\WINDOWS\system32\ntdll.dll
>     C:\WINDOWS\system32\KERNELBASE.dll
> ```
>
> ```shellsession
> $ ldd ./main.exe
>         ntdll.dll => /c/WINDOWS/SYSTEM32/ntdll.dll (0x7ffa9de00000)
>         KERNEL32.DLL => /c/WINDOWS/System32/KERNEL32.DLL (0x7ffa9ca50000)
>         KERNELBASE.dll => /c/WINDOWS/System32/KERNELBASE.dll (0x7ffa9b870000)
>         ucrtbase.dll => /c/WINDOWS/System32/ucrtbase.dll (0x7ffa9b2d0000)
> ```

### FFmpeg

[FFmpeg](https://ffmpeg.org/) 是一个用于录制、转换和流式传输音频和视频的跨平台解决方案。

```shell
# 安装 MinGW-w64 环境下的 FFmpeg
pacman -S "$MINGW_PACKAGE_PREFIX"-ffmpeg

# 将当前目录下的 input.png 转换为 output.jpg
ffmpeg -i input.png output.jpg
```

### GNU 图像处理程序（GIMP）

[GNU 图像处理程序（GNU Image Manipulation Program，GIMP）](https://www.gimp.org/)是一个跨平台的图像编辑器。

除了常见的命令行程序，还有许多类似这样的开源的图形用户界面程序可以在 MSYS2 中安装和使用，实现依赖共享和统一方便的更新管理，尽管他们本身就发行 Windows 版本的安装程序。

```shell
# 安装 MinGW-w64 环境下的 GIMP
pacman -S "$MINGW_PACKAGE_PREFIX"-gimp

# 启动 GIMP
start gimp.exe
```
