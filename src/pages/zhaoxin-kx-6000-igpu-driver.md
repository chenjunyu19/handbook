# 在安同 OS 上安装兆芯 KX-6000 iGPU 驱动

由于某种机缘巧合，我得到了一台「攀升览峰 T-ZJ100」型迷你 PC 机，它搭载了[「兆芯开先 KX-6640MA」](https://www.zhaoxin.com/prod_view.aspx?nid=3&typeid=129&id=327)处理器。由于处理器性能在如今有点过于落后了，我并不想为它安装 Windows 操作系统。它到我手上时已经预装了[安同 OS](https://aosc.io/aosc-os)，但是兆芯的 iGPU 驱动并没有上游化，需要在[它的网站](https://www.zhaoxin.com/qdxz.aspx?nid=31&typeid=156)上下载和安装。否则，它的板载视频输出不仅没有硬件加速，还无法正确识别屏幕分辨率。

它的 iGPU 驱动并没有开源，也没有为安同 OS 提供对应的软件包。因此我需要自行移植安装。

> [!NOTE]
>
> - 测试时的内核版本为 `6.16.12-aosc-main`
> - 使用的软件包为 [`KX-6000-中科方德5.0_x64-21.00.79.zip`](https://www.zhaoxin.com/Admin/Others/DownloadsPage.aspx?nid=31&id=3418&tag=0&ref=qdxz&pre=0&t=83e1707a341d4e51)
> - 下面提到的命令大多数都应当以 `root` 身份运行，你应当有自己的理解和判断

## 解包

将网站上下载的压缩包解压后，得到一个 deb 软件包和说明文档。我们需要 deb 软件包中的文件。使用下面的命令将软件包中的文件提取到 `tmp` 目录中。

```shell
dpkg-deb -x zhaoxin-linux-graphics-driver-dri-glvnd-21.00.79_amd64.deb tmp
```

## 内核模块

这部分比较顺利，只需要简单修改源码就可以和 6.16 版内核兼容。

首先，确保系统中已经安装了 DKMS。

然后，将软件包中的 `usr/src/zx-21.00.79` 目录复制到主机系统的 `/usr/src/` 目录中，就像其他 DKMS 模块那样。注意检查一下文件的所有者和权限。在 `/usr/src/zx-21.00.79` 目录中，通过 `git apply` 命令应用下面的补丁。

```diff
diff --git a/Makefile b/Makefile
index a2b2900..277d1cf 100644
--- a/Makefile
+++ b/Makefile
@@ -1,11 +1,11 @@
 
 TARGET_ARCH ?= x86_64
 DEBUG ?= 0
-EXTRA_CFLAGS += -Wall -fno-strict-aliasing -Wno-undef -Wno-unused -Wno-missing-braces -Wno-missing-attributes -Wno-overflow -Wno-missing-prototypes -Wno-missing-declarations -Werror -DZX_PCIE_BUS -DNEW_ZXFB -D__LINUX__
+ccflags-y += -Wall -fno-strict-aliasing -Wno-undef -Wno-unused -Wno-missing-braces -Wno-missing-attributes -Wno-overflow -Wno-missing-prototypes -Wno-missing-declarations -Werror -DZX_PCIE_BUS -DNEW_ZXFB -D__LINUX__
 ifeq ($(DEBUG), 1)
-	EXTRA_CFLAGS += -ggdb3 -O2 -D_DEBUG_ -DZX_TRACE_EVENT=0
+	ccflags-y += -ggdb3 -O2 -D_DEBUG_ -DZX_TRACE_EVENT=0
 else
-	EXTRA_CFLAGS += -O2 -fno-strict-aliasing -DZX_TRACE_EVENT=1
+	ccflags-y += -O2 -fno-strict-aliasing -DZX_TRACE_EVENT=1
 endif
 
 BIN_TYPE ?= $(shell uname -m |sed -e s/i.86/i386/)
@@ -25,11 +25,11 @@ ifneq (,$(DRM_VER))
 DRM_PATCH=$(shell sed -n 's/^RHEL_DRM_PATCHLEVEL = \(.*\)/\1/p' $(LINUXDIR)/Makefile)
 DRM_SUBLEVEL=$(shell sed -n 's/^RHEL_DRM_SUBLEVEL = \(.*\)/\1/p' $(LINUXDIR)/Makefile)
 DRM_CODE=$(shell expr $(DRM_VER) \* 65536 + 0$(DRM_PATCH) \* 256 + 0$(DRM_SUBLEVEL))
-EXTRA_CFLAGS += -DDRM_VERSION_CODE=$(DRM_CODE)
+ccflags-y += -DDRM_VERSION_CODE=$(DRM_CODE)
 endif
 
 ifeq ($(YHQILINOS), YHKYLIN-OS)
-EXTRA_CFLAGS += -DYHQILIN
+ccflags-y += -DYHQILIN
 KERNEL_VERSION_NUM := $(shell echo $(KERNEL_VERSION) | cut -d - -f1)
 ifeq (,$(DRM_VER))
 ifeq ($(KERNEL_VERSION_NUM), 4.4.131)
@@ -37,7 +37,7 @@ DRM_VER=4
 DRM_PATCH=9
 DRM_SUBLEVEL=0
 DRM_CODE=$(shell expr $(DRM_VER) \* 65536 + 0$(DRM_PATCH) \* 256 + 0$(DRM_SUBLEVEL))
-EXTRA_CFLAGS += -DDRM_VERSION_CODE=$(DRM_CODE)
+ccflags-y += -DDRM_VERSION_CODE=$(DRM_CODE)
 endif
 endif
 endif
@@ -95,7 +95,7 @@ ZX_OBJ_LIST:= \
 zx-objs := $(addprefix $(ZX_SRC_DIR_O)/,$(ZX_OBJ_LIST))
 
 ## for cbios
-EXTRA_CFLAGS += -I${ZXGPU_FULL_PATH}/src/cbios \
+ccflags-y += -I${ZXGPU_FULL_PATH}/src/cbios \
              -I${ZXGPU_FULL_PATH}/src/cbios/Callback \
              -I${ZXGPU_FULL_PATH}/src/cbios/Device \
              -I${ZXGPU_FULL_PATH}/src/cbios/Device/Port \
diff --git a/src/zx_connector.c b/src/zx_connector.c
index 92fe498..3298029 100644
--- a/src/zx_connector.c
+++ b/src/zx_connector.c
@@ -294,7 +294,7 @@ END:
 }
 
 enum drm_mode_status 
-zx_connector_mode_valid(struct drm_connector *connector, struct drm_display_mode *mode)
+zx_connector_mode_valid(struct drm_connector *connector, const struct drm_display_mode *mode)
 {
     struct drm_device *dev = connector->dev;
     zx_card_t *zx_card = dev->dev_private;
diff --git a/src/zx_fbdev.c b/src/zx_fbdev.c
index 89a7819..48706c2 100755
--- a/src/zx_fbdev.c
+++ b/src/zx_fbdev.c
@@ -264,7 +264,9 @@ static const struct drm_fb_helper_funcs zx_fb_helper_funcs = {
     .gamma_set          = zx_crtc_fb_gamma_set,
     .gamma_get          = zx_crtc_fb_gamma_get,
 #endif
+#if DRM_VERSION_CODE < KERNEL_VERSION(6, 15, 0)
     .fb_probe           = zxfb_create,
+#endif
 #if DRM_VERSION_CODE >= KERNEL_VERSION(6, 2, 0)
     .fb_dirty           = zxfb_dirty,
 #endif
diff --git a/src/zx_sysfs.c b/src/zx_sysfs.c
index 84ff1da..68d9391 100644
--- a/src/zx_sysfs.c
+++ b/src/zx_sysfs.c
@@ -212,7 +212,7 @@ const struct attribute *zx_os_gpu_info[] = {
     NULL
 };
 
-static ssize_t zx_sysfs_trace_read(struct file *filp, struct kobject *kobj, struct bin_attribute *bin_attr, char *buf, loff_t pos, size_t size)
+static ssize_t zx_sysfs_trace_read(struct file *filp, struct kobject *kobj, const struct bin_attribute *bin_attr, char *buf, loff_t pos, size_t size)
 {
     struct pci_dev*    pdev    = to_pci_dev(kobj_to_dev(kobj));
     struct drm_device* drm_dev = pci_get_drvdata(pdev);
@@ -231,7 +231,7 @@ static ssize_t zx_sysfs_trace_read(struct file *filp, struct kobject *kobj, stru
     return ret;
 }
 
-static ssize_t zx_sysfs_trace_write(struct file *filp, struct kobject *kobj, struct bin_attribute *bin_attr, char *buf, loff_t pos, size_t size)
+static ssize_t zx_sysfs_trace_write(struct file *filp, struct kobject *kobj, const struct bin_attribute *bin_attr, char *buf, loff_t pos, size_t size)
 {
     struct pci_dev*    pdev    = to_pci_dev(kobj_to_dev(kobj));
     struct drm_device* drm_dev = pci_get_drvdata(pdev);
```

最后，对这个模块执行安装操作，它不应该产生任何错误。否则，你需要手动排查并解决错误。

```shell
dkms install zx/21.00.79
```

到这里，可以先重启系统测试。此时系统应当能正确识别 iGPU 型号，使用 `zx` 内核模块驱动，并能够使用正常支持的屏幕分辨率。

## 用户态驱动

这部分主要是图形加速相关的支持。大体上说，安装了这些驱动后会得到 OpenGL、视频编解码等功能特性的支持。

在解包目录（`tmp`）中，执行下面的命令，将共享库和配置文件复制到系统中正确的位置。

```shell
install usr/lib/x86_64-linux-gnu/libEGL_zx.so.0.0.0 /usr/lib/libEGL_zx.so.0
install usr/lib/x86_64-linux-gnu/libglapi_zx.so.0.0.0 /usr/lib/libglapi_zx.so.0
install usr/lib/x86_64-linux-gnu/libGLX_zx.so.0.0.0 /usr/lib/libGLX_zx.so.0
install usr/lib/x86_64-linux-gnu/libkeinterface_zx.so.0.0.0 /usr/lib/libkeinterface_zx.so.0
install -t /usr/lib usr/lib/x86_64-linux-gnu/libvdpau_zx.so

install -Dt /usr/lib/dri usr/lib/x86_64-linux-gnu/dri/zx_drv_video.so
install -Dt /usr/lib/dri usr/lib/x86_64-linux-gnu/dri/zx_vndri.so
install -m644 -Dt /usr/lib/dri usr/lib/x86_64-linux-gnu/dri/ZXEApp.cfg

install -Dt /usr/lib/gbm usr/lib/x86_64-linux-gnu/gbm/zx_gbm.so

install -Dt /usr/lib/xorg/modules/drivers usr/lib/xorg/modules/drivers/zx_drv.so
install -Dt /usr/lib/xorg/modules/extensions usr/lib/xorg/modules/extensions/libglx_zx.so

install -m644 -Dt /usr/share/drirc.d usr/share/drirc.d/01-zx_drv.conf
install -m644 -Dt /usr/share/glvnd/egl_vendor.d usr/share/glvnd/egl_vendor.d/10_zx.json
install -m644 -Dt /usr/share/X11/xorg.conf.d usr/share/X11/xorg.conf.d/10-zxgpu.conf
```

需要修改最后两个配置文件为如下内容。这是通过阅读 deb 软件包的 postinst 脚本得知的。

```json
{
    "file_format_version" : "1.0.0",
    "ICD" : {
        "library_path" : "libEGL_zx.so.0"
    }
}
```

```
Section "OutputClass"
    Identifier "zx"
    MatchDriver "zx"
    Driver "zx"
    Option "GlxVendorLibrary" "zx"
EndSection
```

## 后记

如果你仔细阅读了上面的安装过程，尤其是用户态的部分，可以发现这个驱动软件包非常的奇怪。我不禁怀疑，这些软件包的作者真的有测试过他们制作的软件包吗。

我已经在[我的分支](https://github.com/chenjunyu19/aosc-os-abbs/tree/zhaoxin-linux-graphics-driver-dri)上提供了这个软件包重打包为安同 OS 软件包的源码，你可以根据相关文档进行打包和安装，以便维护系统的整洁。
