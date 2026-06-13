# HTTP

> 共 17 题

## 1. GET和POST的区别？

> **难度**: easy | **分类**: HTTP | **ID**: 33

#### 🎯 本质
GET 用于获取资源（幂等），POST 用于提交数据（非幂等）。

#### 🧒 类比
GET 像在图书馆查书（只看不改），POST 像往图书馆捐书（改变了馆藏）。

#### 📊 对比
         GET            POST
参数位置  URL查询字符串    请求体(Body)
安全性   参数暴露在URL中   不可见(但非加密)
长度限制  浏览器有URL长度限制  理论无限制
缓存     浏览器主动缓存    不缓存
幂等性   是(多次请求=一次)  否
回退     无害             会重新提交
#### ❓ 追问
本质都是TCP连接，语义不同而已。POST也可用URL参数，GET也可有Body（但不推荐）。

#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

---
## 2. 常见HTTP状态码？

> **难度**: easy | **分类**: HTTP | **ID**: 34

#### 🎯 本质
HTTP状态码是服务器对请求的**响应结果分类**，由三位数字组成，第一位数字表示响应类别。掌握常用状态码是前后端协作的基础。

#### 🧒 类比
状态码像快递状态——2xx是签收成功，3xx是转投别处，4xx是你填错地址，5xx是快递站出问题了。

#### 📊 图解
1xx 信息类(少见):
  100 Continue 继续发送请求

2xx 成功:
  200 OK 请求成功
  201 Created 资源创建成功
  204 No Content 成功但无返回体

3xx 重定向:
  301 Moved Permanently 永久重定向
  302 Found 临时重定向
  304 Not Modified 缓存命中

4xx 客户端错误:
  400 Bad Request 请求格式错误
  401 Unauthorized 未认证(缺token)
  403 Forbidden 已认证但无权限
  404 Not Found 资源不存在
  429 Too Many Requests 限流

5xx 服务端错误:
  500 Internal Server Error 服务器内部错误
  502 Bad Gateway 网关/代理错误
  503 Service Unavailable 服务不可用
  504 Gateway Timeout 网关超时
#### 🔧 详解
**301 vs 302**：301是永久重定向（浏览器会缓存，SEO权重转移），302是临时重定向（不缓存）。**401 vs 403**：401是未登录（需要认证），403是已登录但权限不够。**304**：协商缓存命中，浏览器直接用本地缓存，不传body。

#### 💻 代码
// 前端根据状态码处理响应
async function request(url, options) {
  const res = await fetch(url, options);
  if (res.status === 200) return res.json();
  if (res.status === 301) {
    // 跟随重定向(fetch自动处理)
  }
  if (res.status === 401) {
    // token过期，跳转登录
    redirectToLogin();
  }
  if (res.status === 403) {
    showToast("无权限访问");
  }
  if (res.status >= 500) {
    showToast("服务器开小差了");
  }
  throw new Error("HTTP " + res.status);
}
#### ❓ 追问
304是如何实现的？答：浏览器发送If-None-Match(ETag)或If-Modified-Since，服务器比对后返回304或200。499状态码是什么？答：Nginx自定义码，表示客户端主动关闭了连接。

---
## 3. HTTP缓存机制？

> **难度**: medium | **分类**: HTTP | **ID**: 85

#### 🎯 本质
HTTP缓存是浏览器和服务器之间的**协作机制**，通过减少重复请求和传输来加速页面加载。分为**强缓存**（不问服务器直接用）和**协商缓存**（问服务器是否可用），两者配合实现高效的资源复用。

#### 🧒 类比
强缓存像家里的冰箱——食物没过期直接吃（不问超市）。协商缓存像打电话问超市"这罐牛奶还在不在卖"——在的话告诉你"没变，还用原来的"（304），变了就送新的（200）。

#### 📊 图解
缓存决策流程:
  请求资源
  → 有强缓存且未过期?
    → 是: 直接使用(200 from cache)
    → 否: 发请求协商
      → 服务端比对ETag/Last-Modified
        → 未修改: 304 Not Modified(无body)
        → 已修改: 200 + 新资源(有body)

强缓存(HTTP/1.1 Cache-Control):
  max-age=3600     缓存3600秒
  no-cache         跳过强缓存,必须协商
  no-store         完全不缓存
  private          仅浏览器缓存
  public           中间代理也可缓存
  immutable        内容永不变(配合max-age)

