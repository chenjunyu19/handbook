# systemd-nspawn 中的 NixOS 容器

本页面介绍了一种在非 [NixOS](https://nixos.org/) 环境下、无需安装 Nix 的引导 NixOS systemd-nspawn 容器的方法。

## 导入 NixOS 容器 tarball

首先，在 [Hydra](https://hydra.nixos.org/) 获取你想要的 NixOS 容器 tarball，例如 [nixos:unstable:nixos.containerTarball.x86_64-linux](https://hydra.nixos.org/job/nixos/unstable/nixos.containerTarball.x86_64-linux)。

然后，使用下面的命令将它导入到 systemd-nspawn 中，命名为 `nixos`。根据实际情况修改文件名。

```shell
importctl -m import-tar nixos-image-lxc-xxxxxxxx-x86_64-linux.tar.xz nixos
```

为了使容器能够访问互联网，可能需要修改容器的网络配置。

```shell
machinectl edit nixos
```

最简单的方法是和宿主环境共享网络命名空间。

```systemd
[Network]
Private=no
```

## 启动并获取容器 shell

完成容器的导入和配置后，就可以启动容器，并在容器中启动一个交互 shell。

```shell
machinectl start nixos
machinectl shell nixos
```

一切顺利的话，将可以看到 NixOS 的命令提示符。

```shellsession
[root@nixos:~]#
```

## 修改 NixOS 配置以适合 nspawn 环境使用

> [!NOTE]
>
> 本节的操作在容器内进行。

由于容器环境限制以及 Nix 本身适配等原因，目前启动的容器中 Nix 部分功能是无法正常使用的，例如 [NixOS/nix#9705](https://github.com/NixOS/nix/issues/9705) 和 [NixOS/nixpkgs#405256](https://github.com/NixOS/nixpkgs/issues/405256)。先通过下面两条命令，临时规避问题，让 Nix 能够顺利执行构建。

```shell
mount --bind -o remount,rw /nix/store
export NIX_CONFIG='sandbox = false'
```

通过一个简单的更新来检查 Nix 守护进程和互联网连接是否可用，同时为后面的系统重建准备。这里不应当出错。

```shell
nix-channel --update
```

如果一切顺利，则编辑 `/etc/nixos/configuration.nix` 文件。撰写本文时，它最初是下面这样的。

```nix
{ config, pkgs, ... }:

{
  imports = [ <nixpkgs/nixos/modules/virtualisation/lxc-container.nix> ];
}
```

将它修改为下面这样。

```nix
{ config, pkgs, ... }:

{
  imports = [ <nixpkgs/nixos/modules/profiles/minimal.nix> ];

  boot.isNspawnContainer = true;
  boot.loader.initScript.enable = true;
  boot.nixStoreMountOpts = [];
  nix.settings.sandbox = false;
}
```

配置文件中的最后两个选项将一开始提到的问题规避方法持久化到系统配置中了，它关闭了 store 目录只读挂载和沙盒构建特性。这或许不符合 Nix 的设计理念，但是以最小的成本让 Nix 构建系统在 nspawn 容器中运行了起来。

最后，重建系统，并重新启动容器，一切就应当完成了。注意，不能使用 `nixos-rebuild switch`，它还不能正常工作。应总是使用下面的方法来切换到新版系统。

```shell
nixos-rebuild boot
systemctl reboot
```

## 我的配置

我使用这个容器的目的是获得 Nix 构建环境，通过 SSH 远程连接使用。使用了 Flake 特性。

`flake.nix`

```nix
{
  inputs.nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    {
      nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          ./configuration.nix
        ];
      };
    };
}
```

`configuration.nix`

```nix
{ pkgs, modulesPath, ... }:
{
  imports = [
    (modulesPath + "/profiles/minimal.nix")
  ];

  nix.settings = {
    experimental-features = [
      "nix-command"
      "flakes"
    ];
    sandbox = false;
    auto-optimise-store = true;
  };

  boot.isNspawnContainer = true;
  boot.loader.initScript.enable = true;
  boot.nixStoreMountOpts = [ ];

  time.timeZone = "Asia/Shanghai";
  i18n.defaultLocale = "zh_CN.UTF-8";
  networking = {
    useHostResolvConf = false;
    useNetworkd = true;
    firewall.enable = false;
  };

  environment.systemPackages = with pkgs; [
    openssh
    git
    nixd
    nixfmt-rfc-style
  ];
  environment.variables = {
    EDITOR = "nano";
    VISUAL = "nano";
  };

  services = {
    openssh = {
      enable = true;
      settings = {
        PasswordAuthentication = false;
        KbdInteractiveAuthentication = false;
      };
    };
  };

  users.mutableUsers = false;
  users.users.root = {
    openssh.authorizedKeys.keys = [
      # ...
    ];
  };

  programs.nix-ld.enable = true;
}
```
