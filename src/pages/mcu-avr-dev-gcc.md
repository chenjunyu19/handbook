# AVR 单片机 GCC 开发环境配置

此页面记录了使用 [`avr-gcc`](https://gcc.gnu.org/wiki/avr-gcc) 工具链、[GNU Make](https://www.gnu.org/software/make/) 构建工具和 [AVRDUDE](https://www.nongnu.org/avrdude/) 烧录工具在 [ATmega16](https://www.microchip.com/en-us/product/atmega16) MCU 上进行开发的相关内容。

> [!TIP]
>
> 如果你需要尽快投入生产，而不关心其中的技术细节，并且不追求使用最新版本的工具链，则可以直接使用适用于 Visual Studio Code 的 [Embedded IDE](https://em-ide.com/) 扩展，在扩展中安装 `avr-gcc` 工具链，然后直接使用模板新建项目即可。

## 工具安装

对于 Windows 平台，可以在 [MSYS2](msys2.md) 中安装以下软件包。

- [make](https://packages.msys2.org/base/make)：构建工具
- [mingw-w64-avr-gcc](https://packages.msys2.org/base/mingw-w64-avr-gcc)：工具链
- [mingw-w64-avr-libc](https://packages.msys2.org/base/mingw-w64-avr-libc)：C 函数库
- [mingw-w64-avrdude](https://packages.msys2.org/base/mingw-w64-avrdude)：烧录工具

对于其他平台，寻找并安装对应名称的软件包即可。

## 参考资料

- 芯片数据手册：显而易见的必要文档。
- [AVRDUDE 选项解释](https://www.nongnu.org/avrdude/user-manual/avrdude_3.html)：学习如何设置烧录参数。
- [AVR-LibC 文档](https://avrdudes.github.io/avr-libc/avr-libc-user-manual/)：C 函数和平台特定宏的参考。
- [hexagon5un/AVR-Programming 项目](https://github.com/hexagon5un/AVR-Programming)：大量可供学习的示例。

## 项目模板

新建一个目录，创建文件 `Makefile`，内容如下，改编自 [hexagon5un/AVR-Programming](https://github.com/hexagon5un/AVR-Programming/blob/ad2512ee6799e75e25e70043e8dcc8122cb4f5ab/setupProject/Makefile)。注意你需要根据实际情况修改文件头部的**MCU 参数**、**烧录参数**和文件尾部的**熔丝位**。

运行 `make show_fuses` 命令读出熔丝位，运行 `make fuses` 命令写入熔丝位，操作前应**明确自己在做什么**！

将所有需要参与编译的 C 文件放置于该目录中（子目录亦可），与常规 C 程序一样使用签名为 `int main(void)` 的函数作为程序入口。运行 `make` 命令即可构建出用于烧录的 `.hex` 文件，运行 `make flash` 命令即可构建并烧录。

```makefile
##########------------------------------------------------------##########
##########              Project-specific Details                ##########
##########    Check these every time you start a new project    ##########
##########------------------------------------------------------##########

MCU   = atmega16
F_CPU = 16000000UL
BAUD  = 9600UL
## Also try BAUD = 19200 or 38400 if you're feeling lucky.

##########------------------------------------------------------##########
##########                 Programmer Defaults                  ##########
##########          Set up once, then forget about it           ##########
##########        (Can override.  See bottom of file.)          ##########
##########------------------------------------------------------##########

PROGRAMMER_ARGS = -p $(MCU) -c jtag1 -P ch340 -v

##########------------------------------------------------------##########
##########                  Program Locations                   ##########
##########     Won't need to change if they're in your PATH     ##########
##########------------------------------------------------------##########

CC = avr-gcc
OBJCOPY = avr-objcopy
OBJDUMP = avr-objdump
AVRSIZE = avr-size
AVRDUDE = avrdude

##########------------------------------------------------------##########
##########                   Makefile Magic!                    ##########
##########         Summary:                                     ##########
##########             We want a .hex file                      ##########
##########        Compile source files into .elf                ##########
##########        Convert .elf file into .hex                   ##########
##########        You shouldn't need to edit below.             ##########
##########------------------------------------------------------##########

## The name of your project (without the .c)
# TARGET = blinkLED
## Or name it automatically after the enclosing directory
TARGET = $(lastword $(subst /, ,$(CURDIR)))

# Object files: will find all .c/.h files in current directory
#  and in LIBDIR.  If you have any other (sub-)directories with code,
#  you can add them in to SOURCES below in the wildcard statement.
# SOURCES=$(wildcard *.c $(LIBDIR)/*.c)
SOURCES=$(wildcard *.c */*.c)
OBJECTS=$(SOURCES:.c=.o)
HEADERS=$(SOURCES:.c=.h)

## Compilation options, type man avr-gcc if you're curious.
CPPFLAGS = -DF_CPU=$(F_CPU) -DBAUD=$(BAUD)
CFLAGS = -Os -g -Wall -Wextra -pipe
## Use short (8-bit) data types
CFLAGS += -funsigned-char -funsigned-bitfields -fpack-struct -fshort-enums
## Splits up object files per function
CFLAGS += -ffunction-sections -fdata-sections
LDFLAGS = -Wl,-Map,$(TARGET).map
## Optional, but often ends up with smaller code
LDFLAGS += -Wl,--gc-sections
## Relax shrinks code even more, but makes disassembly messy
## LDFLAGS += -Wl,--relax
## LDFLAGS += -Wl,-u,vfprintf -lprintf_flt -lm  ## for floating-point printf
## LDFLAGS += -Wl,-u,vfprintf -lprintf_min      ## for smaller printf
TARGET_ARCH = -mmcu=$(MCU)

## Explicit pattern rules:
##  To make .o files from .c files
%.o: %.c $(HEADERS) Makefile
	 $(CC) $(CFLAGS) $(CPPFLAGS) $(TARGET_ARCH) -c -o $@ $<;

$(TARGET).elf: $(OBJECTS)
	$(CC) $(LDFLAGS) $(TARGET_ARCH) $^ $(LDLIBS) -o $@

%.hex: %.elf
	 $(OBJCOPY) -j .text -j .data -O ihex $< $@

%.eeprom: %.elf
	$(OBJCOPY) -j .eeprom --change-section-lma .eeprom=0 -O ihex $< $@

%.lst: %.elf
	$(OBJDUMP) -S $< > $@

## These targets don't have files named after them
.PHONY: all debug disassemble size clean squeaky_clean flash flash_eeprom erase avrdude_terminal fuses show_fuses

all: $(TARGET).hex

debug:
	@echo
	@echo "Source files:"   $(SOURCES)
	@echo "MCU, F_CPU, BAUD:"  $(MCU), $(F_CPU), $(BAUD)
	@echo

# Optionally create listing file from .elf
# This creates approximate assembly-language equivalent of your code.
# Useful for debugging time-sensitive bits,
# or making sure the compiler does what you want.
disassemble: $(TARGET).lst

# Optionally show how big the resulting program is
size:  $(TARGET).elf
	$(AVRSIZE) -C --mcu=$(MCU) $(TARGET).elf

clean:
	rm -f $(TARGET).elf $(TARGET).hex $(TARGET).obj \
	$(TARGET).o $(TARGET).d $(TARGET).eep $(TARGET).lst \
	$(TARGET).lss $(TARGET).sym $(TARGET).map $(TARGET)~ \
	$(TARGET).eeprom

squeaky_clean:
	rm -f *.elf *.hex *.obj *.o *.d *.eep *.lst *.lss *.sym *.map *~ *.eeprom

##########------------------------------------------------------##########
##########              Programmer-specific details             ##########
##########           Flashing code to AVR using avrdude         ##########
##########------------------------------------------------------##########

flash: $(TARGET).hex
	$(AVRDUDE) $(PROGRAMMER_ARGS) -U flash:w:$<

flash_eeprom: $(TARGET).eeprom
	$(AVRDUDE) $(PROGRAMMER_ARGS) -U eeprom:w:$<

erase:
	$(AVRDUDE) $(PROGRAMMER_ARGS) -e

avrdude_terminal:
	$(AVRDUDE) $(PROGRAMMER_ARGS) -t

##########------------------------------------------------------##########
##########       Fuse settings and suitable defaults            ##########
##########------------------------------------------------------##########

LFUSE = 0xff
HFUSE = 0x19
EFUSE = 0x00

fuses:
	$(AVRDUDE) $(PROGRAMMER_ARGS) -U lfuse:w:$(LFUSE):m -U hfuse:w:$(HFUSE):m -U efuse:w:$(EFUSE):m
show_fuses:
	$(AVRDUDE) $(PROGRAMMER_ARGS) -n -U lfuse:r:-:h -U hfuse:r:-:h -U efuse:r:-:h
```

## 外设驱动

曾经寻找到并使用过以下外设驱动，可供参考。

- [efthymios-ks/AVR-HD44780](https://github.com/efthymios-ks/AVR-HD44780)
- [naquad/AVR-DS1302](https://github.com/naquad/AVR-DS1302)
- [Jacajack/avr-ds18b20](https://github.com/Jacajack/avr-ds18b20)
- [AVR-LibC 文档示例中的 24Cxx EEPROM 驱动](https://github.com/avrdudes/avr-libc/blob/789e5aa7315a4474bcd07719e92715e09f99a3a0/doc/examples/twitest/twitest.c)