协商缓存:
  ETag/If-None-Match: 内容hash比对(精确)
  Last-Modified/If-Modified-Since:
    时间戳比对(秒级,不精确)
#### 🔧 详解
**强缓存**通过Cache-Control的max-age控制过期时间，过期前浏览器不发送任何请求。**协商缓存**在强缓存过期后触发，浏览器带上ETag（资源内容的hash）或Last-Modified（最后修改时间），服务端比对后决定返回304（用缓存）还是200（新内容）。ETag比Last-Modified更精确，优先级更高。

#### 💻 代码
// Express设置缓存策略
app.use(express.static("public", {
  // JS/CSS: 强缓存1年(文件名含hash)
  setHeaders: (res, path) => {
    if (path.match(/\.\w+\.[a-f0-9]{8}\./)) {
      // app.3a4b5c.js 这种有hash的
      res.setHeader("Cache-Control",
        "public, max-age=31536000, immutable");
    } else if (path.endsWith(".html")) {
      // HTML: 不缓存(入口文件)
      res.setHeader("Cache-Control",
        "no-cache");
    }
  }
}));

// Nginx配置
// location /static/ {
//   expires 365d;
//   add_header Cache-Control "public, immutable";
// }
// location / {
//   add_header Cache-Control "no-cache";
// }
#### ❓ 追问
no-cache和no-store的区别？答：no-cache是不用强缓存但可以协商缓存（发请求验证），no-store是完全不存任何缓存。为什么HTML要设no-cache？答：HTML引用的JS/CSS路径含hash，HTML变了才会加载新资源，所以HTML必须每次验证最新。

---
## 4. HTTPS如何保证安全？

> **难度**: medium | **分类**: HTTP | **ID**: 86

#### 🎯 本质
HTTPS = HTTP + **TLS/SSL**加密层，通过**加密传输、身份验证、数据完整性**三重保障来确保通信安全。核心是用非对称加密协商对称密钥，再用对称加密传输数据。

#### 🧒 类比
HTTPS像寄机密快递——先用保险箱交换钥匙（非对称加密协商），然后用同一把钥匙锁后续所有包裹（对称加密传输），快递员没法偷看也改不了内容。

#### 📊 图解
HTTPS安全保障三要素:

① 加密传输(防窃听)
  非对称加密(RSA/ECDHE)协商密钥
  对称加密(AES-GCM)传输数据
  → 即使截获也无法解读

② 身份验证(防冒充)
  数字证书(X.509)由CA签发
  浏览器验证证书链:
  服务器证书→中间CA→根CA
  → 确认对方是真正的服务器

③ 数据完整性(防篡改)
  MAC(消息认证码)校验
  TLS使用AEAD(AES-GCM)
  → 数据被篡改立即发现

TLS握手简化流程:
  ClientHello(支持的加密套件)
  ServerHello(选定套件+证书)
  客户端验证证书+生成密钥
  双方确认→加密通信开始
#### 🔧 详解
**非对称加密**（RSA/ECDHE）用于安全交换密钥，速度慢但无需预先共享密钥。**对称加密**（AES）用于实际数据传输，速度快。**数字证书**由可信CA（如Let Encrypt、DigiCert）签发，防止中间人冒充。TLS 1.3简化了握手过程（1-RTT），移除了不安全的加密算法。

#### 💻 代码
// Node.js启用HTTPS
const https = require("https");
const fs = require("fs");
https.createServer({
  key: fs.readFileSync("server-key.pem"),
  cert: fs.readFileSync("server-cert.pem")
}, (req, res) => {
  res.writeHead(200);
  res.end("Secure Hello");
}).listen(443);

// Let Encrypt免费证书(acme.sh)
// acme.sh --issue -d example.com --nginx
// 自动申请+自动续期

// 安全响应头(配合HTTPS)
// HSTS: 强制HTTPS
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security",
    "max-age=31536000; includeSubDomains");
  next();
});

// CSP: 限制资源来源
res.setHeader("Content-Security-Policy",
  "default-src self; script-src self");
#### ❓ 追问
TLS 1.2和1.3有什么区别？答：1.3握手从2-RTT减到1-RTT，移除了RSA密钥交换（只保留ECDHE），强制前向保密，安全性更高。什么是证书链？答：终端证书→中间CA证书→根CA证书，逐级验证签名直到浏览器内置的根证书。

---
## 5. HTTP和HTTPS的区别？

> **难度**: easy | **分类**: HTTP | **ID**: 173

