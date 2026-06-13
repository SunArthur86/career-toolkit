# 计算机网络

> 共 17 题

## 1. TCP三次握手？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 467

#### 🎯 本质
TCP建立连接需**三次握手**：SYN→SYN+ACK→ACK。确保双方都能收发。

#### 🧒 类比
三次握手像打电话——A:'听见吗？'(SYN) B:'听见了，你呢？'(SYN+ACK) A:'也听见了'(ACK)

#### 📊 图解
客户端SYN→服务端SYN+ACK→客户端ACK

状态: CLOSED→SYN_SENT→ESTABLISHED
服务端: LISTEN→SYN_RCVD→ESTABLISHED
#### 🔧 详解
第一次：客户端发SYN(seq=x)进入SYN_SENT。第二次：服务端回SYN+ACK(seq=y,ack=x+1)进入SYN_RCVD。第三次：客户端发ACK(ack=y+1)进入ESTABLISHED。三次保证双方确认收发能力。

#### 💻 代码
// 三次握手示意
Client → SYN(seq=100) → Server
Client ← SYN+ACK(seq=300,ack=101) ← Server
Client → ACK(ack=301) → Server
// 之后可以传数据
#### ❓ 追问
为什么不能两次？答：防止已失效的连接请求到达服务端导致误建连接。

---
## 2. TCP四次挥手？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 468

#### 🎯 本质
TCP断开需**四次挥手**：FIN→ACK→FIN→ACK。因为全双工需双向关闭。

#### 🧒 类比
四次挥手像挂电话——A:'我说完了'(FIN) B:'知道了'(ACK) B:'我也说完了'(FIN) A:'知道了'(ACK)

#### 📊 图解
主动方FIN→被动方ACK→被动方FIN→主动方ACK

主动方: FIN_WAIT_1→FIN_WAIT_2→TIME_WAIT
被动方: CLOSE_WAIT→LAST_ACK→CLOSED
#### 🔧 详解
主动方发FIN进入FIN_WAIT_1。被动方回ACK进入CLOSE_WAIT。被动方数据发完后发FIN进入LAST_ACK。主动方回ACK进入TIME_WAIT(等2MSL后关闭)。TIME_WAIT确保最后一个ACK到达。

#### 💻 代码
// 四次挥手示意
Active → FIN → Passive
Active ← ACK ← Passive
Active ← FIN ← Passive
Active → ACK → Passive
// Active进入TIME_WAIT等2MSL
#### ❓ 追问
为什么有TIME_WAIT？答：确保最后一个ACK到达，等待网络中残留报文消失。

---
## 3. HTTP和HTTPS的区别？

> **难度**: easy | **分类**: 计算机网络 | **ID**: 469

#### 🎯 本质
HTTPS=HTTP+**TLS/SSL加密**。端口80→443。数据传输加密防窃听/篡改。

#### 🧒 类比
HTTP像明信片(谁都能看)，HTTPS像密封信封(只有收件人能拆)。

#### 📊 图解
HTTP: 明文, 端口80
HTTPS: TLS加密, 端口443

HTTPS需要CA证书
#### 🔧 详解
HTTP明文传输不安全(可被窃听/篡改/冒充)。HTTPS在TCP之上加TLS层。TLS握手协商加密算法和密钥。CA证书验证服务器身份。HTTPS需要额外TLS握手(但TLS1.3已优化到1-RTT)。

#### 💻 代码
// HTTPS握手(TLS 1.2)
ClientHello(支持的加密套件)
→ ServerHello(选定的加密套件+证书)
→ 客户端验证证书+生成密钥
→ ChangeCipherSpec→开始加密通信

// TLS 1.3: 1-RTT甚至0-RTT
#### ❓ 追问
HTTPS的性能开销？答：TLS握手增加1-2个RTT，但现代硬件加密开销很小。

---
## 4. HTTP状态码？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 470

#### 🎯 本质
状态码**表示请求处理结果**。2xx成功/3xx重定向/4xx客户端错误/5xx服务端错误。

