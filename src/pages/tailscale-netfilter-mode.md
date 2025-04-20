# Tailscale 的 netfilter 规则与 CGNAT IP

运营商级 NAT（Carrier-grade NAT，CGNAT）是互联网运营商实施的 NAT，常见于中国大陆地区家用宽带，表现为 PPPoE 等宽带接入接口上被分配了一个 `100.64.0.0/10` 范围内的 IPv4 地址，而不是全球 IPv4 地址。Tailscale [也使用](https://tailscale.com/kb/1015/100.x-addresses)这一范围内的 IPv4 地址，作为 Tailnet 中的主机的 Tailscale IP。

## netfilter 规则

> [!NOTE]
>
> 撰写此部分时 Tailscale 版本为 1.82.5。

[netfilter](https://netfilter.org/) 是 Linux 内核中用于过滤网络数据包的软件，俗称防火墙。Linux 下的 Tailscale 客户端会在系统中添加防火墙规则。可以通过 `nft list ruleset` 命令查看当前系统中的 netfilter 规则。或者使用 `iptables -L` 命令查看当前系统中的 iptables 规则，如果你更喜欢，尽管在内核中仍然以 netfilter 规则的形式存在。

容易发现，Tailscale 在系统中添加了以下规则。输出内容经过精简。

```log
# Warning: table ip filter is managed by iptables-nft, do not touch!
table ip filter {
        chain ts-input {
                ip saddr 100.64.0.0/10 iifname != "tailscale0" counter drop
        }
        chain ts-forward {
                ip saddr 100.64.0.0/10 oifname "tailscale0" counter drop
        }
}
```

所以，如果没有其他优先级更高的规则干预，所有源地址在 `100.64.0.0/10` 范围内且入站/出站接口不为 Tailscale 虚拟接口（TUN 设备）的 IPv4 数据包将被丢弃。

## 问题

在某些环境中，例如公有云，服务商会使用 CGNAT IP 提供内部服务。显然，上面展示的防火墙规则会导致安装有 Tailscale 客户端的主机无法使用这些服务。一个典型的案例是阿里云的 ECS，它在操作系统中配置的默认 DNS 可能是 `100.100.2.136` 和 `100.100.2.138`。

## 解决方法

既然已经得知了问题产生的根源，解决就是一件相对比较简单的事情了。有很多方法，下面是一些例子，选择合适自己的即可。

1. 将 Tailscale 客户端的 `--netfilter-mode` 参数设为 `off`，令其不要在系统中添加相关防火墙规则。在这种情况下，需要自行配置防火墙规则来保护主机和 Tailnet。有关该选项的更多信息，可以参考 [Tailscale 文档](https://tailscale.com/kb/1241/tailscale-up)。
2. 添加额外的防火墙规则，对来自特定的内部服务 IP 的数据包进行放行。
3. 将 Tailscale 调整为[用户空间网络模式](https://tailscale.com/kb/1112/userspace-networking)。
