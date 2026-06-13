# 安全

> 共 17 题

## 1. XSS和CSRF攻击防御？

> **难度**: medium | **分类**: 安全 | **ID**: 36

#### 🎯 本质
**XSS**(跨站脚本)是攻击者向页面注入恶意脚本，**CSRF**(跨站请求伪造)是利用用户已登录的身份发起恶意请求。两者是最常见的前端安全威胁。

#### 🧒 类比
XSS像有人偷偷在你家信箱里塞了张写着指令的纸条（你看到了就执行），CSRF像骗子借用你的VIP卡去消费（网站以为是你本人）。

#### 📊 图解
XSS攻击类型:
  存储型:恶意脚本存入数据库→所有用户加载
  反射型:恶意脚本在URL中→点击即触发
  DOM型:前端JS直接操作恶意输入

XSS防御:
  ① 转义HTML特殊字符(&lt; &gt; &amp; &quot;)
  ② CSP(Content-Security-Policy)限制脚本来源
  ③ HttpOnly禁止JS读取Cookie
  ④ 输入验证+输出编码

CSRF攻击流程:
  用户登录A站→访问B站→B站自动发请求到A站
  (浏览器自动带上A站的Cookie)

CSRF防御:
  ① CSRF Token(服务器签发,每次验证)
  ② SameSite Cookie(SameSite=Strict/Lax)
  ③ 验证Referer/Origin头
  ④ 关键操作需二次确认
#### 🔧 详解
XSS的核心是**输入过滤+输出转义**。Vue/React默认对模板做HTML转义（v-html和dangerouslySetInnerHTML除外）。CSP响应头可限制只加载指定来源的脚本。CSRF的核心是**验证请求来源的合法性**。SameSite=Lax可阻止跨站POST请求携带Cookie（现代浏览器默认开启）。

#### 💻 代码
// XSS转义函数
function escapeHTML(str) {
  return str.replace(/[&lt;&gt;&amp;"]/g, c => ({
    "&": "&amp;", "&lt;": "&lt;",
    "&gt;": "&gt;", "\"": "&quot;"
  }[c]));
}

// CSP响应头
Content-Security-Policy: default-src self;
  script-src self; style-src self;

// CSRF Token(Express)
app.use((req, res, next) => {
  res.locals.csrfToken = crypto.randomBytes(32).toString("hex");
  next();
});
// 前端提交时带上token
fetch("/api", {
  headers: {"X-CSRF-Token": csrfToken}
});
#### ❓ 追问
Vue的v-html有XSS风险吗？答：有，v-html直接输出HTML不转义，永远不要用v-html渲染用户输入。Token放在Cookie还是LocalStorage？答：CSRF Token放Cookie配合验证，JWT放LocalStorage需防XSS。

---
## 2. 什么是同源策略？如何跨域？

> **难度**: easy | **分类**: 安全 | **ID**: 60

#### 🎯本质
**同源策略(SOP)**是浏览器最核心的安全机制，要求**协议+域名+端口**完全一致才允许访问资源。跨域是前端开发中绕不开的问题，需要用合法方案突破这个限制。

#### 🧒类比
同源策略像小区门禁——只有本小区住户（同源）能自由进出，外人（跨域）需要业主授权（CORS）或走访客通道（代理）。

#### 📊图解
同源判断:
  https://a.com:443/page
  协议  域名  端口  → 三者一致=同源

跨域方案对比:
① CORS(最常用)
  服务端设置响应头:
  Access-Control-Allow-Origin
  Access-Control-Allow-Methods
  简单请求vs预检请求(OPTIONS)

② JSONP(已过时)
  利用script标签不受SOP限制
  只支持GET,不安全

③ Nginx反向代理
  前端请求同域→Nginx转发到目标服务
  对前端来说无跨域

④ postMessage
  窗口间通信(iframe/跨窗口)

⑤ WebSocket
  不受同源策略限制
#### 🔧详解
**CORS**是现代标准方案。简单请求（GET/POST+特定Content-Type）直接发，非简单请求先发OPTIONS预检。服务端需配置允许的源、方法、头部和credentials。**Nginx代理**是最稳妥的方案，前端无感知。**开发环境**用webpack/vite的proxy配置即可。

