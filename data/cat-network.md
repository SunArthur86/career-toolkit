# 网络协议

> 共 17 题

## 1. TCP三次握手和四次挥手？

> **难度**: medium | **分类**: 网络协议 | **ID**: 31

#### 🎯 本质
三次握手建立连接，四次挥手断开连接，保证可靠传输。

#### 🧒 类比
三次握手像打电话：A:"喂，听得到吗？"→B:"听到了，你呢？"→A:"我也听到了，说吧！"

#### 📊 三次握手
客户端           服务端
|---SYN------->|  ①客户端发起连接
||  ③客户端确认
|===连接建立===|
#### 📊 四次挥手
客户端           服务端
|---FIN------->|  ①客户端请求关闭
||  ④客户端确认
|==等2MSL=====|  确保对方收到ACK
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
HTTP/3在这方面有什么改进？

---
## 2. HTTP/1.1 vs HTTP/2 vs HTTP/3？

> **难度**: medium | **分类**: 网络协议 | **ID**: 32

#### 🎯 本质
HTTP协议经历了三次重大演进：**HTTP/1.1**是文本协议，存在队头阻塞问题；**HTTP/2**引入二进制帧和多路复用；**HTTP/3**抛弃TCP改用基于UDP的QUIC协议，彻底解决传输层队头阻塞。

#### 🧒 类比
HTTP/1.1像单车道公路（一辆车堵了全堵），HTTP/2像多车道高速公路（并行跑），HTTP/3像修了条新路连堵车的根因都解决了。

#### 📊 图解
HTTP/1.1:
  文本协议 | 队头阻塞 | 最多6个TCP连接
  每个请求独占一个连接

HTTP/2:
  二进制帧 | 多路复用 | 头部HPACK压缩
  服务端推送(Server Push)
  一个TCP连接上并行多个流
  ⚠️ TCP层仍有队头阻塞

HTTP/3(QUIC):
  基于UDP | 0-RTT建连 | 连接迁移
  内置TLS 1.3 | 无TCP队头阻塞
  数据包独立编号(非字节流)
#### 🔧 详解
HTTP/2的核心改进是**二进制分帧层**：将请求/响应分割为更小的帧，交错发送，实现多路复用。头部压缩用HPACK算法（静态表+动态表+哈夫曼编码）。HTTP/3的QUIC在用户态实现了可靠传输+拥塞控制，每个流独立，一个丢包只影响对应流。QUIC还支持**连接迁移**（WiFi切4G不断连），因为连接ID不依赖IP+端口。

#### 💻 代码
// 检测协议支持
// HTTP/2: 浏览器自动协商(ALPN)
// 需要HTTPS

// HTTP/3 Alt-Svc响应头
// 服务端返回:
Alt-Svc: h3=":443"; ma=86400
// 浏览器下次请求自动用HTTP/3

// Node.js启用HTTP/2
const http2 = require("http2");
const server = http2.createSecureServer({
  key, cert
});
server.on("stream", (stream, headers) => {
  stream.respond({":status": 200});
  stream.end("Hello HTTP/2");
});
#### ❓ 追问
HTTP/2的服务端推送为什么现在不推荐了？答：浏览器缓存难以预测，推送可能浪费带宽。替代方案是preload链接头。QUIC为什么基于UDP而非新建协议？答：UDP在现有网络设备中通用性好，无需中间设备升级。

---
## 3. CDN是什么？工作原理？

> **难度**: medium | **分类**: 网络协议 | **ID**: 83

#### 🎯 本质
CDN（Content Delivery Network，内容分发网络）是一组分布在不同地理位置的服务器群，通过将内容缓存到离用户最近的**边缘节点**，大幅降低访问延迟和源站压力。

#### 🧒 类比
CDN像连锁便利店——总部（源站）只负责生产，各地开分店（边缘节点）卖货。顾客（用户）去最近的分店买就行，不用跑到总部。货卖完了分店自动从总部补货。

#### 📊 图解
CDN工作流程:

  用户请求example.com/logo.png
       ↓
  DNS解析(CNAME指向CDN)
       ↓
  GSLB(全局负载均衡)选择最近的边缘节点
       ↓
  边缘节点检查缓存
    ├─ 命中 → 直接返回(快!)
    └─ 未命中 → 回源站拉取
         → 缓存到边缘节点
         → 返回给用户