#### 🧒 类比
状态码像快递状态——200签收成功/301搬走了/404找不到/500仓库出问题了。

#### 📊 图解
2xx: 成功
  200 OK/201 Created/204 No Content
3xx: 重定向
  301永久/302临时/304缓存
4xx: 客户端错误
  400 Bad Request/401未认证/403禁止/404未找到
5xx: 服务端错误
  500内部错误/502网关错误/503不可用
#### 🔧 详解
常用：200成功、301永久重定向(SEO权重转移)、302临时重定向、304未修改(缓存命中)、400参数错误、401未登录、403无权限、404不存在、500服务器错误、502网关错误、503服务不可用(限流/维护)。

#### 💻 代码
// Express设置状态码
res.status(200).json(data);
res.status(301).redirect('/new-url');
res.status(404).json({error:'Not found'});
res.status(500).json({error:'Internal error'});
#### ❓ 追问
502和503的区别？答：502网关收到了无效响应(上游挂了)，503服务暂时不可用(过载/维护)。

---
## 5. Cookie/Session/Token？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 471

#### 🎯 本质
Cookie存在**浏览器端**，Session存在**服务器端**，Token是**无状态令牌**。

#### 🧒 类比
Cookie像会员卡(带在身上)，Session像登记簿(店内存)，Token像通行证(自己验证)。

#### 📊 图解
Cookie: 浏览器自动携带
Session: 服务端存储+SessionID
Token(JWT): 无状态自包含
#### 🔧 详解
Cookie：浏览器自动携带，有大小限制(4KB)和安全隐患(CSRF)。Session：服务端存储，SessionID通过Cookie传给客户端。Token(JWT)：无状态自包含(Header.Payload.Signature)，不占服务端存储，适合分布式。

#### 💻 代码
// JWT生成
const token=jwt.sign({userId:123,role:'admin'},SECRET,{expiresIn:'7d'});
// JWT验证
const payload=jwt.verify(token,SECRET);
// Cookie设置
res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'strict',maxAge:86400000});
#### ❓ 追问
JWT的缺点？答：无法主动失效(除非黑名单)，payload明文(不要存敏感信息)。

---
## 6. 什么是跨域？

> **难度**: easy | **分类**: 计算机网络 | **ID**: 472

#### 🎯 本质
浏览器**同源策略(SOP)**限制不同源(协议/域名/端口)的请求。CORS是标准解决方案。

#### 🧒 类比
跨域像不同部门不能随便串门——需要领导(CORS头)批准。

#### 📊 图解
同源: 协议+域名+端口相同
跨域解决方案:
1.CORS(推荐)
2.JSONP(旧)
3.代理
#### 🔧 详解
同源策略防止恶意网站读取其他网站的数据。CORS：服务端设置Access-Control-Allow-Origin等响应头。简单请求直接发。预检请求(Preflight)：非简单请求先发OPTIONS。JSONP：利用script标签不受同源限制(只支持GET)。

#### 💻 代码
// CORS配置(服务端)
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','https://example.com');
  res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers','Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials','true');
  if(req.method==='OPTIONS') return res.sendStatus(204);
  next();
});
#### ❓ 追问
为什么有同源策略？答：防止CSRF和XSS攻击，保护用户数据。

---
## 7. WebSocket和HTTP的区别？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 473

#### 🎯 本质
HTTP是**请求-响应**模式，WebSocket是**全双工长连接**。适合实时通信。

#### 🧒 类比
HTTP像对讲机(说完一句等回复)，WebSocket像打电话(双方同时说)。

#### 📊 图解
HTTP: 请求→响应→断开
HTTP长轮询: 客户端不断问
WebSocket: 握手后双向通信
#### 🔧 详解
HTTP每次请求都要建立连接(HTTP/2复用但仍是请求-响应)。WebSocket通过HTTP升级握手建立连接后保持双向通信。适合聊天、实时数据推送、游戏。