#### 🎯 本质
HTTPS在HTTP基础上加入**SSL/TLS加密层**，数据传输加密，防止窃听和篡改。需要CA证书。

#### 🧒 类比
HTTP像明信片(内容暴露)，HTTPS像密封信封(加密传输)。

#### 📊 图解
HTTP: 明文传输 port 80
HTTPS: SSL/TLS加密 port 443

HTTPS=HTTP+TLS
需要: CA证书+公私钥
#### 🔧 详解
HTTPS通过TLS握手协商对称密钥，之后用对称加密传输。CA证书验证服务器身份。HTTPS比HTTP慢(握手开销)，HTTP/2和TLS 1.3减少了延迟。现代浏览器要求HTTPS。

#### 💻 代码
// Node.js HTTPS服务器
const https=require('https');
const fs=require('fs');
const options={
  key:fs.readFileSync('server.key'),
  cert:fs.readFileSync('server.crt')
};
https.createServer(options,app).listen(443);
#### ❓ 追问
TLS 1.3改进了什么？答：1-RTT握手(原来2-RTT)、0-RTT恢复、移除不安全算法。

---
## 6. HTTP状态码分类？

> **难度**: medium | **分类**: HTTP | **ID**: 174

#### 🎯 本质
状态码是**服务器对请求的响应结果**。1xx信息、2xx成功、3xx重定向、4xx客户端错误、5xx服务器错误。

#### 🧒 类比
状态码像快递状态——200已签收、301搬家了、404查无此件、500仓库故障。

#### 📊 图解
1xx: 信息性
  100 Continue
2xx: 成功
  200 OK / 201 Created / 204 No Content
3xx: 重定向
  301永久 / 302临时 / 304未修改
4xx: 客户端错误
  400 Bad Request / 401 / 403 / 404
5xx: 服务器错误
  500 / 502 / 503
#### 🔧 详解
200成功、201创建成功、204无内容(DELETE响应)。301永久重定向(SEO权重转移)、302临时重定向、304缓存命中。401未认证、403无权限、404不存在。500内部错误、502网关错误、503服务不可用。

#### 💻 代码
// Express设置状态码
app.get('/user',(req,res)=>{
  res.status(200).json({name:'Tom'});
});
app.post('/user',(req,res)=>{
  res.status(201).json({id:1});
});
app.use((req,res)=>{
  res.status(404).json({error:'Not Found'});
});
#### ❓ 追问
301和302的SEO区别？答：301转移权重到新URL，302不转移。502和503的区别？答：502网关收到无效响应，503服务暂时不可用。

---
## 7. HTTP缓存机制？

> **难度**: medium | **分类**: HTTP | **ID**: 175

#### 🎯 本质
HTTP缓存通过**Cache-Control/Expires/ETag/Last-Modified**控制资源的缓存策略，减少重复请求。

#### 🧒 类比
缓存像备忘录——看过的内容记下来，下次直接用不用重新查。

#### 📊 图解
强缓存(不问服务器):
  Cache-Control: max-age=3600
  Expires(旧)

协商缓存(问服务器):
  ETag/If-None-Match
  Last-Modified/If-Modified-Since
  → 304 Not Modified
#### 🔧 详解
强缓存未过期直接用(200 from cache)。Cache-Control优先于Expires。no-cache不缓存(实际是不用强缓存每次协商)。no-store完全不缓存。协商缓存用ETag(精确)或Last-Modified(秒级)验证。

#### 💻 代码
// 服务端缓存头
app.get('/static',(req,res)=>{
  res.setHeader('Cache-Control','public,max-age=31536000');
});
app.get('/api/data',(req,res)=>{
  const etag=computeETag(data);
  if(req.headers['if-none-match']===etag){
    return res.status(304).end();
  }
  res.setHeader('ETag',etag);
  res.json(data);
});
#### ❓ 追问
no-cache和no-store的区别？答：no-cache每次协商(304可能)，no-store完全不用缓存。ETag和Last-Modified优先级？答：ETag优先。

---
## 8. HTTP/2特性？

> **难度**: hard | **分类**: HTTP | **ID**: 176

#### 🎯 本质
HTTP/2通过**二进制分帧、多路复用、头部压缩、服务器推送**大幅提升性能，无需多连接即可并行传输。

#### 🧒 类比
HTTP/1.1像单车道(排队通过)，HTTP/2像多车道(同时并行)。