关键组件:
  DNS调度: CNAME+GSLB选择最优节点
  缓存策略: Cache-Control, max-age
  回源: 缓存未命中时请求源站
  负载均衡: 分配到健康的节点
#### 🔧 详解
CDN通过**DNS的CNAME记录**将域名指向CDN服务商，GSLB（全局负载均衡）根据用户IP、网络状况、节点负载选择最优边缘节点。**缓存策略**决定了资源在边缘节点的存活时间。**适用场景**：静态资源（JS/CSS/图片）、大文件下载、视频直播、API加速。不适用：频繁变化的动态内容（可用动态CDN）。

#### 💻 代码
// 配置CDN(以静态资源为例)
// 1. DNS配置: 将cdn.example.com CNAME到CDN服务商
// cdn.example.com → example.cdn77.org

// 2. 前端引用CDN资源
// 
// 

// 3. 服务端设置缓存头
app.use(express.static("public", {
  maxAge: "365d",          // 强缓存1年
  immutable: true,        // 内容不变永不回源
  setHeaders: (res, path) => {
    if (path.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache"); // HTML不缓存
    }
  }
}));

// 4. 文件名加hash实现缓存更新
// app.3a4b5c.js → 内容变hash变 → 破缓存
#### ❓ 追问
CDN缓存和浏览器缓存的关系？答：浏览器缓存是客户端本地的，CDN缓存是服务端的。请求链路：浏览器缓存→CDN缓存→源站，逐级回源。如何判断CDN是否命中？答：查看响应头CF-Cache-Status(Cloudflare)或X-Cache(Akamai)，HIT=命中，MISS=未命中。

---
## 4. WebSocket vs HTTP？

> **难度**: easy | **分类**: 网络协议 | **ID**: 84

#### 🎯 本质
HTTP是**请求-响应**模式，客户端主动发起，服务端被动响应，每次请求都要建立连接（HTTP/1.1持久连接复用但仍是请求-响应）。WebSocket是**全双工持久连接**，建立后双方可随时互发消息，适合实时通信场景。

#### 🧒 类比
HTTP像发短信——你发一条，对方回一条，对方不能主动给你发。WebSocket像打电话——接通后双方随时可以说话，不用轮流。

#### 📊 图解
HTTP:
  Client → Request → Server
  Client ← Response ← Server
  每次客户端主动,单向
  轮询(Polling)模拟实时:浪费资源

WebSocket:
  握手: HTTP Upgrade → 101 Switching
  建立后:
  Client ↔ Server (双向,持久)
  无需重复请求头(开销小)
  支持二进制和文本帧

对比:
         HTTP          WebSocket
方向     请求-响应      全双工
连接     短/持久         持久
开销     每次带请求头     帧很小(2-10B)
延迟     高(需重新请求)   低(实时推送)
适用     普通页面        聊天/游戏/实时
#### 🔧 详解
WebSocket通过HTTP的**Upgrade机制**建立连接：客户端发送Upgrade: websocket请求，服务端返回101 Switching Protocols，之后协议切换为WebSocket。连接建立后，数据以**帧**为单位传输，帧头只有2-10字节，远小于HTTP的请求头开销。**心跳机制**（Ping/Pong帧）保持连接活跃。

#### 💻 代码
// Node.js WebSocket服务端
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  console.log("新客户端连接");
  ws.on("message", (msg) => {
    // 广播给所有客户端
    wss.clients.forEach(c => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(msg.toString());
      }
    });
  });
  ws.send("欢迎加入聊天室");
});

// 浏览器客户端
const ws = new WebSocket("ws://localhost:8080");
ws.onopen = () => ws.send("Hello!");
ws.onmessage = (e) => console.log(e.data);
ws.onclose = () => console.log("连接关闭");
// 自动重连
function reconnect() {
  ws = new WebSocket(url);
  ws.onclose = () => setTimeout(reconnect, 3000);
}
#### ❓ 追问
WebSocket如何处理断线重连？答：监听onclose事件，用指数退避策略（1s, 2s, 4s...）重新连接，最多重试N次。WebSocket和SSE的区别？答：SSE（Server-Sent Events）是服务端单向推送，基于HTTP，更简单但不支持双向。轮询和长轮询的区别？答：轮询定时请求，长轮询服务端hold住请求直到有数据才返回。