#### 💻 代码
// WebSocket
const ws=new WebSocket('wss://example.com/ws');
ws.onopen=()=>ws.send(JSON.stringify({type:'hello'}));
ws.onmessage=(e)=>console.log('收到:',JSON.parse(e.data));
// 服务端(Node)
const wss=new WebSocket.Server({port:8080});
wss.on('connection',ws=>{
  ws.on('message',msg=>ws.send('echo:'+msg));
});
#### ❓ 追问
SSE和WebSocket区别？答：SSE单向(服务器→客户端)基于HTTP，WebSocket双向独立协议。

---
## 8. GET和POST的区别？

> **难度**: easy | **分类**: 计算机网络 | **ID**: 474

#### 🎯 本质
GET用于**获取资源**(参数在URL)，POST用于**提交数据**(参数在请求体)。

#### 🧒 类比
GET像查字典(在书签上写关键词)，POST像填表(内容在信封里)。

#### 📊 图解
GET: 幂等,参数在URL,可缓存
POST: 非幂等,参数在Body,不缓存
#### 🔧 详解
GET参数在URL中有长度限制(浏览器约2K)。POST在请求体中无限制。GET幂等(多次请求结果一样)可缓存。POST非幂等。GET可被收藏为书签，POST不行。本质上都是HTTP请求，安全性的差异主要靠HTTPS。

#### 💻 代码
// GET
fetch('/api/users?page=1&size=10')
// POST
fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Tom'})})
#### ❓ 追问
POST比GET安全吗？答：都不安全(明文)，安全靠HTTPS。POST只是不暴露在URL上。

---
## 9. HTTP/2和HTTP/3？

> **难度**: hard | **分类**: 计算机网络 | **ID**: 475

#### 🎯 本质
HTTP/2：**多路复用+头部压缩+服务器推送**。HTTP/3基于QUIC(UDP)解决队头阻塞。

#### 🧒 类比
HTTP/2像多车道高速公路(一个连接多路并行)，HTTP/3像直升机(不堵车)。

#### 📊 图解
HTTP/2: 二进制帧+多路复用+HPACK
HTTP/3: QUIC(UDP)+0-RTT+连接迁移
#### 🔧 详解
HTTP/2：二进制分帧层实现多路复用(一个TCP连接并行多个请求)。HPACK压缩头部。服务器推送。但仍基于TCP有队头阻塞。HTTP/3用QUIC(基于UDP)解决：0-RTT建连、连接迁移(WiFi切4G不断)、无队头阻塞。

#### 💻 代码
// HTTP/2多路复用
// 一个TCP连接上:
Stream 1: GET /html
Stream 3: GET /css
Stream 5: GET /js
// 交叉发送帧，互不阻塞

// 启用HTTP/2(Nginx)
server { listen 443 ssl http2; }
#### ❓ 追问
HTTP/2的队头阻塞？答：TCP层一个包丢失会阻塞所有流。HTTP/3的QUIC解决了这个问题。

---
## 10. DNS解析过程？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 476

#### 🎯 本质
DNS将**域名解析为IP地址**。递归查询：浏览器缓存→OS缓存→本地DNS→根DNS→顶级DNS→权威DNS。

#### 🧒 类比
DNS像114查号台——问一层层直到找到电话号码(IP)。

#### 📊 图解
浏览器缓存→OS缓存→hosts文件→本地DNS
→根DNS(.com)→顶级DNS(example.com)→权威DNS→IP
#### 🔧 详解
浏览器先检查自身DNS缓存。没有则查OS缓存和hosts文件。还没有则向本地DNS服务器查询(递归)。本地DNS依次问根DNS、顶级DNS、权威DNS(迭代)。最终拿到IP地址缓存起来。DNS使用UDP端口53。

#### 💻 代码
// DNS查询
nslookup example.com
dig example.com
// 前端DNS预解析

#### ❓ 追问
DNS劫持怎么办？答：使用DNS over HTTPS(DoH)或HTTPDNS。

---
## 11. CDN是什么？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 477

