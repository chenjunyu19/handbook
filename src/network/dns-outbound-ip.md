# DNS 的出口 IP

运营商的 Local DNS 以及互联网上公共的 Public DNS 看起来只有少数几个 IP，通常是 Anycast IP。响应用户请求的可能是缓存服务器，实际进行递归查询的可能是专门的递归服务器。

之前在网上看到了一些提供排障信息的 DNS 权威服务，记录一下。可以通过查询这些域名来获取递归 DNS 出口相关信息。

## DNSPod

支持查询 A、AAAA、TXT 类型记录，包含 ECS 信息。

```
whoami.ip.dnspod.net.
```

## Akamai

有个仅支持查询 A、AAAA 记录的旧域名。

```
whoami.akamai.net.
```

还有一组仅支持查询 TXT 记录的新域名，包含 ECS 信息。

```
whoami.ds.akahelp.net.
whoami.ipv4.akahelp.net.
whoami.ipv6.akahelp.net.
```

## Google

仅支持查询 TXT 记录，包含 ECS 信息。

```
o-o.myaddr.l.google.com.
```
