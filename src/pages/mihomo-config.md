# 「虚空终端」配置指南

「[虚空终端](https://github.com/MetaCubeX/mihomo/tree/Meta)」是一款基于规则的代理软件。本页面将讲述如何从零开始编写「虚空终端」配置，不依赖常规的图形用户界面客户端。

一般通过编写 `config.yaml` 文件来配置「虚空终端」，若不熟悉 YAML 可以阅读[文档](https://wiki.metacubex.one/handbook/syntax/)学习。

下面会给出一些配置的**片段**，他们不是完整的配置，读者应当根据实际需求拼接和构造自己的配置。

## 默认配置

「虚空终端」会将用户配置与硬编码的默认配置合并，编写配置时应当注意，也可加以利用。默认配置可以通过查询对应版本的 `config/config.go` 源文件得到。为了便于阅读，下面提供了一份默认配置的摘抄，可供参考。

::: details 摘抄

[`config/config.go#L449-L567 (5b97527)`](https://github.com/MetaCubeX/mihomo/blob/5b975275f527c621520622df747ab8efc2a61ddd/config/config.go#L449-L567)

```go
func DefaultRawConfig() *RawConfig {
	return &RawConfig{
		AllowLan:          false,
		BindAddress:       "*",
		LanAllowedIPs:     []netip.Prefix{netip.MustParsePrefix("0.0.0.0/0"), netip.MustParsePrefix("::/0")},
		IPv6:              true,
		Mode:              T.Rule,
		GeoAutoUpdate:     false,
		GeoUpdateInterval: 24,
		GeodataMode:       geodata.GeodataMode(),
		GeodataLoader:     "memconservative",
		UnifiedDelay:      false,
		Authentication:    []string{},
		LogLevel:          log.INFO,
		Hosts:             map[string]any{},
		Rule:              []string{},
		Proxy:             []map[string]any{},
		ProxyGroup:        []map[string]any{},
		TCPConcurrent:     false,
		FindProcessMode:   P.FindProcessStrict,
		GlobalUA:          "clash.meta/" + C.Version,
		ETagSupport:       true,
		DNS: RawDNS{
			Enable:         false,
			IPv6:           false,
			UseHosts:       true,
			UseSystemHosts: true,
			IPv6Timeout:    100,
			EnhancedMode:   C.DNSMapping,
			FakeIPRange:    "198.18.0.1/16",
			FallbackFilter: RawFallbackFilter{
				GeoIP:     true,
				GeoIPCode: "CN",
				IPCIDR:    []string{},
				GeoSite:   []string{},
			},
			DefaultNameserver: []string{
				"114.114.114.114",
				"223.5.5.5",
				"8.8.8.8",
				"1.0.0.1",
			},
			NameServer: []string{
				"https://doh.pub/dns-query",
				"tls://223.5.5.5:853",
			},
			FakeIPFilter: []string{
				"dns.msftnsci.com",
				"www.msftnsci.com",
				"www.msftconnecttest.com",
			},
			FakeIPFilterMode: C.FilterBlackList,
		},
		NTP: RawNTP{
			Enable:        false,
			WriteToSystem: false,
			Server:        "time.apple.com",
			Port:          123,
			Interval:      30,
		},
		Tun: RawTun{
			Enable:              false,
			Device:              "",
			Stack:               C.TunGvisor,
			DNSHijack:           []string{"0.0.0.0:53"}, // default hijack all dns query
			AutoRoute:           true,
			AutoDetectInterface: true,
			Inet6Address:        []netip.Prefix{netip.MustParsePrefix("fdfe:dcba:9876::1/126")},
		},
		TuicServer: RawTuicServer{
			Enable:                false,
			Token:                 nil,
			Users:                 nil,
			Certificate:           "",
			PrivateKey:            "",
			Listen:                "",
			CongestionController:  "",
			MaxIdleTime:           15000,
			AuthenticationTimeout: 1000,
			ALPN:                  []string{"h3"},
			MaxUdpRelayPacketSize: 1500,
		},
		IPTables: RawIPTables{
			Enable:           false,
			InboundInterface: "lo",
			Bypass:           []string{},
			DnsRedirect:      true,
		},
		Experimental: RawExperimental{
			// https://github.com/quic-go/quic-go/issues/4178
			// Quic-go currently cannot automatically fall back on platforms that do not support ecn, so this feature is turned off by default.
			QUICGoDisableECN: true,
		},
		Profile: RawProfile{
			StoreSelected: true,
		},
		GeoXUrl: RawGeoXUrl{
			Mmdb:    "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.metadb",
			ASN:     "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb",
			GeoIp:   "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat",
			GeoSite: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
		},
		Sniffer: RawSniffer{
			Enable:          false,
			Sniff:           map[string]RawSniffingConfig{},
			ForceDomain:     []string{},
			SkipDomain:      []string{},
			Ports:           []string{},
			ForceDnsMapping: true,
			ParsePureIp:     true,
			OverrideDest:    true,
		},
		ExternalUIURL: "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",
		ExternalControllerCors: RawCors{
			AllowOrigins:        []string{"*"},
			AllowPrivateNetwork: true,
		},
	}
}
```

:::

## 全局配置

这一部分较为简单，就不详细讲述了，可以参考[文档](https://wiki.metacubex.one/config/general/)。

一个最小配置只需要配置一个入站端口。这里配置了一个混合入站端口绑定到本机的 7890 端口上，它可以接收 HTTP 和 SOCKS 两种代理协议的请求。它接收到入站连接后会直接出站，即实现了一个最基本的代理服务器。

```yaml
mixed-port: 7890
```

该端口默认仅在本机上可用，若需要对外开放，可以配置为允许局域网。

```yaml
allow-lan: true
```

为了能够在「虚空终端」运行时观察它的状态并进行控制，需要监听一个 RESTful API 端点。这里只监听在了本地，可以根据需要修改为特定地址或 `0.0.0.0`。最好设置一个 API 访问密钥，避免运行时配置受到恶意篡改。

```yaml
external-controller: "127.0.0.1:9090"
secret: API 访问密钥
```

> [!TIP]
>
> 可以通过生成一个 UUID 来获得高安全强度的随机密钥。
>
> 可以通过 [metacubexd](https://github.com/metacubex/metacubexd)、[yacd](https://github.com/MetaCubeX/Yacd-meta)、[zashboard](https://github.com/Zephyruso/zashboard) 等网页仪表盘来使用这个 RESTful API 端点。

后面我们会利用 GeoIP 和 GeoSite 数据库编写规则，在这里设置 GeoIP 数据库为 `dat` 格式，并启用数据库自动更新。

```yaml
geodata-mode: true
geo-auto-update: true
```

## 订阅出站代理

手工编写出站代理配置不在讨论范围内，因为我相信有相关需求的读者已有足够的能力。

通常用户会在第三方处进行订阅，得到一个配置文件链接，在这里可以配置为[代理集合](https://wiki.metacubex.one/config/proxy-providers/)来使用。以下是一个示例，被注释掉的部分可以按需取消注释来使用。

```yaml
proxy-providers:
  订阅1:
    type: http
    url: "https://example.com/link/INVALID?clash=1"
    # path: proxy/订阅1.yaml
    # interval: 86400
    # proxy: DIRECT
    # health-check:
    #   enable: true
    #   interval: 300
    #   url: "https://www.gstatic.com/generate_204"
    # override:
    #   additional-prefix: "订阅1 - "
    #   ip-version: ipv4-prefer
  订阅2:
    # （类推，同上）
```

## 创建代理组

[代理组](https://wiki.metacubex.one/config/proxy-groups/)能够将一个或多个出站代理归入一组，并以某种方式选定其中一个出站代理作为该代理组实际指向的出站代理。下面创建了一个名为 `PROXY` 的手动选择代理组，它包含了所有的出站代理，并将额外引入了一个特殊的[内置](https://wiki.metacubex.one/config/proxies/built-in/) 出站代理 `DIRECT`。用户需要通过 RESTful API 在「虚空终端」运行时选择自己心仪的出站代理。

```yaml
proxy-groups:
  - name: PROXY
    type: select
    proxies:
      - DIRECT
    include-all: true
```

## 编写路由规则

[路由规则](https://wiki.metacubex.one/config/rules/)能够决定每一个入站连接如何出站，按照从上到下（从前到后）的顺序匹配，一旦匹配成功则会立即出站，不再继续匹配。

### 基础规则

一个最简单的规则是这样的，它会使所有入站连接都通过上面配置的代理组出站。`MATCH` 无条件匹配成功，`PROXY` 是出站目标（出站代理或代理组）。

```yaml
rules:
  - MATCH,PROXY
```

通常，我们需要使私有 IP 和中国大陆 IP 直连（直接在本机出站，不再显式通过任何代理服务器），可以前置两条 GeoIP 规则。

```yaml
rules:
  - GEOIP,private,DIRECT
  - GEOIP,cn,DIRECT
  - MATCH,PROXY
```

现在，「虚空终端」会令目的 IP 是私有 IP 或中国大陆 IP 的连接直接出站，其余连接则通过代理出站。

### 域名解析与规则匹配

通过 HTTP 和 SOCKS 入站的连接的目的通常是域名，为了使 GeoIP 规则生效，「虚空终端」会将域名解析为 IP 地址，这有可能会导致一个常见问题。例如，许多运营商 DNS 会对 `raw.githubusercontent.com` 进行污染，将其解析到 `0.0.0.0` 或 `127.0.0.1`，使该域名在规则匹配时成功匹配 GeoIP `private` 规则，直连出站，导致路由不符合预期。

不解析域名就能够成功匹配上路由规则是解决该问题的常用方法。为此，我们仿照上面的 GeoIP 规则，编写 GeoSite 规则并前置，使目的地是中国大陆境外网站的域名的连接通过代理出站，使目的地是私有网络或中国大陆境内网站的域名的连接直接出站。

```yaml
rules:
  - GEOSITE,private,DIRECT
  - GEOSITE,geolocation-!cn,PROXY
  - GEOSITE,cn,DIRECT
  - GEOIP,private,DIRECT
  - GEOIP,cn,DIRECT
  - MATCH,PROXY
```

> [!TIP]
>
> 部分网站在中国大陆境内外都有站点，这使得部分域名既被归属为境内网站也被归属为境外网站，例如哔哩哔哩国际版（`bilibili.tv`）。对于这种情况，通常会优先匹配为境外网站，即 `GEOSITE,geolocation-!cn` 在 `GEOSITE,cn` 之前。可以根据偏好和实际需要调整顺序。

完成！现在已经编写好了一份既简洁又实用的路由规则。

### 我正在使用的规则

如果你将「虚空终端」作为全局代理并且保持开启，我更建议使用下面的规则。这是我个人正在使用的规则。如果有兴趣，可以阅读附录中对 Geo 数据库的解读。

```yaml
rules:
  - GEOSITE,private,DIRECT
  - GEOSITE,apple-cn,DIRECT
  - GEOSITE,apple@cn,DIRECT
  - GEOSITE,google-cn,DIRECT
  - GEOSITE,google@cn,DIRECT
  - GEOSITE,microsoft@cn,DIRECT
  - GEOSITE,steam@cn,DIRECT
  - GEOSITE,category-games@cn,DIRECT
  - GEOSITE,geolocation-!cn,PROXY
  - GEOSITE,cn,DIRECT
  - GEOSITE,geolocation-cn,DIRECT
  - GEOIP,private,DIRECT
  - GEOIP,cn,DIRECT
  - MATCH,PROXY
```