#### 🎯 本质
CDN将内容**缓存到全球边缘节点**，用户就近获取降低延迟。

#### 🧒 类比
CDN像连锁仓库——在各地设仓库，用户到最近的取货。

#### 📊 图解

```
用户请求→DNS解析到最近CDN节点→命中返回→未命中回源
```

#### 🔧 详解
内容分发网络。源站内容分发到全球边缘节点。用户请求被路由到最近的节点。缓存命中率通常>95%。适合静态资源、图片、视频。阿里云/Cloudflare/Akamai是主流CDN服务商。

#### 💻 代码
// CDN使用
// 静态资源指向CDN

// 图片CDN+参数处理

#### ❓ 追问
CDN的缓存策略？答：设置Cache-Control头、CDN后台配置缓存过期时间、主动刷新。

---
## 12. 什么是RESTful API？

> **难度**: easy | **分类**: 计算机网络 | **ID**: 478

#### 🎯 本质
REST是**资源导向的API设计风格**：用HTTP方法(CRUD)操作资源(URL)。

#### 🧒 类比
RESTful像图书馆管理——每本书(资源)有编号(URL)，用不同动作(HTTP方法)操作。

#### 📊 图解
GET /users - 列表
GET /users/1 - 详情
POST /users - 创建
PUT /users/1 - 更新
DELETE /users/1 - 删除
#### 🔧 详解
REST六大约束：客户端-服务端分离、无状态、可缓存、统一接口、分层系统、按需代码。URL是资源(名词)，HTTP方法是操作(动词)。返回合适的状态码。HATEOAS(响应中包含相关链接)。

#### 💻 代码
// RESTful路由设计
app.get('/api/users',listUsers);      // 列表
app.get('/api/users/:id',getUser);   // 详情
app.post('/api/users',createUser);   // 创建
app.put('/api/users/:id',updateUser);// 全量更新
app.patch('/api/users/:id',patchUser);// 部分更新
app.delete('/api/users/:id',deleteUser);// 删除
#### ❓ 追问
REST和GraphQL的区别？答：REST多个端点，GraphQL单一端点按需查询字段。

---
## 13. 什么是CORS预检请求？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 479

#### 🎯 本质
非简单请求会先发**OPTIONS预检**，询问服务端是否允许跨域。

#### 🧒 类比
预检像出海关——先出示护照(OPTIONS)检查通过后才通行(实际请求)。

#### 📊 图解
简单请求: GET/POST+简单头
非简单请求: PUT/DELETE/自定义头
→先发OPTIONS预检
#### 🔧 详解
简单请求：GET/POST/HEAD+简单Content-Type+简单头部。非简单请求(如PUT/DELETE/自定义头/JSON Content-Type)触发预检。预检OPTIONS请求不带Body。服务端返回允许的方法/头部/来源。预检结果可缓存(Access-Control-Max-Age)。

#### 💻 代码
// 非简单请求触发预检
fetch('https://api.example.com/data',{
  method:'PUT',
  headers:{'Content-Type':'application/json','X-Custom':'value'},
  body:JSON.stringify({name:'test'})
});
// 浏览器先发:
// OPTIONS /data
// Access-Control-Request-Method: PUT
// Access-Control-Request-Headers: X-Custom
#### ❓ 追问
如何减少预检请求？答：设置Access-Control-Max-Age缓存预检结果。

---
## 14. HTTPS握手过程？

> **难度**: hard | **分类**: 计算机网络 | **ID**: 480

#### 🎯 本质
HTTPS在TCP握手后还需**TLS握手**：协商加密算法→交换密钥→验证证书→建立加密通道。

#### 🧒 类比
TLS握手像对暗号——双方确认身份、约定加密方式、交换密钥。

#### 📊 图解
TLS 1.2:
1.ClientHello(支持的加密套件)
2.ServerHello+证书+密钥交换
3.客户端验证证书+生成预主密钥
4.双方计算主密钥
5.开始加密通信
#### 🔧 详解
TLS 1.2需要2-RTT。客户端发送支持的加密套件。服务端选择套件+发证书+ServerKeyExchange。客户端验证证书(信任链)+生成随机数用服务端公钥加密发送。双方用随机数生成会话密钥。TLS 1.3优化到1-RTT甚至0-RTT(恢复会话)。