#### 💻代码
// Express设置CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin",
    "https://example.com");
  res.header("Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers",
    "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials",
    "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Vite开发代理
export default {
  server: {
    proxy: {
      "/api": {
        target: "http://backend:3000",
        changeOrigin: true,
        rewrite: path => path.replace(/^/api/, "")
      }
    }
  }
};

// postMessage跨窗口
parent.postMessage({ type: "resize" }, "*");
window.addEventListener("message", e => {
  if (e.origin !== "https://trusted.com") return;
  console.log(e.data);
});
#### ❓追问
CORS预检请求什么时候触发？答：非简单方法(PUT/DELETE)、自定义Header、Content-Type非简单类型时。withCredentials为什么需要服务端配合？答：Cookie跨域需要服务端设置Allow-Credentials:true且Origin不能为*。

---
## 3. HTTPS的加密过程？

> **难度**: hard | **分类**: 安全 | **ID**: 61

#### 🎯本质
HTTPS = HTTP + **TLS/SSL**加密层。核心是先用**非对称加密**（RSA/ECDHE）安全协商出**对称密钥**，再用对称加密（AES）传输数据，兼顾安全性和性能。

#### 🧒类比
HTTPS像寄快递——先用保险箱交换钥匙（非对称加密协商密钥），然后用同一把钥匙锁后续所有包裹（对称加密传输）。因为对称加密速度快但密钥分发不安全，非对称加密安全但慢，两者配合。

#### 📊图解
TLS握手流程(以TLS 1.2为例):

客户端                    服务端
  |---ClientHello-------->|  ①支持的加密套件+随机数
  ||  ⑤用公钥加密预主密钥
  |                       |
  |  双方用三个随机数      |
  |  生成对称会话密钥      |
  |---Finished---------->|  ⑥用会话密钥加密
  |
#### 🔧详解
**数字证书**由CA机构签发，包含公钥+CA签名，浏览器内置CA根证书验证签名链。**ECDHE**比RSA更安全，支持前向保密（私钥泄露不影响历史通信）。TLS 1.3只保留了5个密码套件，全部使用AEAD加密（AES-GCM/ChaCha20-Poly1305）。

#### 💻代码
// Node.js启用HTTPS
const https = require("https");
const fs = require("fs");
const options = {
  key: fs.readFileSync("server-key.pem"),
  cert: fs.readFileSync("server-cert.pem")
};
https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("Secure Hello");
}).listen(443);

// HSTS:强制HTTPS
// 响应头:
Strict-Transport-Security:
  max-age=31536000; includeSubDomains

// 检测TLS版本(浏览器)
console.log(performance.getEntries()
  .filter(e => e.name.startsWith("https"))
  .map(e => ({
    url: e.name,
    duration: e.connectEnd - e.connectStart
  })));
// connect时间包含TLS握手耗时
#### ❓追问
什么是前向保密(PFS)？答：每次会话用不同的临时密钥，服务器私钥泄露不能解密历史通信。ECDHE支持，RSA不支持。证书链验证过程？答：服务器证书→中间CA→根CA，逐级验证签名直到浏览器信任的根证书。

---
## 4. 前端安全还有哪些常见攻击？

> **难度**: medium | **分类**: 安全 | **ID**: 62

#### 🎯本质
除XSS和CSRF外，前端还面临**点击劫持、中间人攻击、DNS劫持、文件上传漏洞、开放重定向**等安全威胁。了解这些攻击手段是构建安全应用的基础。

#### 🧒类比
网络安全像防盗——XSS是有人冒充你家人混进来，CSRF是有人偷你钥匙开门，点击劫持是在你的按钮上盖了层透明纸，中间人攻击是有人偷听你和朋友的电话。

#### 📊图解
① 点击劫持(Clickjacking):
  攻击: 透明iframe覆盖在合法按钮上
  用户以为点击A实际触发B
  防御: X-Frame-Options: DENY
        Content-Security-Policy: frame-ancestors none