---
## 5. TCP三次握手？

> **难度**: medium | **分类**: 网络协议 | **ID**: 186

#### 🎯 本质
TCP通过**三次握手**建立可靠连接：客户端发SYN→服务端回SYN+ACK→客户端发ACK。

#### 🧒 类比
三次握手像打电话——A:'喂听得到吗？'(SYN) B:'听到了，你呢？'(SYN+ACK) A:'我也听到了'(ACK)。

#### 📊 图解
Client → Server: SYN(seq=x)
Server → Client: SYN+ACK(seq=y,ack=x+1)
Client → Server: ACK(ack=y+1)
→ 连接建立
#### 🔧 详解
SYN表示请求建立连接。服务端回复SYN+ACK表示同意并确认。第三次ACK确认双方都能收发。三次握手的根本原因：防止已失效的连接请求到达服务器(防止SYN洪泛)。

#### 💻 代码
// 查看TCP连接
netstat -an | grep ESTABLISHED
// 抓包
tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn) != 0'
#### ❓ 追问
为什么是三次不是两次？答：防止已失效的SYN到达服务器建立错误连接。

---
## 6. TCP四次挥手？

> **难度**: medium | **分类**: 网络协议 | **ID**: 187

#### 🎯 本质
TCP通过**四次挥手**断开连接：A发FIN→B回ACK→B发FIN→A回ACK。

#### 🧒 类比
四次挥手像挂电话——A:'我说完了'(FIN) B:'好的'(ACK) B:'我也说完了'(FIN) A:'好的'(ACK)。

#### 📊 图解
A → B: FIN
B → A: ACK
(等待B发完剩余数据)
B → A: FIN
A → B: ACK
(等待2MSL后关闭)
#### 🔧 详解
FIN表示没有数据要发了。但对方可能还有数据要发所以ACK和FIN分两步。TIME_WAIT等待2MSL确保最后一个ACK到达。大量TIME_WAIT会耗尽端口(服务端可设置SO_REUSEADDR)。

#### 💻 代码
// 查看TIME_WAIT
ss -ant | grep TIME_WAIT
// 设置回收
sysctl net.ipv4.tcp_tw_reuse=1
#### ❓ 追问
为什么TIME_WAIT等2MSL？答：确保最后的ACK到达对方(如果丢失对方重发FIN)。

---
## 7. TCP拥塞控制？

> **难度**: hard | **分类**: 网络协议 | **ID**: 188

#### 🎯 本质
TCP拥塞控制通过**慢启动、拥塞避免、快重传、快恢复**四个算法动态调整发送速率防止网络拥塞。

#### 🧒 类比
拥塞控制像开车——刚上路慢速试探(慢启动)，发现路况好提速，看到拥堵标志就减速。

#### 📊 图解
慢启动: cwnd指数增长(1→2→4→8...)
拥塞避免: cwnd线性增长(+1/RTT)
快重传: 收到3个重复ACK立即重传
快恢复: cwnd减半(非从1开始)

阈值: ssthresh
#### 🔧 详解
cwnd(拥塞窗口)控制发送速率。慢启动从1开始指数增长到ssthresh。超过ssthresh线性增长(拥塞避免)。收到3个重复ACK触发快重传(不等超时)。超时则ssthresh=cwnd/2, cwnd=1重新慢启动。

#### 💻 代码
// Linux查看拥塞控制算法
sysctl net.ipv4.tcp_congestion_control
// BBR算法(Google)
sysctl -w net.ipv4.tcp_congestion_control=bbr
#### ❓ 追问
BBR和传统CUBIC的区别？答：BBR基于带宽和RTT模型，CUBIC基于丢包。

---
## 8. TCP和UDP的区别？

> **难度**: easy | **分类**: 网络协议 | **ID**: 189

#### 🎯 本质
TCP是**可靠有序**的连接协议。UDP是**无连接不可靠**但快速的协议。

#### 🧒 类比
TCP像快递(保证送到有序)，UDP像广播(发出去不管)。

