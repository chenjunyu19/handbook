# 多出口网络中的 DNS

互联网中流传着一种说法，DNS 服务器的选用会影响上网速度。我最开始觉得这不太可能，但后来确实亲身遇到了相关问题，然后想办法缓解了。

## 我的校园网

我在广州某高校生活过一段时间，全程使用校园网服务进行固定宽带接入。从生活区，到教学区，再到数据中心，这所学校的校园网均为自行建设，在物理上连接校园的各个部分，同时也向终端用户提供互联网接入服务。

这个网络是一个原生双栈网络。大部分用户终端在校园网中会得到一个 [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) 定义的私有 IPv4 地址，通常在 `172.16.0.0/12` 范围内。同时，在部分区域，终端还会得到在 `2001:250::/32` 范围内的全球单播 IPv6 地址。

另外，通过一些关系，我还得知 `10.0.0.0/8` 范围的 IPv4 地址在校园网中用于网络设备（交换机、路由器等）和数据中心。学校提供且推荐的 DNS 服务器地址也处于该范围中，在本文中假设为 `10.0.0.1` 和 `10.0.0.2`。我们暂且称校园网中的这部分子网为“设备网”，这个信息在本文后续内容中会用到。

显然，大部分校园网用户终端访问 IPv4 互联网时需要经历[网络地址转换（NAT）](https://zh.wikipedia.org/wiki/%E7%BD%91%E7%BB%9C%E5%9C%B0%E5%9D%80%E8%BD%AC%E6%8D%A2)过程，而 IPv6 互联网则为原生网络。据学校有关单位披露，互联网出口服务由三大运营商（中国电信、中国联通、中国移动）及中国教育和科研计算机网（俗称“教育网”）提供，出口带宽总和为数十 Gbps，但其中 IPv6 仅有个位数 Gbps。

据我的观察与合理推测，访问 IPv4 互联网时，网络地址转换将发生校园网的边界（校园网与互联网连接处），因为当接入校园网的位置固定时，出口流量的路由追踪结果在校园网设备网中的部分总是稳定的。根据目的 IP 地址，部分学术网站和境外网站流量会通过教育网（CERNET，[AS4538](https://bgp.he.net/AS4538)）出口，其余流量则会通过三大运营商之一出口，出口 IP 也是稳定的。

访问 IPv6 互联网则比较简单，因为是原生网络，属于 CERNET2（[AS23910](https://bgp.he.net/AS23910)）的一部分，不会经过网络地址转换。由此也可以推测，校园网的教育网出口带宽与 IPv6 出口带宽在数值上是等价的。

综合上述信息可以得到以下几条结论：

- 校园网在物理上是单张双栈网络。
- IPv4 流量一般通过三大运营商出口，少数通过教育网出口。
- IPv6 流量只能通过教育网出口。
- 教育网出口带宽总和比三大运营商出口带宽总和少一个数量级。
- IPv6 出口带宽总和比 IPv4 出口带宽总和少一个数量级。

## 校园网中的 DNS 问题

首先需要明确一条背景知识，中国大陆境内的跨运营商互联体验是比较差的，具有一定规模的网站会针对不同运营商在域名解析上进行优化，避免发生跨运营商互联。

然后举一个实际的例子，手机上的微信客户端会通过专有的 HTTP DNS 服务进行业务域名的解析。在双栈环境中，现代操作系统会优先使用 IPv6 协议栈，而微信的 HTTP DNS 服务恰好是一个双栈服务，因此在大多数情况下会通过 IPv6 连接到 HTTP DNS 进行域名解析，在前述的校园网环境中会被服务器判定运营商为教育网。根据避免跨运营商的原则，服务器应当优先返回针对教育网优化的 IP。

> [!TIP]
>
> 微信 HTTP DNS 的域名为 `dns.weixin.qq.com` 和 `dns.weixin.qq.com.cn`。
>
> 你可以在手机微信客户端中打开 `https://dnstest.weixin.qq.com` 测试解析结果。

事实上，在双栈校园网中得到的解析结果是属于“腾讯网络”的 IP，他们既不属于三大运营商，也不属于教育网，因此必然发生跨网互联。解析结果中大多数为 IPv6 地址，图片消息业务为 IPv4 地址。我们分情况讨论一下可能会遇到的问题：

- 解析得到 IPv6 地址，则必然通过教育网出口，符合线路优化目标，但可能会因校园网 IPv6 出口拥塞导致使用体验较差。
- 解析得到 IPv4 地址，被判定为使用教育网出口，符合线路优化目标，但可能会因校园网教育网出口拥塞导致使用体验较差。
- 解析得到 IPv4 地址，被判定为使用三大运营商出口，则不符合线路优化目标。

我所在的一个实验室接入了双栈校园网，使用实验室网络时有可能会遇到图片加载异常缓慢的问题。通过一些关系，我得知“腾讯网络”与三大运营商之间的网间结算费用过于高昂，因此会对三大运营商进行限速。这可能与上述问题中的最后一条匹配。

前面提到学校数据中心中提供了内部 DNS 服务器，大多数校园网终端会被自动配置为使用该服务器。然而，在不同区域接入校园网有可能会被分配到不同的互联网出口，而 DNS 服务器又是中心化部署的，也存在类似的解析结果优化问题。同时，这个 DNS 服务器还存在解析结果被污染等问题，总体上使用体验不佳。

## 着手改善

### 改善思路

其实分析下来主要矛盾就两点：

- 教育网出口带宽太小。
- 校园网 DNS 解析结果欠优化。

改善起来也比较简单：

- 避免使用 IPv6 和教育网。
- 在最终用户侧进行 DNS 解析以尽可能得到最优结果。

### 参考实现

在同学的推荐下，我选用 [SmartDNS](https://github.com/pymumu/smartdns) 在实验室网络中搭建了一个 DNS 服务器，作为实验室网络的自动配置的 DNS 服务器。它能够从多个上游 DNS 服务器查询 DNS 记录，对解析结果进行测速，然后返回最快的几个结果给客户端，实现用户侧的线路选择优化。为了实现对上述问题的改善，我将其配置为仅通过 IPv4 连接到上游服务器，并且屏蔽微信 HTTP DNS 域名的 AAAA 记录，同时指定使用校园网 DNS 解析学校域名。以下是一个参考配置，使用时应按需修改。

::: details SmartDNS 配置文件

```shell
# Connect to public DNS in IPv4 only due to poor IPv6 performance

#server-tls dns.alidns.com
server-tls 223.5.5.5
server-tls 223.6.6.6
#server-https https://dns.alidns.com/dns-query
server-https https://223.5.5.5/dns-query
server-https https://223.6.6.6/dns-query

#server-tls dot.pub
server-tls 1.12.12.12
server-tls 1.12.12.21
#server-https https://doh.pub/dns-query
server-https https://1.12.12.12/dns-query
server-https https://1.12.12.21/dns-query

#server-tls cloudflare-dns.com
server-tls ipv4.cloudflare-dns.com
server-tls 1.1.1.1
server-tls 1.0.0.1
#server-https https://cloudflare-dns.com/dns-query
server-https https://ipv4.cloudflare-dns.com/dns-query
server-https https://1.1.1.1/dns-query
server-https https://1.0.0.1/dns-query

#server-tls dns.quad9.net
server-tls 9.9.9.9
server-tls 149.112.112.112
#server-https https://dns.quad9.net/dns-query
server-https https://9.9.9.9/dns-query
server-https https://149.112.112.112/dns-query

#server-tls dns.google
server-tls 8.8.8.8
server-tls 8.8.4.4
#server-https https://dns.google/dns-query
server-https https://8.8.8.8/dns-query
server-https https://8.8.4.4/dns-query

# Use Local DNS to query XXX.edu.cn
server 10.0.0.1 -group local -exclude-default-group
server 10.0.0.2 -group local -exclude-default-group
nameserver /XXX.edu.cn/local

# Weixin uses its own HTTP DNS. Block its IPv6.
address /dns.weixin.qq.com/#6
address /dns.weixin.qq.com.cn/#6

# Block HTTPS record
https-record #

prefetch-domain yes
dualstack-ip-selection no
```

:::

其实按照这种方法实现又会引入一个问题，解析结果中的 AAAA 记录的优化目标（三大运营商）与实际路由（教育网）不匹配。不过，IPv6 教育网是一张独立的网络 CERNET2，与 IPv4 教育网 CERNET 相比，与其他运营商的互联更高效。所以这种实现方法在总体上是利大于弊的。

### 改善结果

微信 HTTP DNS 域名解析结果中不含 AAAA 记录，并且 A 记录被优选到了地理位置最近的结果。

::: code-group

```shellsession [自建 DNS]
$ ahost -s 192.168.1.1 dns.weixin.qq.com | sed -E 's/\s+/ /g' | nali
dns.weixin.qq.com 120.233.23.103 [中国–广东 移动]
dns.weixin.qq.com 120.232.51.247 [中国–广东–广州 移动]
```

```shellsession [校园网 DNS]
$ ahost -s 10.0.0.1 dns.weixin.qq.com | sed -E 's/\s+/ /g' | nali
dns.weixin.qq.com 2409:8c54:871:3053::ac [中国  广东省  广州市 中国移动IDC]
dns.weixin.qq.com 2409:8702:4860:1001::5c [中国 天津市 中国移动政企专线]
dns.weixin.qq.com 2409:8702:4860:1000::15 [中国 天津市 中国移动政企专线]
dns.weixin.qq.com 2409:8c00:8401:1003::d [中国  北京市  大兴区 中国移动IDC]
dns.weixin.qq.com 2409:8c00:8401:1000::27 [中国 北京市  大兴区 中国移动IDC]
dns.weixin.qq.com 2409:8c54:871:2005::4e [中国  广东省  广州市 中国移动IDC]
dns.weixin.qq.com 111.31.201.194 [中国–天津–天津 移动]
dns.weixin.qq.com 39.156.140.245 [中国–北京–北京 移动]
dns.weixin.qq.com 39.156.140.30 [中国–北京–北京 移动]
dns.weixin.qq.com 39.156.140.47 [中国–北京–北京 移动]
dns.weixin.qq.com 120.232.51.247 [中国–广东–广州 移动]
dns.weixin.qq.com 120.233.23.103 [中国–广东 移动]
dns.weixin.qq.com 111.31.241.76 [中国–天津–天津 移动]
dns.weixin.qq.com 111.31.241.140 [中国–天津–天津 移动]
```

:::

个别会被学校 DNS 解析到教育网的普通网站，则能够变为解析到 IPv4 出口对应的三大运营商，并且地理位置更近。

::: code-group

```shellsession [自建 DNS]
$ ahost -s 192.168.1.1 www.bilibili.com | sed -E 's/\s+/ /g' | nali
a.w.bilicdn1.com 2409:8c54:1841:2002::20 [中国  广东省  东莞市 中国移动IDC]
a.w.bilicdn1.com 2409:8c54:1841:2002::22 [中国  广东省  东莞市 中国移动IDC]
a.w.bilicdn1.com 2409:8c54:4840:700::14 [中国   广东省  江门市 中国移动IDC]
a.w.bilicdn1.com 2409:8c54:1841:2002::17 [中国  广东省  东莞市 中国移动IDC]
a.w.bilicdn1.com 2409:8c54:4840:700::13 [中国   广东省  江门市 中国移动IDC]
a.w.bilicdn1.com 183.232.239.21 [中国–广东–东莞 移动]
a.w.bilicdn1.com 183.232.239.19 [中国–广东–东莞 移动]
a.w.bilicdn1.com 183.232.239.20 [中国–广东–东莞 移动]
a.w.bilicdn1.com 183.232.239.22 [中国–广东–东莞 移动]
a.w.bilicdn1.com 183.232.239.18 [中国–广东–东莞 移动]
a.w.bilicdn1.com 120.240.224.14 [中国–广东–揭阳 移动]
```

```shellsession [校园网 DNS]
$ ahost -s 10.0.0.1 www.bilibili.com | sed -E 's/\s+/ /g' | nali
a.w.bilicdn1.com 240c:c0a9:100d::3 [中国        北京市 教育网(CERNET)]
a.w.bilicdn1.com 240c:c0a9:100d::2 [中国        北京市 教育网(CERNET)]
a.w.bilicdn1.com 121.194.11.73 [中国–北京–北京 教育网/CERNET数据中心VIP通道项目]
a.w.bilicdn1.com 121.194.11.72 [中国–北京–北京 教育网/CERNET数据中心VIP通道项目]
```

:::

::: code-group

```shellsession [自建 DNS]
$ ahost -s 192.168.1.1 autopatchcn.yuanshen.com | sed -E 's/\s+/ /g' | nali
ty-yuanshen.sched.dma-dk.tdnsdl1.cn 2409:8c54:2030:20c:62::17 [中国     广东省  佛山市 中国移动IDC]
ty-yuanshen.sched.dma-dk.tdnsdl1.cn 2409:8c54:810:840::3e [中国 广东省  广州市 中国移动IDC]
ty-yuanshen.sched.dma-dk.tdnsdl1.cn 120.240.38.189 [中国–广东–佛山 移动]
ty-yuanshen.sched.dma-dk.tdnsdl1.cn 120.232.59.253 [中国–广东–广州 移动]
ty-yuanshen.sched.dma-dk.tdnsdl1.cn 120.240.38.190 [中国–广东–佛山 移动]
```

```shellsession [校园网 DNS]
$ ahost -s 10.0.0.1 autopatchcn.yuanshen.com | sed -E 's/\s+/ /g' | nali
autopatchcn.yuanshen.com.wsdvs.com [网宿 CDN]  2001:da8:2032:1001::2 [中国      广东省    广州市  天河区 华南理工大学CERNET华南地区网络中心]
autopatchcn.yuanshen.com.wsdvs.com [网宿 CDN]  222.200.254.73 [中国–广东–广州 教育网/大学城网络互联汇接中心]
```

:::
