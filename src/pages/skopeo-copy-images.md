# 使用 skopeo 复制 Docker 镜像

> [!IMPORTANT]
>
> 本文假设读者已掌握 Docker 的基本概念和使用方法。

在某些情况下，使用 `docker pull` 等命令拉取 Docker Hub 上的容器镜像会遇到网络问题，并且常规的 `export https_proxy=...` 方法对此是不生效的，因为 Docker CLI 并不会将代理设置应用于 Docker Daemon。要使代理设置生效，需要[给 Docker Daemon 配置代理](https://docs.docker.com/engine/daemon/proxy/)或在主机级别使用透明代理。

本文给出了另一种针对性方法，无需修改系统配置或 Docker 配置，也可解决前述问题。使用 `docker pull` 命令的目的是将网络上的容器镜像下载到本地 Docker Daemon 的存储中，而 `skopeo` 也可以达成该目的。并且，`skopeo` 是一个纯 CLI 程序，`https_proxy` 等环境变量可以按预期生效，使用代理下载容器镜像。

## 安装 skopeo

直接使用你喜爱的软件包管理器安装或参考 [containers/skopeo 仓库](https://github.com/containers/skopeo)。

## skopeo 的镜像名字

详情请参考 skopeo 的手册页。下面是从中复制的一些有助于阅读本文的的信息。

> **docker://**_docker-reference_ \
> An image in a registry implementing the "Docker Registry HTTP API V2".

> **docker-archive:**_path_[**:**_docker-reference_] \
> An image is stored in the `docker save` formatted file.  _docker-reference_ is only used when creating such a file, and it must not contain a digest.

> **docker-daemon:**_docker-reference_ \
> An image _docker-reference_ stored in the docker daemon internal storage.  _docker-reference_ must contain either a tag or a digest.  Alternatively, when reading images, the format can be docker-daemon:algo:digest (an image ID).

> **oci-archive:**_path_**:**_tag_ \
> An image _tag_ in a tar archive compliant with "Open Container Image Layout Specification" at _path_.

## 直接复制到 Docker Daemon

以 [busybox](https://hub.docker.com/_/busybox) 为例。

```shell
export https_proxy=...
skopeo copy docker://busybox:latest docker-daemon:busybox:latest
```

## 先复制为 tar 归档再导入 Docker Daemon

使用这种方法可以将镜像转换为一个文件，可以分发和导入。相对前一种方法，将下载和导入两个步骤拆分，对于 Docker Daemon 所在主机不便或不合适使用代理等情况非常合适。

还是以 [busybox](https://hub.docker.com/_/busybox) 为例。

```shell
export https_proxy=...
skopeo copy docker://busybox:latest docker-archive:busybox-latest.tar:busybox:latest
```

完成以后，在当前目录下应该会出现名为 `busybox-latest.tar` 的文件。随后，可以使用 `docker image load` 命令导入 Docker Daemon 存储，而无需考虑网络问题。

```shell
docker image load -i busybox-latest.tar
```
