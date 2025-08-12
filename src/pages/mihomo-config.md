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

## 附录

### Geo 数据库

GeoIP 一词狭义上是指 MaxMind 的商业产品 GeoIP，是一个 IP 地址和地理位置的关系的数据库。MaxMind 提供 GeoIP 数据的免费版本 GeoLite，下载得到的数据库格式是 `.mmdb`，这就是 `Country.mmdb` 文件的由来。

GeoSite 则是一个类似的概念，是一个域名分类数据库。虽然它名字里带有 Geo，并且一般的用途也是区分站点的地理位置，但是它也不仅仅按照地理位置对域名进行分类。GeoSite 数据库的最初来源应该是 [v2fly/domain-list-community](https://github.com/v2fly/domain-list-community)，数据库文件扩展名是毫无意义的 `.dat`。

「虚空终端」虽然也沿用了 GeoIP 和 GeoSite 这些数据库文件的用法，但其数据源已不是他们最初定义的来源了。「虚空终端」默认的 Geo 数据下载源是 [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat)，其自述文件表明是在 [Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat) 的基础上引入了新的数据源，而 v2ray-rules-dat 又是由多个数据源整合而来，所以从源头查询数据库内容并不合适。meta-rules-dat 中除了提供构建好的二进制数据库文件，还提供各个分类的纯文本列表，发布于 [`meta`](https://github.com/MetaCubeX/meta-rules-dat/tree/meta) 分支中，很适合用来查询最终用到的 Geo 数据库里的内容。

为什么我的规则中包含几个特殊的 `@cn` 或 `-cn` 后缀的条目呢？因为部分站点从法律实体上看属于境外网站，即 `geolocation-!cn`，但是在境内解析他们时，又会得到境内的接入点。这些条目就是令这些特殊的站点直接连接到境内接入点，而不是通过代理连接到境外接入点。具体可以阅读 meta-rules-dat 和 v2ray-rules-dat 的自述文件。

### 透明代理与 DNS 解析器

在使用「虚空终端」时，如果是通过设置应用程序或操作系统，将「虚空终端」设为 HTTP 或 SOCKS 代理服务器，则是常规的代理模式，工作在「应用层」。若应用程序会主动使用这些设置，事情会比较简单，并且应用程序会直接将域名作为代理访问目标。

但是，在某些特殊的情况下，比如无法设置应用程序使用代理服务器，或希望在局域网网关上进行代理，则会用到一种被称为透明代理的技术。透明代理工作在单台计算机内时，也被称为 TUN 模式、虚拟网卡模式，会在操作系统中创建一个 TUN 网络接口（设备），并可选地通过路由规则将大部分 IP 地址路由到该网络接口上，数据包最终会进入到「虚空终端」中。透明代理工作在网关时，通常会搭配 Linux 内核使用，通过内核的 netfilter 框架和 tproxy 模块，将 TCP/UDP 流量重定向到「虚空终端」的 tproxy 入站端口上。

无论是通过 TUN 设备还是 tproxy 协议，「虚空终端」能够准确且可靠地获取到的信息最多只能到「传输层」，或者更确切地说是 TCP 和 UDP 数据包。为了使域名规则能够生效，必须要有一种方法，在建立新连接时能够知道该连接目的地的域名，而不是 IP。常用的一种方法是假 IP 技术，它会配合一个特殊的 DNS 服务器一起使用。另一种方法是嗅探器，它通过对常见协议（HTTP、TLS、QUIC）的常见端口上的数据进行模式匹配，提取出数据流在「应用层」中的域名信息，但是并不完全可靠和准确。

#### 假 IP 模式

假 IP 模式下的「虚空终端」DNS 服务器会对任意域名（实际上取决于具体配置）返回一个特定范围内的 IP 地址（通常是 `198.18.0.0/16`），并在程序内部维护一个域名—假 IP 的双射关系。这使得：一、客户端针对同一域名发起的请求总是为一个固定的假 IP；二、「虚空终端」从 TUN 接口上接收到数据包后可以直接将目的 IP 地址准确映射为目的域名来建立连接。

你可能会注意到配置文件中有一项名为 `fake-ip-filter` 的配置，默认的黑名单模式下会使其中的域名的解析结果为真实 IP 而不是假 IP。但在撰写本部分时，「虚空终端」的逻辑会在启用了 DNS 组件并且不为 `DNSNormal` 模式时加载 IP 到域名的映射逻辑，自动将 IP 地址映射为其曾经被解析的域名，无论是否为假 IP。这其实是有问题的，因为真实网络中存在多个域名解析到同一 IP 的情况，在使用了边缘加速技术的站点上尤其常见。所以，在该逻辑没有被修改的情况下，使用假 IP 模式时应当尽可能不要在 `fake-ip-filter` 中填入内容，避免回落到 `DNSMapping` 模式的行为中。可能填上 `geosite:private` 就足够了。

::: details 相关逻辑代码摘抄

[`dns/enhancer.go#L17-L23 (5f1f296)`](https://github.com/MetaCubeX/mihomo/blob/5f1f296213550c34fb098e07e82e8463f6833e95/dns/enhancer.go#L17-L23)

```go
func (h *ResolverEnhancer) FakeIPEnabled() bool {
	return h.mode == C.DNSFakeIP
}


func (h *ResolverEnhancer) MappingEnabled() bool {
	return h.mode == C.DNSFakeIP || h.mode == C.DNSMapping
}
```

[`dns/enhancer.go#L61-L75 (5f1f296)`](https://github.com/MetaCubeX/mihomo/blob/5f1f296213550c34fb098e07e82e8463f6833e95/dns/enhancer.go#L61-L75)

```go
func (h *ResolverEnhancer) FindHostByIP(ip netip.Addr) (string, bool) {
	if pool := h.fakePool; pool != nil {
		if host, existed := pool.LookBack(ip); existed {
			return host, true
		}
	}


	if mapping := h.mapping; mapping != nil {
		if host, existed := h.mapping.Get(ip); existed {
			return host, true
		}
	}


	return "", false
}
```

[`dns/enhancer.go#L106-L120 (5f1f296)`](https://github.com/MetaCubeX/mihomo/blob/5f1f296213550c34fb098e07e82e8463f6833e95/dns/enhancer.go#L106-L120)

```go
func NewEnhancer(cfg Config) *ResolverEnhancer {
	var fakePool *fakeip.Pool
	var mapping *lru.LruCache[netip.Addr, string]

	if cfg.EnhancedMode != C.DNSNormal {
		fakePool = cfg.Pool
		mapping = lru.New(lru.WithSize[netip.Addr, string](4096))
	}

	return &ResolverEnhancer{
		mode:     cfg.EnhancedMode,
		fakePool: fakePool,
		mapping:  mapping,
	}
}
```

[`dns/middleware.go#L221-L237 (5f1f296)`](https://github.com/MetaCubeX/mihomo/blob/5f1f296213550c34fb098e07e82e8463f6833e95/dns/middleware.go#L221-L237)

```go
func NewHandler(resolver *Resolver, mapper *ResolverEnhancer) handler {
	middlewares := []middleware{}


	if resolver.hosts != nil {
		middlewares = append(middlewares, withHosts(R.NewHosts(resolver.hosts), mapper.mapping))
	}


	if mapper.mode == C.DNSFakeIP {
		middlewares = append(middlewares, withFakeIP(mapper.fakePool))
	}


	if mapper.mode != C.DNSNormal {
		middlewares = append(middlewares, withMapping(mapper.mapping))
	}


	return compose(middlewares, withResolver(resolver))
}
```

[`tunnel/tunnel.go#L301-L330 (5f1f296)`](https://github.com/MetaCubeX/mihomo/blob/5f1f296213550c34fb098e07e82e8463f6833e95/tunnel/tunnel.go#L301-L330)

```go
func needLookupIP(metadata *C.Metadata) bool {
	return resolver.MappingEnabled() && metadata.Host == "" && metadata.DstIP.IsValid()
}


func preHandleMetadata(metadata *C.Metadata) error {
	// preprocess enhanced-mode metadata
	if needLookupIP(metadata) {
		host, exist := resolver.FindHostByIP(metadata.DstIP)
		if exist {
			metadata.Host = host
			metadata.DNSMode = C.DNSMapping
			if resolver.FakeIPEnabled() {
				metadata.DstIP = netip.Addr{}
				metadata.DNSMode = C.DNSFakeIP
			} else if node, ok := resolver.DefaultHosts.Search(host, false); ok {
				// redir-host should lookup the hosts
				metadata.DstIP, _ = node.RandIP()
			} else if node != nil && node.IsDomain {
				metadata.Host = node.Domain
			}
		} else if resolver.IsFakeIP(metadata.DstIP) {
			return fmt.Errorf("fake DNS record %s missing", metadata.DstIP)
		}
	} else if node, ok := resolver.DefaultHosts.Search(metadata.Host, true); ok {
		// try use domain mapping
		metadata.Host = node.Domain
	}


	return nil
}
```

:::

#### DNS 污染

任何跨越中国大陆边境的 UDP 53 DNS 请求都有可能受到污染，具体可以参考[这篇文章](https://www.assetnote.io/resources/research/insecurity-through-censorship-vulnerabilities-caused-by-the-great-firewall)。因此，直接在境内解析境外站点的 IP 并作为最终目的访问是不安全的。对于所有需要通过代理出战的请求，都应当尽可能使用域名作为目的地。

「虚空终端」内置的 DNS 解析器对这种情况可以特殊处理。

#### 嗅探器

在不使用假 IP 模式，又想使用透明代理时，可以使用嗅探器提取「应用层」数据中包含的域名信息，并用提取到的域名覆盖连接目的地。它的[配置](https://wiki.metacubex.one/config/sniff/)非常简单，只需要指定需要嗅探的协议，以及可选的触发端口。有些域名不应当被视作合法的嗅探结果，应当进行忽略，比如米家设备通常会将 TLS 的 SNI 设为 `Mijia Cloud`。

```yaml
sniffer:
  enable: true
  sniff:
    TLS: {}
    HTTP: {}
    QUIC: {}
  skip-domain:
    - Mijia Cloud
```

#### DNS 配置

我认为，当且仅当需要使用假 IP 模式或 `fallback-filter` 功能时，才应当启用「虚空终端」内置的 DNS 解析器。

DNS 配置中有多种 DNS 解析器列表，可以先看一看[文档](https://wiki.metacubex.one/config/dns/)。其中 `fallback-filter` 功能较难理解，这里用通俗的方式解释一下。`fallback-filter` 的内容定义了什么情况下解析结果可能会被污染，默认配置是 GeoIP 归属不为 `CN` 的结果。若被判断为可能会被污染，则只会采用 `fallback` 中的 DNS 解析器给出的结果。所以文档中推荐 `fallback` 使用境外 DNS 解析器，确保结果不被污染。其实还漏了一点，应当使用加密协议进行请求。

本文开始提到「虚空终端」程序中硬编码了一份默认配置，通过下面的配置可以让它先恢复为一个看起来尽可能正常的本地 DNS 解析器，也可以用于在 GUI 客户端中覆盖服务商提供的订阅配置。也可以将两个包含 `system` 的列表替换为你喜爱的 DNS 解析器列表。

```yaml
dns:
  enable: true
  ipv6: true
  enhanced-mode: normal
  default-nameserver:
    - system
  nameserver:
    - system
  fallback: [] # 按需填写
```