#### 📊 图解
HTTP/2特性:
1.二进制分帧(非文本)
2.多路复用(单连接并行)
3.头部压缩(HPACK)
4.服务器推送
5.流优先级
6.流量控制
#### 🔧 详解
二进制协议更高效解析。多路复用解决了HTTP/1.1的队头阻塞(单TCP连接并行多个请求/响应)。HPACK压缩头部减少开销。服务器推送可预发送资源。但TCP层队头阻塞仍存在(HTTP/3用UDP解决)。

#### 💻 代码
// Node.js HTTP/2
const http2=require('http2');
const server=http2.createSecureServer(options);
server.on('stream',(stream,headers)=>{
  stream.respond({':status':200,'content-type':'text/html'});
  stream.end('Hello HTTP/2');
  // 服务器推送
  stream.pushStream({':path':'/style.css'},(pushStream)=>{
    pushStream.respond({'content-type':'text/css'});
    pushStream.end('body{color:red}');
  });
});
#### ❓ 追问
HTTP/2还有什么队头阻塞？答：TCP层的队头阻塞，HTTP/3用QUIC(UDP)解决。为什么HTTP/2需要HTTPS？答：实践中主流浏览器只在TLS上实现HTTP/2。

---
## 9. Cookie、Session、Token的区别？

> **难度**: medium | **分类**: HTTP | **ID**: 177

#### 🎯 本质
Cookie是**浏览器存储的小段数据**。Session是**服务器端会话状态**。Token(JWT)是**无状态认证凭证**。

#### 🧒 类比
Cookie像随身带的名片，Session像酒店房卡(酒店记住房号)，Token像自助餐手环(验证了就能用)。

#### 📊 图解
Cookie: 浏览器自动携带
  - 大小4KB
  - HttpOnly/Secure/SameSite
Session: 服务器存储
  - sessionId→Cookie
  - 需服务器内存
Token(JWT): 无状态
  - 自包含信息
  - 不需服务器存储
#### 🔧 详解
Cookie每次请求自动发送(同域)。Session存在服务器(内存/Redis)，sessionId通过Cookie传递。JWT是自包含的(Base64编码的header+payload+签名)，服务器不需存储状态。JWT适合微服务和移动端。

#### 💻 代码
// 设置Cookie
res.setHeader('Set-Cookie',
  'token=abc; HttpOnly; Secure; SameSite=Strict; Max-Age=3600'
);
// JWT
const jwt=require('jsonwebtoken');
const token=jwt.sign({userId:123},'secret',{expiresIn:'1h'});
const decoded=jwt.verify(token,'secret');
#### ❓ 追问
JWT的缺点？答：无法主动吊销、payload明文(Base64非加密)、token较大。Cookie的SameSite属性？答：Strict(严格同站)、Lax(导航携带)、None(允许跨站需Secure)。

---
## 10. CORS跨域？

> **难度**: medium | **分类**: HTTP | **ID**: 178

#### 🎯 本质
CORS是**浏览器安全机制**，通过HTTP头部控制跨域请求是否被允许。简单请求直接发，预检请求先OPTIONS。

#### 🧒 类比
CORS像门卫——检查外来请求是否有通行证(响应头)。

#### 📊 图解
简单请求(GET/POST,标准头部):
  → 直接发送+检查响应头

预检请求(PUT/DELETE/自定义头):
  → 先发OPTIONS
  → 服务器返回允许的来源/方法/头
  → 再发实际请求
#### 🔧 详解
Access-Control-Allow-Origin指定允许的源。Allow-Methods/Allow-Headers指定允许的方法和头。Credentials: true时Origin不能是*。预检请求结果可缓存(Access-Control-Max-Age)。

#### 💻 代码
// Express CORS
const cors=require('cors');
app.use(cors({
  origin:'https://example.com',
  methods:['GET','POST'],
  credentials:true
}));
// 或手动设置
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.end();
  next();
});
#### ❓ 追问
为什么CORS是浏览器限制？答：服务器已经收到请求并响应了，浏览器拦截了响应。如何处理Cookie跨域？答：credentials:true + Allow-Origin不能是*。

---
## 11. GET和POST的区别？

> **难度**: easy | **分类**: HTTP | **ID**: 179

#### 🎯 本质
GET用于**获取资源**(参数在URL)，POST用于**提交数据**(参数在请求体)。语义不同但技术上都能传递数据。

#### 🧒 类比
GET像看菜单(展示)，POST像点菜(提交)。

#### 📊 图解
GET: 幂等/可缓存/参数在URL/有长度限制
POST: 非幂等/不可缓存/参数在body/无限制

