# PPPoE 宽带接入

我首次接触到宽带上网时是非对称数字用户线路（ADSL）时代。

彼时的家庭宽带接入，需要在电话线上挂接一个小小的语音分离器，在单条入户电话线的末端分出两条线，其中一条连接到电话机，另一条连接到调制解调器（Modem，俗称“猫”）。ADSL 调制解调器是一种网络设备，它以电话线为上行接口，以太网为下行接口。彼时的 ADSL 调制解调器似乎没有内置的路由功能，无论是连接到路由器还是直接与计算机连接，都需要创建一个 PPPoE 连接。在 Windows 操作系统中，这个虚拟网络接口默认会被命名为“宽带连接”。

> [!NOTE]
>
> 下文提到的“拨号上网”是狭义上的含义，它真的在固定电话系统中向某个互联网提供商拨通语音电话，通过调制解调器将数字信号和模拟语音信号转换。它的数据传输速率非常慢，信号带宽也比较窄，所以也被称为“窄带上网”。
>
> ADSL 业务虽然也通过电话线传输信号，但它使用的信号频率和带宽比语音业务高得多。因此，上文提到的“语音分离器”也可以简单理解为一些简单的模拟信号滤波器。

点对点协议（PPP）是在拨号上网时代用于 Internet 接入的协议，它假设要建立 PPP 会话的两端是通过点对点信道连接的。以现在的观点看，它和大家熟悉的以太网同为一种二层（数据链路层）协议。可能是为了便于技术过渡、减小设备改造开销等，即使家庭 Internet 接入的物理层（线路）技术已经从最开始的拨号（Dial-up）上网升级为数字用户线路（DSL），再升级到如今的无源光网络（PON），但我们仍在大量且广泛地使用 PPP 作为终端用户的接入协议。

我们的路由器或计算机通常是通过以太网与调制解调器连接的，因此要将 PPP 数据包封装在以太网数据包中，称为以太网上的点对点协议（PPPoE）。

## 概览

通过 PPPoE 接入宽带大致会经过如下流程。

1. PPPoE 客户端通过 PPPoED 协议主动发现网络中的 PPPoE 服务器，并建立一个 PPPoE 会话。
2. PPP 客户端在上述 PPPoE 会话提供的信道建立 PPP 连接，同时完成 IP 配置。
    - 通过 PPP LCP 对链路进行基本配置。
    - 通过 PPP CCP 对数据压缩进行配置。
    - 通过 PPP PAP/CHAP 等进行身份认证。
    - 通过 PPP IPCP/IPV6CP 对接口 IP 协议栈进行配置。
3. IP 协议栈配置成功后，正常进行 IP 通信。

最后在以太网线路上看到的应用程序数据包的封装结构是这样的：以太网帧头 + PPPoE 会话头 + PPP 头 + IP 头 + 应用程序数据（TCP、UDP 等）。

主动连接断开则比较简单，在 PPP 层和 PPPoE 层先后完成断开即可。

## PPPoE 协议

在通信过程中至少会看到两种类型的 PPPoE 数据包，分别是发现数据包和会话数据包。从简单理解的角度出发，发现协议就是通过以太网本身的广播特性在整个网络中寻求服务器的响应，会话协议就是像一层胶水一样把以太网和 PPP 这两个二层协议粘在一起。

下面是一个通过 Wireshark 捕获的 PPPoED 协议确认会话建立的数据包，其中包含一个服务器分发的会话 ID。

```
Ethernet II, Src: ......, Dst: ......
PPP-over-Ethernet Discovery
    ......
    Code: Active Discovery Session-confirmation (PADS) (0x65)
    Session ID: 0x0002
    ......
```

下面是一个 PPPoE 会话数据数据包，以太网帧头和 PPP 帧头之间是 PPPoE 会话帧头，包含前述的会话 ID。

```
Ethernet II, Src: ......, Dst: ......
PPP-over-Ethernet Session
    ......
    Code: Session Data (0x00)
    Session ID: 0x0002
    ......
Point-to-Point Protocol
......
```

## PPP 协议

PPP 协议簇相对比较复杂，它包含若干子协议，例如前文提到的链路控制协议（LCP）、压缩控制协议（CCP）、密码认证协议（PAP）、挑战握手认证协议（CHAP）、IP 协议控制协议（IPCP），同时也可以以 IP 等其他协议作为有效载荷。PPP 帧头本身则非常简单，因为它已经假设工作在点对点信道上，所以帧头中无需包含源地址、目的地址等信息，仅包含有效负载的协议类型。

下面是一个 PPPoE 场景下的 PPP LCP 数据包。

```
Ethernet II, Src: ......, Dst: ......
PPP-over-Ethernet Session
Point-to-Point Protocol
    Protocol: Link Control Protocol (0xc021)
PPP Link Control Protocol
    Code: Configuration Request (1)
    Identifier: 1 (0x01)
    Length: 19
    Options: (15 bytes), Maximum Receive Unit, Authentication Protocol, Magic Number
```

下面是一个 PPPoE 场景下的 IPv6 mDNS 数据包。

```
Ethernet II, Src: ......, Dst: ......
PPP-over-Ethernet Session
Point-to-Point Protocol
    Protocol: Internet Protocol version 6 (0x0057)
Internet Protocol Version 6, Src: ......, Dst: ff02::fb
User Datagram Protocol, Src Port: 5353, Dst Port: 5353
Multicast Domain Name System (query)
```

## 无源光网络与 PPPoE

在光纤入户型的家庭宽带中，通常采用无源光网络（PON）技术，用户侧的光路终端通常是光网络单元（ONU），比调制解调器具有更多功能。对于仍在使用 PPPoE 进行宽带接入的场景，高级用户可能会推荐进行“光猫改桥接”的操作，即请运营商客服远程下发配置或自行通过特权用户登录 ONU 管理页面，将 Internet 业务接口由路由模式改为桥接模式。

“路由”和“桥接”这两个词，以及配置页面上的 VLAN ID、QoS 等配置，其实已经暴露了一个事实，ONU 本身也是一个以太网和 IP 设备，PON 链路上传输的是以太网数据帧，而不是 PPP 数据帧。既然 PON 可以直接承载以太网，而以太网又可以直接承载 IP，PPP 和 PPPoE 在这其中就显得有点“多余”了。目前部分地区已经开始采用 IPoE 技术进行家庭宽带接入，ONU 也被称为软件定义网络（SDN）网关，PPP 的身份认证职责被转移到了 DHCP 上。

IPoE 全称 Internet Protocol over Ethernet，这名字看着就像废话，毕竟我们生活中能接触到的 IP 数据包大多数都是在以太网中传输的，不过这也很好地体现了这种宽带接入技术的简洁性和高效性。期待 IPoE 能够取代 PPPoE 成为主流宽带接入技术。