#### 📊 图解
TCP: 连接/可靠/有序/流量控制/拥塞控制
UDP: 无连接/不可靠/无序/快速

应用:
TCP: HTTP/WebSocket/邮件
UDP: DNS/视频/游戏/直播
#### 🔧 详解
TCP保证数据可靠有序到达(通过序列号、确认、重传)。UDP只管发送不保证到达。TCP有流量控制(滑动窗口)和拥塞控制。UDP开销小延迟低适合实时场景。现代QUIC在UDP上实现了TCP的可靠性。

#### 💻 代码
// TCP服务器
const net=require('net');
net.createServer(socket=>{
  socket.on('data',data=>socket.write(data));
}).listen(8080);
// UDP服务器
const dgram=require('dgram');
dgram.createSocket('udp4')
  .on('message',(msg,rinfo)=>{})
  .bind(8081);
#### ❓ 追问
什么场景用UDP？答：实时音视频、游戏、DNS查询。为什么DNS用UDP？答：查询通常很小且需要快速响应。

---
## 9. OSI七层模型？

> **难度**: medium | **分类**: 网络协议 | **ID**: 190

#### 🎯 本质
OSI是**网络通信的理论框架**：物理层→数据链路层→网络层→传输层→会话层→表示层→应用层。

#### 🧒 类比
OSI像快递系统——包装→分拣→运输→派送，每层各司其职。

#### 📊 图解
7.应用层: HTTP/FTP/DNS
6.表示层: SSL/TLS/加密
5.会话层: 建立/管理会话
4.传输层: TCP/UDP
3.网络层: IP/路由
2.数据链路层: MAC/帧
1.物理层: 电缆/信号

TCP/IP简化: 应用-传输-网络-链路
#### 🔧 详解
每层只关心自己的职责，为上层提供服务。实际开发中主要接触应用层(HTTP)和传输层(TCP/UDP)。TCP/IP四层模型是简化版更常用。路由器工作在网络层，交换机在数据链路层。

#### 💻 代码
// 查看网络层信息
ifconfig / ip addr
traceroute google.com

// 查看连接
lsof -i :8080
#### ❓ 追问
路由器和交换机的区别？答：路由器工作在网络层(IP)，交换机在数据链路层(MAC)。

---
## 10. 从输入URL到页面显示的过程？

> **难度**: medium | **分类**: 网络协议 | **ID**: 191

#### 🎯 本质
完整流程：**DNS解析→TCP连接→TLS握手→HTTP请求→响应→解析→渲染**。

#### 🧒 类比
像在餐厅点餐——找餐厅地址(DNS)→走到那(TCP)→入座(TLS)→点菜(HTTP请求)→上菜(响应)→吃(渲染)。

#### 📊 图解
1.DNS解析(域名→IP)
2.TCP三次握手
3.TLS握手(HTTPS)
4.发送HTTP请求
5.服务器处理并响应
6.浏览器解析HTML
7.构建DOM/CSSOM树
8.渲染树→布局→绘制
9.执行JS
#### 🔧 详解
DNS递归查询→浏览器/OS/本地DNS/根DNS/权威DNS。TCP三次握手建立连接。TLS协商密钥。发送HTTP请求(可能命中缓存)。服务器返回HTML。浏览器解析DOM，遇到CSS/JS/图片等资源并行下载。DOM+CSSOM→渲染树→布局→绘制→合成。

#### 💻 代码
// Performance API测量
performance.getEntriesByType('navigation')[0];
// 关键时间点
// DNS: domainLookupEnd-domainLookupStart
// TCP: connectEnd-connectStart
// TTFB: responseStart-requestStart
// DOM: domComplete-domLoading
#### ❓ 追问
什么是TTFB？答：Time To First Byte首字节时间。关键渲染路径？答：DOM+CSSOM→渲染树→布局→绘制。

---
## 11. 什么是CDN？

> **难度**: easy | **分类**: 网络协议 | **ID**: 192

#### 🎯 本质
CDN(内容分发网络)是**分布在全球的缓存服务器网络**，用户就近获取资源减少延迟。

#### 🧒 类比
CDN像连锁便利店——到处有分店就近购买，不用都去总店。