⚠️ 本质区别是语义而非安全性
#### 🔧 详解
GET是幂等的(多次请求结果一样)。POST非幂等(可能创建多个资源)。GET参数在URL中对用户可见(不安全)。POST在body中。URL长度浏览器有限制(约2K-8K字符)。RESTful中GET查POST增PUT改DELETE删。

#### 💻 代码
// GET
fetch('/api/users?name=Tom')
// POST
fetch('/api/users',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({name:'Tom',age:25})
});
#### ❓ 追问
POST比GET安全吗？答：HTTP都不安全(明文)，安全靠HTTPS。PUT和PATCH的区别？答：PUT全量替换，PATCH部分更新。

---
## 12. HTTPS的TLS握手过程？

> **难度**: medium | **分类**: HTTP | **ID**: 180

#### 🎯 本质
TLS握手通过**非对称加密协商对称密钥**，之后用对称加密通信。TLS 1.3简化为1-RTT。

#### 🧒 类比
TLS握手像两人对暗号确认身份后交换密码本。

#### 📊 图解
TLS 1.2 (2-RTT):
1.Client Hello(支持的加密套件)
2.Server Hello(选定的+证书)
3.密钥交换
4.双方确认

TLS 1.3 (1-RTT):
简化流程+0-RTT恢复
#### 🔧 详解
客户端发送支持的加密套件和随机数。服务端选一个加密套件+发送证书+随机数。客户端验证证书有效性。双方用随机数和私钥生成会话密钥。之后所有通信用对称加密。TLS 1.3移除了RSA密钥交换只保留ECDHE。

#### 💻 代码
// 查看TLS证书
openssl s_client -connect example.com:443
// 生成自签名证书
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes
#### ❓ 追问
什么是证书链？答：根CA→中间CA→服务器证书逐级验证。什么是SNI？答：一个IP多个证书时通过域名选择证书。

---
## 13. HTTP请求方法有哪些？

> **难度**: medium | **分类**: HTTP | **ID**: 181

#### 🎯 本质
HTTP定义了**8种请求方法**：GET获取、POST创建、PUT全量更新、PATCH部分更新、DELETE删除、HEAD获取头、OPTIONS预检、TRACE追踪。

#### 🧒 类比
请求方法像CRUD操作——GET(SELECT)、POST(INSERT)、PUT(UPDATE)、DELETE(DELETE)。

#### 📊 图解
常用:
  GET/POST/PUT/PATCH/DELETE
不常用:
  HEAD(只要响应头)
  OPTIONS(预检)
  TRACE(诊断)
  CONNECT(隧道)
#### 🔧 详解
RESTful API规范用不同方法表示不同操作。PUT是幂等的(全量替换)。PATCH是非幂等的(部分更新语义)。HEAD检查资源是否存在(不下正文)。OPTIONS由浏览器自动发送(CORS预检)。

#### 💻 代码
// RESTful API设计
app.get('/users',listUsers);       // 查
app.post('/users',createUser);     // 增
app.put('/users/:id',updateUser);  // 全量改
app.patch('/users/:id',patchUser); // 部分改
app.delete('/users/:id',deleteUser); // 删
app.head('/users/:id',checkUser);  // 检查存在
#### ❓ 追问
PUT和PATCH实际区别？答：PUT传完整资源替换，PATCH只传变更字段。什么是幂等？答：多次调用效果和一次相同。

---
## 14. HTTP/3和QUIC？

> **难度**: hard | **分类**: HTTP | **ID**: 182

#### 🎯 本质
HTTP/3基于**QUIC协议(UDP)**，解决了HTTP/2的TCP队头阻塞问题，支持0-RTT连接建立和多路复用。

#### 🧒 类比
HTTP/2像高速公路(TCP)但出事故全部堵，HTTP/3像多车道独立道路(QUIC/UDP)一条堵不影响其他。

#### 📊 图解
HTTP/3=HTTP/2语义+QUIC传输

QUIC(UDP-based):
1.无TCP队头阻塞
2.0-RTT连接
3.连接迁移(换网络不断)
4.内置TLS 1.3
5.用户态拥塞控制
#### 🔧 详解
QUIC在UDP上实现了TCP的可靠性和HTTP/2的多路复用。每个流独立不会互相阻塞。连接ID标识连接(不依赖IP+端口)，换WiFi不断连接。0-RTT恢复之前的连接状态。Chrome和Cloudflare已支持HTTP/3。