② 中间人攻击(MITM):
  攻击: 截获并篡改通信内容
  防御: HTTPS + HSTS
        证书固定(Certificate Pinning)

③ DNS劫持/污染:
  攻击: 篡改DNS解析结果
  防御: DNSSEC / DNS over HTTPS

④ 文件上传漏洞:
  攻击: 上传恶意脚本伪装成图片
  防御: 校验文件头(Magic Number)
        服务端重命名+沙箱存储

⑤ 开放重定向:
  攻击: 利用合法站的跳转链接钓鱼
  防御: 白名单校验跳转域名
#### 🔧详解
**点击劫持**最常见于广告欺诈和社交工程攻击，防御核心是禁止iframe嵌入。**中间人攻击**在HTTP下最易发生，HTTPS是根本解决方案，配合HSTS强制走HTTPS。**文件上传**不能只看后缀名，必须检查文件头（Magic Number）确保类型真实。

#### 💻代码
// 防点击劫持: 服务端设置响应头
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy",
    "frame-ancestors none");
  next();
});

// 防文件上传漏洞: 前端校验
function checkFileType(file) {
  const validTypes = ["image/jpeg","image/png"];
  if (!validTypes.includes(file.type)) {
    return false;
  }
  // 还需服务端校验文件头(Magic Number)
  return true;
}

// 防开放重定向
function safeRedirect(url) {
  const allowed = ["example.com","app.com"];
  const target = new URL(url);
  if (!allowed.includes(target.hostname)) {
    throw new Error("非法跳转");
  }
  window.location.href = url;
}

// 安全响应头集合
app.use(helmet()); // Express中间件
// 自动设置: X-Frame-Options, X-Content-Type-Options
// X-XSS-Protection, Strict-Transport-Security等
#### ❓追问
什么是CSP？答：Content-Security-Policy响应头，限制页面能加载哪些来源的资源（脚本、样式、图片等），是防XSS的重要手段。什么是HTTPS降级攻击？答：攻击者把HTTPS请求转为HTTP，HSTS可以防御。

---
## 5. XSS攻击和防御？

> **难度**: medium | **分类**: 安全 | **ID**: 212

#### 🎯 本质
XSS(跨站脚本)是**注入恶意脚本到网页**。存储型/反射型/DOM型。防御：转义+ CSP + HttpOnly。

#### 🧒 类比
XSS像有人在你杯子里下药——网页被注入了恶意代码。

#### 📊 图解
XSS类型:
存储型: 恶意代码存入数据库
反射型: URL参数中注入
DOM型: 前端JS动态渲染

防御:
1.输出转义(HTML/JS/URL)
2.CSP(Content-Security-Policy)
3.HttpOnly Cookie
4.输入验证
#### 🔧 详解
存储型XSS最危险(影响所有用户)。反射型通过URL传播(钓鱼链接)。DOM型纯前端漏洞。防御核心：不信任任何用户输入。输出时根据上下文转义(HTML上下文/JS上下文/URL上下文)。CSP限制脚本来源。

