# 8051 单片机开发配置 Make 和 Keil C51 汇编

根据实验课程要求，需要在 [Keil](https://www.keil.com/) C51 开发环境中，使用汇编语言编写程序，在 `STC89C52RC` 单片机上运行。[SDCC](https://sdcc.sourceforge.net/) 虽然可用于 8051 平台，但汇编语法与 C51 的差异较大，不利于跟随课程学习。

µVision 作为一款历史悠久的 Windows 应用程序，其用户体验在如今已经处于落后水平。不支持[高 DPI](https://learn.microsoft.com/zh-cn/windows/win32/hidpi/)导致的界面模糊，在中文环境下的乱码问题，说不上好用的内置文本编辑器，较为复杂的项目结构设计，很难让人有兴趣去使用。

幸好，Keil 并没有将工具链与图形用户界面融合在一起。事实上，我们安装在电脑上的所谓的 Keil C51 软件（可能称其为 [Keil PK51](https://developer.arm.com/Tools%20and%20Software/Keil%20PK51) 更为准确），是 µVision IDE 与 C51 工具链的捆绑包，其中 C51 工具链是可以通过命令行独立使用的。因此，可以使用 [GNU Make](https://www.gnu.org/software/make/) 等构建工具打造自定义构建流程，符合实际需要。

## C51 工具链和参数

通过 [Sandboxie-Plus](https://github.com/sandboxie-plus/Sandboxie) 截获到了 µVision 构建项目时调用工具链的参数，整理后如下所示。这些命令行工具的参数语法比较诡异，如果需要详细了解可以浏览 µVision 内的本地帮助文档，在线版可以在 [Keil 网站](https://www.keil.com/support/man_c51.htm)或 [Arm 网站](https://developer.arm.com/documentation/101655/)上找到。

如果没有修改安装路径，则可以在 `C:\Keil_v5\C51\BIN` 目录下找到下面提到的可执行文件。

### 汇编

```bat
REM A51 源文件 [指令...]
A51 汇编代码.a51 OBJECT(对象文件.obj) PRINT(列表文件.lst) SET(SMALL) DEBUG ERRORPRINT
```

- `OBJECT`：输出对象文件（到指定的位置）。
- `PRINT`：输出汇编列表文件（到指定的位置）。
- `SET(SMALL)`：将符号 `SMALL` 设置为数值 1，类比 GCC 中 `-DSMALL`。
- `DEBUG`：在对象文件中包含调试信息，类比 GCC 中 `-g`。
- `ERRORPRINT`：发生错误时给出错误信息。

如果只是单纯需要能够编译出产物，上面列出的指令都不需要使用。这里的对象文件格式是 OMF51。

### 链接

```bat
REM BL51 输入列表 [TO 输出文件] [指令...]
BL51 对象文件.obj TO 绝对对象文件.abs PRINT(内存映射文件.m51) RAMSIZE(256)
```

- `PRINT`：输出内存映射文件（到指定的位置）。
- `RAMSIZE(256)`：指定数据存储器（SRAM）大小为 256 字节。

这里的绝对对象文件格式同样是 OMF51，不同之处在于其中的代码已经处理到了可以被 CPU 执行的程度。

### 转换为 Intel HEX 文件

```bat
REM OH51 绝对对象文件 [HEX 文件]
OH51 绝对对象文件.abs 最终产物.hex
```

为了能够被 ISP 工具将程序下载（烧录）到芯片中，需要生成一个 Intel HEX 格式的文件，它可以被大多数工具读取。

## Makefile

我们已经打通了从 `.a51` 格式汇编代码到 `.hex` 格式机器码的全流程，接下来写个 Makefile 来帮助我们完成构建流程。在编写时参考了 [wjundong/8051-make](https://github.com/wjundong/8051-make) 和 [seisman/how-to-write-makefile](https://github.com/seisman/how-to-write-makefile)，在此对相关作者表示感谢。

使用方法：当 Makefile 为 `./Makefile` 时，运行 `make` 命令即可将每一个 `./src/%.a51` 对应产生 `./src/%.hex`，从而无需再对每一个小实验新建 µVision 项目或移动/重命名代码文件。

```make
DIR_SRC := ./src
DIR_BUILD := ./build

A51 := A51.EXE
BL51 := BL51.EXE
OH51 := OH51.EXE

A51FLAGS := 'SET(SMALL)' DEBUG ERRORPRINT
BL51FLAGS := 'RAMSIZE(256)'

SRCS := $(wildcard $(DIR_SRC)/*.a51)

HEXS := $(patsubst %.a51,$(DIR_BUILD)/%.hex,$(notdir $(SRCS)))

.PHONY: all
all: $(HEXS)

$(DIR_BUILD) :
	mkdir -p $(DIR_BUILD)

.PRECIOUS: $(DIR_BUILD)/%.obj $(DIR_BUILD)/%.lst
$(DIR_BUILD)/%.obj $(DIR_BUILD)/%.lst: $(DIR_SRC)/%.a51 | $(DIR_BUILD)
	$(A51) $< 'OBJECT($@)' 'PRINT($(@:.obj=.lst))' $(A51FLAGS)

.PRECIOUS: %.abs %.m51
%.abs %.m51: %.obj
	$(BL51) $< TO $@ 'PRINT($(@:.abs=.m51))' $(BL51FLAGS)

.PRECIOUS: %.hex
%.hex: %.abs
	$(OH51) $<

.PHONY: clean
clean:
	rm -rf $(DIR_BUILD)
```

## Visual Studio Code 扩展

发现一个名为 8051 Microcontroller Assembly Tools 的扩展用起来非常不错（`Epat.asm8051`，[市场链接](https://marketplace.visualstudio.com/items?itemName=Epat.asm8051)），推荐使用。

## C 语言

改动上面给出的 Makefile，使其能够调用 `C51.EXE` 编译 C 代码，并与恰当的启动代码（`STARTUP.A51`）链接，即可实现构建 C 语言项目。不过，都用 C 语言了，为什么不直接用开源免费的 SDCC 呢？