#### 📊 图解
CDN工作流程:
1.用户请求资源
2.DNS解析到最近的CDN节点
3.CDN有缓存直接返回
4.无缓存→回源站获取并缓存

优势: 降低延迟/减轻源站压力
#### 🔧 详解
CDN缓存静态资源(JS/CSS/图片/视频)。边缘节点离用户更近减少网络延迟。回源指CDN节点向源站请求数据。CDN还提供DDoS防护、SSL终止、HTTP/2等。

#### 💻 代码
// HTML使用CDN

// 自定义CDN缓存策略
Cache-Control: public, max-age=31536000, immutable
#### ❓ 追问
CDN回源策略？答：缓存未命中/过期/强制刷新时回源。什么是边缘计算？答：在CDN边缘节点运行代码处理请求。

---
## 12. HTTPS证书验证过程？

> **难度**: medium | **分类**: 网络协议 | **ID**: 193

#### 🎯 本质
浏览器验证**CA证书链**：服务器证书→中间CA→根CA，确认服务器身份合法性。

#### 🧒 类比
证书验证像验证公章——一级级确认盖章机构的合法性。

#### 📊 图解
验证流程:
1.服务器发证书链(服务器+中间CA)
2.浏览器验证签名
3.逐级验证到根CA(预装在浏览器)
4.检查域名/有效期/吊销列表
5.通过后进行密钥交换
#### 🔧 详解
浏览器内置了受信任的根CA证书。验证签名确认证书未被篡改。检查域名匹配、有效期、是否被吊销(CRL/OCSP)。证书链必须完整(不能跳过中间CA)。EV证书显示绿色地址栏(现已统一)。

#### 💻 代码
// 查看证书
openssl x509 -in cert.pem -text -noout
// 生成CSR
certbot certonly --webroot -w /var/www -d example.com
// 检查过期
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
#### ❓ 追问
什么是证书固定(Certificate Pinning)？答：固定特定证书公钥防止CA被攻破。自签名证书的问题？答：浏览器不信任需要手动添加。

---
## 13. TCP滑动窗口和流量控制？

> **难度**: hard | **分类**: 网络协议 | **ID**: 194

#### 🎯 本质
滑动窗口是**流量控制机制**：接收方通过窗口大小告诉发送方还能接收多少数据，防止发送过快。

#### 🧒 类比
滑动窗口像滑动的取餐窗口——告诉厨房还能放几份(窗口大小)，满了就停止。

#### 📊 图解
发送窗口:
  已发送未确认 | 可发送 | 不可发送
  ← 滑动 →

接收窗口:
  已接收 | 可接收 | 不可接收

窗口大小=接收方缓冲区剩余
#### 🔧 详解
发送方维护发送窗口(接收方通告的大小)。接收方通过ACK中的窗口字段告知剩余缓冲区。窗口为零时发送方停止发送(发送零窗口探测)。糊涂窗口综合征(Silly Window Syndrome)用Nagle算法和Clark方案解决。

#### 💻 代码
// 设置TCP缓冲区
setsockopt(sockfd,SOL_SOCKET,SO_RCVBUF,&size,sizeof(size));
// Linux默认
sysctl net.ipv4.tcp_rmem
sysctl net.ipv4.tcp_wmem
#### ❓ 追问
什么是糊涂窗口综合征？答：窗口很小还发送数据导致效率低。Nagle算法？答：攒够一定量再发。

---
## 14. IP地址和子网掩码？

> **难度**: easy | **分类**: 网络协议 | **ID**: 195

#### 🎯 本质
IP地址是**网络中设备的唯一标识**。子网掩码划分**网络部分和主机部分**。

#### 🧒 类比
IP像门牌号(唯一地址)，子网掩码像邮编(划分区域)。

#### 📊 图解
IPv4: 32位(4字节)
  例: 192.168.1.1
子网掩码: 网络位全1/主机位全0
  例: 255.255.255.0 (/24)

CIDR: 192.168.1.0/24
私有: 10.x/172.16-31/192.168
#### 🔧 详解
IPv4地址32位用点分十进制表示。子网掩码中1的位数是网络位。CIDR表示法(/24=255.255.255.0)。私有IP不直接连互联网需要NAT。IPv6是128位解决地址耗尽问题。