#### 💻 代码
// 检查HTTP/3支持
// Chrome: chrome://flags/#enable-quic
// curl --http3
curl --http3 https://example.com

// Node.js (实验性)
const http3=require('http3'); // 或使用quic模块
#### ❓ 追问
QUIC为什么选UDP？答：避免内核TCP栈限制、用户态实现灵活。连接迁移的原理？答：用Connection ID而非四元组标识连接。

---
## 15. 什么是RESTful API？

> **难度**: easy | **分类**: HTTP | **ID**: 183

#### 🎯 本质
REST是**资源导向的API设计风格**：用URL表示资源、HTTP方法表示操作、状态码表示结果、无状态。

#### 🧒 类比
REST像图书馆系统——书(URL)按不同操作方式(HTTP方法)管理，规则统一。

#### 📊 图解
REST原则:
1.资源用URL表示(/users/123)
2.HTTP方法表示操作
3.统一接口
4.无状态
5.状态码反馈结果
#### 🔧 详解
URL是名词(资源)不是动词。用HTTP方法区分操作。响应包含状态码和标准化数据格式(JSON)。无状态：每次请求包含所有必要信息。分页/过滤用查询参数。

#### 💻 代码
// RESTful设计
GET    /users         → 列表
GET    /users/123     → 详情
POST   /users         → 创建
PUT    /users/123     → 全量更新
PATCH  /users/123     → 部分更新
DELETE /users/123     → 删除

// 查询参数
GET /users?sort=name&page=2&limit=20
#### ❓ 追问
REST和GraphQL的区别？答：REST多端点固定结构，GraphQL单端点灵活查询。

---
## 16. DNS解析过程？

> **难度**: medium | **分类**: HTTP | **ID**: 184

#### 🎯 本质
DNS将**域名解析为IP地址**。递归查询：浏览器缓存→OS缓存→本地DNS→根DNS→顶级DNS→权威DNS。

#### 🧒 类比
DNS像电话簿——输入名字(域名)查出电话号码(IP)。

#### 📊 图解
DNS解析流程:
1.浏览器DNS缓存
2.OS DNS缓存(hosts文件)
3.本地DNS服务器
4.根DNS服务器
5.顶级域名服务器(.com)
6.权威DNS服务器

→ 返回IP地址
#### 🔧 详解
DNS查询分递归(客户端到本地DNS)和迭代(本地DNS到各级DNS)。DNS记录类型：A(IPv4)、AAAA(IPv6)、CNAME(别名)、MX(邮件)、NS(域名服务器)。DNS缓存有TTL过期时间。DNS预解析(dns-prefetch)提前解析。

#### 💻 代码
// DNS预解析

// Node.js DNS查询
const dns=require('dns');
dns.resolve4('example.com',(err,addresses)=>{
  console.log(addresses); // ['93.184.216.34']
});
#### ❓ 追问
什么是DNS污染？答：返回错误的IP地址。HTTP DNS是什么？答：绕过传统DNS用HTTP请求解析，防止劫持。

---
## 17. WebSocket和HTTP的区别？

> **难度**: medium | **分类**: HTTP | **ID**: 185

#### 🎯 本质
WebSocket是**全双工持久连接**，建立一次连接后双方可随时发数据。HTTP是请求-响应模式每次需新建连接。

#### 🧒 类比
HTTP像对讲机(按一下说一句)，WebSocket像打电话(同时说话)。

#### 📊 图解
HTTP: 请求-响应(单向)
  每次请求新建连接(HTTP/1.1)

WebSocket: 全双工(双向)
  一次握手持久连接
  ws:// 或 wss://
#### 🔧 详解
WebSocket通过HTTP Upgrade握手升级协议。建立后双方可自由发送数据(帧)。适合实时应用(聊天/股票/游戏)。心跳机制(ping/pong)保持连接。SSE是单向的服务器推送替代方案。

#### 💻 代码
// WebSocket
const ws=new WebSocket('wss://example.com/ws');
ws.onopen=()=>ws.send('Hello');
ws.onmessage=(e)=>console.log(e.data);

// Node.js
const WebSocket=require('ws');
const wss=new WebSocket.Server({port:8080});
wss.on('connection',ws=>{
  ws.on('message',msg=>ws.send('Echo: '+msg));
});
#### ❓ 追问
什么时候用SSE而非WebSocket？答：只需服务器→客户端推送时(通知/新闻推送)。

---