#### 💻 代码
// 输出转义
function escapeHTML(str){
  return str.replace(/[&<>"]/g,c=>
    ({'&':'&amp;','':'&gt;','"':'&quot;'}[c])
  );
}
// CSP
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
// HttpOnly
Set-Cookie: token=abc; HttpOnly; Secure
#### ❓ 追问
什么是DOMPurify？答：安全的HTML净化库。什么是mXSS？答：突变XSS，浏览器解析器改变HTML结构导致绕过转义。

---
## 6. CSRF攻击和防御？

> **难度**: medium | **分类**: 安全 | **ID**: 213

#### 🎯 本质
CSRF(跨站请求伪造)利用**已登录用户的身份**发起恶意请求。防御：Token/Referer检查/SameSite Cookie。

#### 🧒 类比
CSRF像有人伪造你的签名——利用你已经登录的身份做坏事。

#### 📊 图解
攻击流程:
1.用户登录A站(Cookie有效)
2.访问恶意B站
3.B站自动发请求到A站
4.浏览器自动携带A站Cookie

防御:
1.CSRF Token
2.SameSite Cookie
3.Referer检查
#### 🔧 详解
CSRF利用浏览器自动携带Cookie的特性。攻击者构造恶意页面发送跨站请求。防御：SameSite=Strict/Lax(最简单)、CSRF Token(每个表单一个随机token)、验证Referer/Origin头、双重Cookie验证。

#### 💻 代码
// CSRF Token
app.use((req,res,next)=>{
  res.locals.csrfToken=crypto.randomBytes(16).toString('hex');
  res.cookie('csrfToken',res.locals.csrfToken);
});
// 表单
'>
// 验证
if(req.body._csrf !== req.cookies.csrfToken) throw new Error('CSRF');
#### ❓ 追问
SameSite Cookie能完全防CSRF吗？答：基本能，但老浏览器不支持。CSRF Token原理？答：攻击者无法获取第三方站点的Token。

---
## 7. 什么是HTTPS加密？

> **难度**: easy | **分类**: 安全 | **ID**: 214

#### 🎯 本质
HTTPS通过**TLS/SSL协议**加密HTTP通信。对称加密(快)+非对称加密(安全)组合使用。

#### 🧒 类比
HTTPS像把信件装进密码箱——只有收件人有钥匙能打开。

#### 📊 图解
加密流程:
1.非对称加密协商密钥(RSA/ECDHE)
2.证书验证身份(CA)
3.对称加密传输数据(AES)

为什么组合用:
非对称: 安全但慢
对称: 快但密钥传输不安全
#### 🔧 详解
TLS先用非对称加密安全地交换对称密钥。然后用对称加密传输数据(快)。CA证书验证服务器身份(防止中间人)。现代TLS 1.3更快更安全(1-RTT握手)。

#### 💻 代码
// 生成密钥对
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
// 加密解密
const crypto=require('crypto');
const encrypted=crypto.publicEncrypt(publicKey,Buffer.from('hello'));
const decrypted=crypto.privateDecrypt(privateKey,encrypted);
#### ❓ 追问
什么是中间人攻击(MITM)？答：攻击者截获并可能修改通信内容。HTTPS能完全防止窃听吗？答：加密内容可以，但元数据(域名/IP)仍可见。

---
## 8. JWT安全实践？

> **难度**: hard | **分类**: 安全 | **ID**: 215

#### 🎯 本质
JWT(JSON Web Token)是**无状态认证令牌**。安全实践：短期token+refresh token、HTTPS传输、不在payload存敏感信息。

#### 🧒 类比
JWT像游乐园手环——上面盖了章(签名)证明你买了票，但手环上不写你的身份证号。

#### 📊 图解
JWT结构: Header.Payload.Signature
  Header: {alg,typ}
  Payload: {userId,exp,...}
  Signature: HMAC(header.payload,secret)

安全要点:
1.alg:none攻击(服务端强制算法)
2.密钥强度
3.过期时间
4.刷新机制
#### 🔧 详解
JWT的payload是Base64编码不是加密(任何人都能解码)。签名保证数据不被篡改。最佳实践：access_token短期(15分钟)+refresh_token长期(7天)。Redis黑名单实现主动吊销。不要存敏感信息。

#### 💻 代码
// 生成JWT
const token=jwt.sign(
  {userId:123,role:'admin'},
  process.env.JWT_SECRET,
  {expiresIn:'15m'}
);
// 验证
try{
  const decoded=jwt.verify(token,process.env.JWT_SECRET);
}catch(e){/* 过期或无效 */}

// Refresh Token
app.post('/refresh',(req,res)=>{
  const {refreshToken}=req.body;
  if(validate(refreshToken)){
    const newToken=jwt.sign({...},secret,{expiresIn:'15m'});
    res.json({accessToken:newToken});
  }
});
#### ❓ 追问
如何实现JWT主动吊销？答：Redis黑名单存储已吊销的token ID。JWT和Session各自安全优势？答：JWT无状态易扩展，Session可立即吊销。

---
## 9. SQL注入和防御？

> **难度**: medium | **分类**: 安全 | **ID**: 216

#### 🎯 本质
SQL注入是**将恶意SQL插入输入参数**操纵数据库。防御：参数化查询、ORM、输入验证。

#### 🧒 类比
SQL注入像在表格里填恶意内容——本来填姓名的地方写了SQL命令。

#### 📊 图解
攻击示例:
输入: ' OR '1'='1
SQL: SELECT * FROM users WHERE name='' OR '1'='1'

防御:
1.参数化查询(最有效)
2.ORM(自动参数化)
3.输入验证+转义
4.最小权限原则
#### 🔧 详解
永远不要拼接SQL字符串。参数化查询让数据库区分代码和数据。ORM(如Sequelize/Prisma)自动使用参数化。输入验证限制字符类型。数据库账户使用最小权限(不用的DROP/DELETE权限不给)。

#### 💻 代码
// ❌ 危险的SQL拼接
const sql=`SELECT * FROM users WHERE name='${name}'`;
db.query(sql);

// ✅ 参数化查询
const sql='SELECT * FROM users WHERE name=?';
db.query(sql,[name]);

// ✅ ORM(Prisma)
const user=await prisma.user.findUnique({
  where:{name:name}
});
#### ❓ 追问
什么是预编译语句？答：SQL先编译后绑定参数，代码和数据完全分离。NoSQL注入是什么？答：MongoDB等NoSQL的注入攻击。

---
## 10. 什么是CSP？

> **难度**: easy | **分类**: 安全 | **ID**: 217

#### 🎯 本质
CSP(Content-Security-Policy)通过**HTTP响应头**限制页面能加载哪些资源(脚本/样式/图片等)，是XSS防御的重要手段。

#### 🧒 类比
CSP像网站的白名单制度——只允许指定来源的内容。

#### 📊 图解
CSP指令:
default-src: 默认策略
script-src: JS来源
style-src: CSS来源
img-src: 图片来源
connect-src: AJAX/WebSocket
frame-src: iframe来源
font-src: 字体来源
#### 🔧 详解
CSP限制浏览器只加载指定来源的资源。'self'表示同源。'unsafe-inline'允许内联(降低安全性)。'unsafe-eval'允许eval。report-uri指定违规报告地址。nonce-xxx/hash-xxx允许特定内联脚本。

#### 💻 代码
// HTTP头
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self'

// HTML meta标签

// Nonce方式
console.log('allowed');
#### ❓ 追问
什么是nonce？答：服务器生成的随机值，只有匹配的script标签才执行。CSP report-only模式？答：只报告不阻止用于测试。

---
## 11. 点击劫持(Clickjacking)？

> **难度**: medium | **分类**: 安全 | **ID**: 218

#### 🎯 本质
点击劫持通过**透明iframe覆盖**诱骗用户点击恶意页面上的按钮。

#### 🧒 类比
点击劫持像在真按钮上贴透明假按钮——你以为点的是确认其实是转账。

#### 📊 图解
攻击方式:
1.透明iframe覆盖目标站
2.CSS opacity:0隐藏iframe
3.用户看到的按钮实际在iframe上

防御:
X-Frame-Options
CSP frame-ancestors
JS frame-busting
#### 🔧 详解
攻击者用iframe嵌入目标网站，设置透明度让用户看不到。在上面放一层诱饵内容。用户点击诱饵实际点击了iframe中的按钮。防御：X-Frame-Options: DENY/SAMEORIGIN，或CSP的frame-ancestors指令。

#### 💻 代码
// 服务端防御
app.use((req,res,next)=>{
  res.setHeader('X-Frame-Options','DENY');
  // 或
  res.setHeader('Content-Security-Policy',
    "frame-ancestors 'none'");
});
// JS防御
if(top!==self) top.location=self.location;
#### ❓ 追问
X-Frame-Options的三个值？答：DENY(禁止)、SAMEORIGIN(同源允许)、ALLOW-FROM(已废弃)。

---
## 12. 密码安全存储？

> **难度**: medium | **分类**: 安全 | **ID**: 219

#### 🎯 本质
密码不能明文存储。使用**加盐哈希(salt+hash)**：bcrypt/scrypt/Argon2。不用MD5/SHA。

#### 🧒 类比
密码存储像寄存贵重物品——不能原样存(明文)，要加密后只存加密结果。

#### 📊 图解
安全存储:
1.加盐(salt): 防止彩虹表
2.慢哈希: bcrypt/scrypt/Argon2
3.工作因子: 增加计算成本

❌ 不安全:
MD5/SHA1/SHA256(太快)
#### 🔧 详解
salt是随机字符串，每个用户不同。即使两个用户密码相同哈希值也不同。慢哈希算法故意增加计算时间(10-100ms)使暴力破解成本极高。bcrypt自动管理salt。Argon2是2015年密码哈希竞赛冠军。

#### 💻 代码
// Node.js bcrypt
const bcrypt=require('bcrypt');
const hash=await bcrypt.hash(password,12); // cost factor 12
const match=await bcrypt.compare(inputPassword,hash);

// 注册
async function register(username,password){
  const hash=await bcrypt.hash(password,12);
  await db.createUser({username,password:hash});
}
#### ❓ 追问
什么是彩虹表？答：预计算的哈希值对照表。bcrypt的cost factor？答：2的次方，越大越慢越安全。

---
## 13. 前端安全最佳实践？

> **难度**: easy | **分类**: 安全 | **ID**: 220

#### 🎯 本质
前端安全要关注**输入验证、输出转义、敏感数据处理、HTTPS**等。安全是多层防御。

#### 🧒 类比
前端安全像家里的多重锁——门锁(验证)+保险箱(加密)+监控(日志)。

#### 📊 图解
安全清单:
1.输入验证+输出转义
2.Https传输
3.HttpOnly/Secure Cookie
4.CSP策略
5.不存敏感信息在前端
6.第三方依赖审计
#### 🔧 详解
不在localStorage存敏感token(用HttpOnly Cookie)。不信任任何用户输入(前端验证是体验，后端验证是安全)。定期更新依赖(npm audit)。不暴露内部API结构。环境变量不暴露到前端。

#### 💻 代码
// 安全Cookie设置
res.cookie('token',jwt,{
  httpOnly:true,  // JS不能访问
  secure:true,    // 只HTTPS
  sameSite:'strict',
  maxAge:900000
});

// 依赖审计
npm audit
npm audit fix
#### ❓ 追问
为什么前端验证不够？答：可以绕过前端直接发请求。什么是供应链攻击？答：通过恶意npm包注入代码。

---
## 14. OAuth 2.0授权流程？

> **难度**: hard | **分类**: 安全 | **ID**: 221

#### 🎯 本质
OAuth 2.0是**授权框架**，让用户授权第三方应用访问其资源而不暴露密码。常用授权码模式。

#### 🧒 类比
OAuth像酒店房卡——你授权前台给朋友一张临时房卡(访问令牌)而不是给房间钥匙(密码)。

#### 📊 图解
授权码模式:
1.用户点击'用微信登录'
2.跳转到微信授权页
3.用户同意→回调带code
4.后端用code换token
5.用token获取用户信息

角色: 资源所有者/客户端/授权服务器/资源服务器
#### 🔧 详解
授权码模式最安全(适合有后端的应用)。隐式模式已不推荐(Implicit Flow)。PKCE为移动/SPA增加安全性。刷新令牌用于获取新的访问令牌。OpenID Connect在OAuth 2.0上加了身份认证层。

#### 💻 代码
// 授权码流程(Node.js)
// 1.跳转授权
res.redirect(`https://auth.example.com/authorize?
  response_type=code&
  client_id=${CLIENT_ID}&
  redirect_uri=${CALLBACK}&
  scope=read&
  state=${randomState}`);
// 2.回调获取token
const {access_token}=await axios.post('/token',{
  grant_type:'authorization_code',
  code:req.query.code,
  redirect_uri:CALLBACK,
  client_id:CLIENT_ID,
  client_secret:SECRET
});
#### ❓ 追问
什么是PKCE？答：为公共客户端(SPA/移动端)增加的安全扩展。state参数的作用？答：防止CSRF攻击。

---
## 15. 什么是CORS安全策略？

> **难度**: medium | **分类**: 安全 | **ID**: 222

#### 🎯 本质
CORS既是**跨域解决方案**也是**安全机制**。浏览器通过预检请求和响应头控制跨域访问。

#### 🧒 类比
CORS像海关——检查外来货物(跨域请求)是否符合规定。

#### 📊 图解
安全要点:
1.Access-Control-Allow-Origin不能为*且携带凭证
2.预检请求(OPTIONS)可以被缓存
3.CORS不阻止请求只是不暴露响应
4.服务端需要自行验证Origin
#### 🔧 详解
CORS是浏览器安全策略不是服务端的。即使CORS阻止了响应，请求已经到达服务器并执行了。所以服务端也需要验证Origin。不要反射Origin头(安全漏洞)。生产环境用白名单。

#### 💻 代码
// 安全的CORS配置
const allowedOrigins=['https://app.com','https://admin.com'];
app.use((req,res,next)=>{
  const origin=req.headers.origin;
  if(allowedOrigins.includes(origin)){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Access-Control-Allow-Credentials','true');
  }
});
#### ❓ 追问
为什么不能Access-Control-Allow-Origin: *且credentials:true？答：浏览器安全策略禁止。

---
## 16. 会话管理和Cookie安全？

> **难度**: medium | **分类**: 安全 | **ID**: 223

#### 🎯 本质
安全的会话管理需要**安全的Cookie属性、合理的过期策略、会话固定防护**。

#### 🧒 类比
会话管理像旅馆住宿——房卡(Cookie)要有有效期、不能被复制(HttpOnly)、丢了要能注销。

#### 📊 图解
Cookie安全:
HttpOnly: JS不可读
Secure: 只HTTPS传输
SameSite: 防CSRF

会话管理:
- 登录后重新生成session ID
- 合理的过期时间
- 同步登录态清理
#### 🔧 详解
HttpOnly防止XSS窃取Cookie。Secure防止HTTP传输中泄露。SameSite防止CSRF。会话固定攻击防御：登录后生成新的session ID。绝对超时+空闲超时。登出时服务端清除session。

#### 💻 代码
app.use(session({
  secret:process.env.SESSION_SECRET,
  cookie:{
    httpOnly:true,
    secure:true,
    sameSite:'strict',
    maxAge:3600000 // 1小时
  },
  resave:false,
  saveUninitialized:false,
  genid:()=>crypto.randomUUID()
}));
#### ❓ 追问
什么是会话固定攻击？答：攻击者设定session ID等受害者登录后使用。如何防护？答：登录后重新生成session ID。

---
## 17. 内容安全相关HTTP头？

> **难度**: medium | **分类**: 安全 | **ID**: 224

#### 🎯 本质
安全相关HTTP响应头为浏览器提供**额外的安全指令**：X-Content-Type-Options、X-Frame-Options、Strict-Transport-Security等。

#### 🧒 类比
安全头像给浏览器发安全手册——告诉浏览器遇到各种情况怎么做。

#### 📊 图解
安全响应头:
Strict-Transport-Security: 强制HTTPS
X-Content-Type-Options: nosniff
X-Frame-Options: 防点击劫持
X-XSS-Protection: XSS过滤(已过时)
Referrer-Policy: 控制Referer
Permissions-Policy: 功能权限
#### 🔧 详解
HSTS告诉浏览器所有请求都用HTTPS(max-age+includeSubDomains+preload)。nosniff防止MIME类型嗅探。X-Frame-Options防点击劫持。Referrer-Policy控制请求中Referer的暴露。helmet库自动设置这些头。

#### 💻 代码
// Express helmet
const helmet=require('helmet');
app.use(helmet()); // 自动设置所有安全头

// 手动设置
app.use((req,res,next)=>{
  res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
});
#### ❓ 追问
什么是HSTS preload？答：提交到浏览器内置列表即使第一次访问也用HTTPS。

---