#### 💻 代码
// IP计算
网络地址=IP & 子网掩码
192.168.1.100 & 255.255.255.0
= 192.168.1.0

// 可用主机数
/24: 2^8-2=254
/16: 2^16-2=65534
#### ❓ 追问
什么是NAT？答：网络地址转换，私有IP通过NAT访问公网。IPv6的优势？答：更大地址空间、内置安全、更好组播。

---
## 15. HTTPS混合内容？

> **难度**: medium | **分类**: 网络协议 | **ID**: 196

#### 🎯 本质
HTTPS页面中加载**HTTP资源**称为混合内容。被动混合内容(图片)可能被允许，主动混合内容(JS/CSS)会被浏览器阻止。

#### 🧒 类比
混合内容像在安全房间(HTTPS)里开了个不安全的窗(HTTP)——可能被窃听。

#### 📊 图解
混合内容类型:
主动(被阻止):
  JS/CSS/iframe/XMLHttpRequest
被动(可能警告):
  图片/音视频

解决: 全部用HTTPS
  → upgrade-insecure-requests
#### 🔧 详解
现代浏览器默认阻止所有混合内容。CSP的upgrade-insecure-requests自动将HTTP升级为HTTPS。HSTS强制浏览器总是用HTTPS。开发工具Security面板显示混合内容警告。

#### 💻 代码
// CSP自动升级

// HSTS
Strict-Transport-Security: max-age=31536000; includeSubDomains
#### ❓ 追问
HSTS的作用？答：告诉浏览器一年内只用HTTPS访问本站。preload列表？答：浏览器内置的只HTTPS站点列表。

---
## 16. Cookie的SameSite属性？

> **难度**: medium | **分类**: 网络协议 | **ID**: 197

#### 🎯 本质
SameSite控制**跨站请求是否携带Cookie**，防止CSRF攻击。Strict/Lax/None三种模式。

#### 🧒 类比
SameSite像门禁卡——Strict只在自己家刷，Lax允许导航过来时刷，None哪都能刷(需Secure)。

#### 📊 图解
SameSite值:
Strict: 完全禁止跨站发送
  (从别的站点点链接不携带)
Lax(默认): 导航请求携带
  (GET顶级导航携带)
None: 允许跨站(必须Secure)

Chrome默认Lax
#### 🔧 详解
Strict最安全但影响体验(从搜索结果点进来不登录态)。Lax是默认值允许顶级导航携带Cookie。None需配合Secure(HTTPS)。SameSite对第三方Cookie影响大。Samesite不防XSS。

#### 💻 代码
// 设置SameSite
Set-Cookie: session=abc; SameSite=Strict
Set-Cookie: track=xyz; SameSite=None; Secure

// Express
res.cookie('token','abc',{
  sameSite:'lax',
  secure:true,
  httpOnly:true
});
#### ❓ 追问
Chrome为什么要淘汰第三方Cookie？答：隐私保护。替代方案？答：CHIPS、First-Party Sets。

---
## 17. 什么是代理服务器？

> **难度**: easy | **分类**: 网络协议 | **ID**: 198

#### 🎯 本质
代理服务器是**客户端和目标服务器之间的中间人**，转发请求并可能修改请求/响应。正向代理代表客户端，反向代理代表服务器。

#### 🧒 类比
正向代理像代购(帮你买)，反向代理像前台(帮你转接)。

#### 📊 图解
正向代理:
  客户端→代理→服务器
  (隐藏客户端身份/翻墙/缓存)

反向代理:
  客户端→代理→服务器集群
  (负载均衡/缓存/安全)

透明代理: 不修改请求
#### 🔧 详解
正向代理客户端知道目标但通过代理访问(VPN/爬虫代理)。反向代理客户端不知道实际服务器(Nginx/CDN)。反向代理功能：负载均衡、SSL终止、缓存、限流、压缩。

#### 💻 代码
// Nginx反向代理
upstream backend{
  server 10.0.0.1:8080;
  server 10.0.0.2:8080;
}
server {
  listen 80;
  location / {
    proxy_pass http://backend;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
#### ❓ 追问
正向代理和反向代理的核心区别？答：正向代理代表客户端，反向代理代表服务端。Nginx还能做什么？答：负载均衡、静态文件服务、SSL终止、限流。

---
