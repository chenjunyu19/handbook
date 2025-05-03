# systemd 系统的“开机自启”

此处讨论的是在挂载真实的根文件系统后用户空间的启动流程。

## 系统启动的目标

如果你看过 systemd 系统启动时的输出信息，可以注意到系统启动时会不断启动各种各样的东西（单元），直到出现登录提示。systemd 怎么知道应该启动什么单元？启动到什么程序算启动完成？

默认情况下 systemd 系统的启动的目标是 `default.target`，即，systemd 系统启动时会启动 `default.target` 单元。让我们看看这个单元的内容。

```shell
systemctl cat default.target
```

```systemd
# /usr/lib/systemd/system/graphical.target
#  SPDX-License-Identifier: LGPL-2.1-or-later
#
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

[Unit]
Description=Graphical Interface
Documentation=man:systemd.special(7)
Requires=multi-user.target
Wants=display-manager.service
Conflicts=rescue.service rescue.target
After=multi-user.target rescue.service rescue.target display-manager.service
AllowIsolate=yes
```

不难注意到，实际显示的是 `graphical.target` 的内容。这是因为，在默认情况下，系统中 `default.target` 是 `graphical.target` 的别名。这个别名事实上符号链接，也可以[通过命令获取和设置](https://wiki.archlinuxcn.org/wiki/Systemd#%E6%9B%B4%E6%94%B9%E5%BC%80%E6%9C%BA%E9%BB%98%E8%AE%A4%E5%90%AF%E5%8A%A8%E7%9B%AE%E6%A0%87)。

## 依赖关系

观察上面的单元文件内容，可以注意到 `graphical.target` 强依赖（`Requires`）了 `multi-user.target`，弱依赖（`Wants`）了 `display-manager.service`。我们当然可以递归地查询这些单元文件去梳理依赖关系，但是我们也可以通过命令直接获得完整的依赖关系树。

> [!INFO]
>
> `display-manager.service` 也是一个特殊的单元，它会在实际的显示管理器单元被启用时以别名的方式安装，从而确保只有唯一的显示管理器被自动启动。

下面的示例来自一个无头系统（没有图形界面/物理终端），但是经过了大量的精简。

```shellsession
$ systemctl list-dependencies default.target
default.target
○ ├─display-manager.service
● └─multi-user.target
●   ├─sshd.service
●   ├─systemd-networkd.service
●   ├─basic.target
●   │ ├─paths.target
●   │ ├─slices.target
●   │ ├─sockets.target
●   │ ├─sysinit.target
●   │ └─timers.target
●   └─getty.target
```

对于一般的服务，我们在启用他们时会注意到有符号链接被创建在 `multi-user.target.wants` 单元中，这实现了在不修改 `multi-user.target` 单元文件的情况下修改其依赖关系。这些单元会在系统基本初始化完成（`basic.target`）之后、显示管理器（登录界面）开始启动之前被激活，符合大家对“系统服务”和“开机自启”这些通俗概念的认知。

```shellsession
# systemctl enable sshd.service
Created symlink '/etc/systemd/system/multi-user.target.wants/sshd.service' → '/usr/lib/systemd/system/sshd.service'.
```

所以这也是为什么我们总是能够在系统服务的单元文件中看到如下内容的原因。

```systemd
[Install]
WantedBy=multi-user.target
```

## 推广到用户实例

systemd 系统中的每个登录用户在登录后也会启动对应的 systemd 用户实例，不过用户实例中的 `default.target` 是一个真实存在的单元，而不是别名，并且与系统中的相比简单许多。

```shellsession
$ systemctl --user list-dependencies default.target
default.target
○ ├─xdg-user-dirs-update.service
● └─basic.target
●   ├─paths.target
●   ├─sockets.target
●   └─timers.target
```

所以对于想要在用户登录后激活的用户单元应该有如下内容。

```systemd
[Install]
WantedBy=default.target
```

## 另请参阅

[freedesktop.org 上的 `bootup(7)` 手册页](https://www.freedesktop.org/software/systemd/man/latest/bootup.html)
