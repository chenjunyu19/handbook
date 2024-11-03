# 给你的 C/C++ 代码“消毒”

> [!NOTE]
>
> 标题中的“消毒”是英文单词 sanitize 的直接翻译。

在调试 C/C++ 代码的时候，可能会遇到一些比较怪异（看起来不合理）的程序行为，此时可以利用好编译器的一些特性来帮助调试。

## 一键起爆

如果你并不是很关心其中的细节，并且使用 GCC 编译器，可以直接使用下面给出的命令。其中包含一些我个人偏好的优化参数。

```shell
gcc -pipe -Wpedantic -Wall -Wextra -g -Og -flto=auto -fsanitize=address,undefined
```

如果使用构建工具，需要将这些参数传递到构建系统里，比如设置 `CFLAGS`、`CXXFLAGS`、`LDFLAGS` 环境变量。

## 编译时检查

在程序编译时，有一些警告默认是关闭的，将这些警告打开可能有助于定位有问题的代码。

- 对于 GGC 和 Clang，在编译参数中添加 `-Wall` 和 `-Wextra` 即可打开大部分警告。
  - 添加 `-pedantic` 可以对不严格符合语言标准的语法产生警告。
  - 对于 Clang，也可以改用 `-Weverything` 打开全部警告。
- 对于 MSVC，在编译参数中添加 `/W4` 或 `/Wall` 来打开大部分或者全部警告。

> [!TIP]
>
> Clang 文档中建议大多数项目使用 `-Wall` 和 `-Wextra` 而不是 `-Weverything`。
>
> MSVC 文档中建议在新项目中全面使用 `/W4`。

## 运行时检查

> [!NOTE]
>
> 撰写此部分时 GCC 最新版本为 14.2.1，Clang 最新版本为 18.1.8。

Google 做了一些叫 Sanitizer 的东西，能够在运行时检查出程序的问题。这些东西现在已经转移到 LLVM 项目中，因此在 Clang 中拥有最完整的体验（功能），但在别的编译器中也有部分实现。

以大家比较常用的 GCC 为例，在撰写本文时，GCC 实现了 AddressSanitizer、ThreadSanitizer 和 UndefinedBehaviorSanitizer，分别用于运行时检测内存错误、数据竞争和未定义行为。我认为其中比较实用且开箱即用的是 AddressSanitizer 和 UndefinedBehaviorSanitizer，可以通过 `-fsanitize=address,undefined` 启用他们。

为了在运行时报告错误时能提供更多有用的信息，建议添加 `-g` 和 `-Og` 参数。

> [!TIP]
>
> 你可能会注意到 GCC 中还有启用 LeakSanitizer 的参数，但事实上 LeakSanitizer 是 AddressSanitizer 的一部分，并且 `-fsanitize=leak` 只对程序链接时有效。所以，使用一条命令直接从源码编译到可执行文件时该参数是不必要的。

> [!IMPORTANT]
>
> 在撰写本文时，GCC 在 Windows 上（即 MinGW-w64）还不支持 Sanitizer。而 MSVC 只实现了 AddressSanitizer。

## 另请参阅

- [GCC 文档](https://gcc.gnu.org/onlinedocs/)
- [Clang 文档](https://clang.llvm.org/docs/)
- [MSVC 文档中关于警告级别的部分](https://learn.microsoft.com/zh-cn/cpp/build/reference/compiler-option-warning-level)
- [MSVC 文档中关于 AddressSanitizer 的部分](https://learn.microsoft.com/zh-cn/cpp/sanitizers/asan)
- [google/sanitizers 仓库](https://github.com/google/sanitizers)
