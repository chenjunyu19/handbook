# 安装 Microsoft Visual C++ 可再发行程序包

Microsoft Visual C++ 可再发行程序包（Redistributable）用于在系统中安装 MSVC 的运行时库。MSVC 的每个主要版本都包含一个对应的独立 C/C++ 运行时，运行使用 MSVC 生成的应用程序需要加载对应版本的运行时。

出于便利考虑，我们可以在系统中提前安装上所有版本的可再发行程序包。

## 官方下载

[Microsoft Visual C++ 可再发行程序包最新支持的下载](https://learn.microsoft.com/zh-cn/cpp/windows/latest-supported-vc-redist)

在上面的页面中可以注意到 Visual Studio 版本与 Visual C++ 的版本是不同的，这些可再发行程序包向用户展示的是 Visual Studio 版本，而 DLL 在文件名中使用 Visual C++ 版本进行标记和区分。当某个应用程序提示缺少某个 MSVC 的 DLL，又不想安装所有版本的可再发行程序包时，可以通过 DLL 中的版本号在页面中查找和下载对应的版本。

> [!NOTE]
>
> 错误提示的一个例子：由于找不到 VCRUNTIME140.dll，无法继续执行代码。重新安装程序可能会解决此问题。

## 使用 WinGet 一键安装

将下面的内容保存为文件，命名为 `vcredist.winget.json`。注意到这里使用了[中国科学技术大学开源软件镜像](https://mirrors.ustc.edu.cn/)替代了 WinGet 官方源，若感到介意可以将其换回官方源。

```json
{
	"$schema": "https://aka.ms/winget-packages.schema.2.0.json",
	"Sources": [
		{
			"Packages": [
				{ "PackageIdentifier": "Microsoft.VCRedist.2005.x64" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2005.x86" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2008.x64" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2008.x86" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2010.x64" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2010.x86" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2012.x64" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2012.x86" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2013.x64" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2013.x86" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2015+.x64" },
				{ "PackageIdentifier": "Microsoft.VCRedist.2015+.x86" }
			],
			"SourceDetails": {
				"Argument": "https://mirrors.ustc.edu.cn/winget-source",
				"Identifier": "Microsoft.Winget.Source_8wekyb3d8bbwe",
				"Name": "winget",
				"Type": "Microsoft.PreIndexed.Package"
			}
		}
	]
}
```

然后，在终端中运行以下命令。推荐使用管理员权限运行，避免需要反复确认用户账户控制提示。

```batch
winget import 上面的文件路径
```