#### 💻 代码
// Nginx配置HTTPS
server {
  listen 443 ssl http2;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
}
#### ❓ 追问
TLS 1.3的0-RTT？答：恢复会话时客户端直接带加密数据发出去，无需等握手完成。

---
## 15. 输入URL到页面展示全过程？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 481

#### 🎯 本质
URL→DNS解析→TCP连接→TLS握手→HTTP请求→服务端处理→HTML响应→浏览器解析渲染。

#### 🧒 类比
输入URL到展示像快递流程——查地址(DNS)→发货(TCP)→拆包(解析)→组装(渲染)。

#### 📊 图解
1.URL解析
2.DNS解析→IP
3.TCP三次握手
4.TLS握手(HTTPS)
5.HTTP请求
6.服务端处理+响应
7.浏览器解析HTML
8.构建DOM+CSSOM
9.布局+绘制+合成
#### 🔧 详解
浏览器解析URL→DNS查IP→TCP三次握手→TLS握手(如果是HTTPS)→发送HTTP请求→服务端处理返回HTML→浏览器解析HTML构建DOM树→解析CSS构建CSSOM→DOM+CSSOM合并为渲染树→布局计算位置大小→绘制像素→GPU合成。遇到JS会阻塞DOM构建。

#### 💻 代码
// 性能优化节点
DNS预解析: 
TCP预连接: 
资源加载: 
减少关键路径: defer/async
#### ❓ 追问
其中哪些可以并行？答：DNS/TCP/TLS可预解析预连接。HTML解析和资源下载可并行。

---
## 16. 什么是IP地址？

> **难度**: easy | **分类**: 计算机网络 | **ID**: 482

#### 🎯 本质
IP地址是**网络设备的唯一标识**。IPv4(32位)和IPv6(128位)。

#### 🧒 类比
IP地址像门牌号——每台电脑在网络上的地址。

#### 📊 图解
IPv4: 192.168.1.1 (32位)
IPv6: 2001:db8::1 (128位)

分类: A/B/C/D/E
#### 🔧 详解
IPv4用32位表示(约43亿个)。IPv6用128位解决地址不够的问题。IP分为公网IP和私有IP(10.x/172.16-31.x/192.168.x)。子网掩码划分网络和主机部分。NAT将私有IP映射到公网IP。

#### 💻 代码
// IP地址判断
function isPrivateIP(ip){
  const parts=ip.split('.').map(Number);
  return parts[0]===10 ||
    (parts[0]===172&&parts[1]>=16&&parts[1]
#### ❓ 追问
IPv4为什么不够用？答：32位只有43亿地址。NAT和IPv6是解决方案。

---
## 17. 什么是反向代理？

> **难度**: medium | **分类**: 计算机网络 | **ID**: 483

#### 🎯 本质
反向代理在**服务端前**，客户端不知道真实服务器。Nginx是最常用的反向代理。

#### 🧒 类比
反向代理像公司前台——外部人只和前台打交道，不知道后面是哪个部门处理的。

#### 📊 图解
客户端→反向代理→后端服务器

用途:
负载均衡/缓存/安全/SSL卸载
#### 🔧 详解
客户端请求反向代理服务器。代理服务器将请求转发给后端真实服务器。客户端不知道真实服务器是谁。用途：负载均衡、缓存静态资源、SSL卸载、安全防护、统一入口。

#### 💻 代码
// Nginx反向代理
server {
  listen 80;
  server_name example.com;
  location /api/ {
    proxy_pass http://backend:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  location / {
    root /var/www/html;
    try_files $uri /index.html;
  }
}
#### ❓ 追问
正向代理和反向代理的区别？答：正向代理代理客户端(VPN)，反向代理代理服务端(Nginx)。

---
