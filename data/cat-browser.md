# 浏览器原理

> 共 17 题

## 1. 浏览器渲染流程？

> **难度**: hard | **分类**: 浏览器原理 | **ID**: 29

#### 🎯 本质
浏览器将 HTML/CSS/JS 转换为屏幕上可见的像素，经过**解析→构建树→布局→绘制→合成**五个关键步骤。

#### 🧒 类比
渲染像盖房子——看图纸（解析HTML/CSS）→搭骨架（DOM/CSSOM树）→确定房间大小（布局）→刷墙装修（绘制）→组合楼层（合成）。

#### 📊 图解
完整渲染流程:

HTML ──解析──→ DOM树
              ├→ Render树(合并DOM+CSSOM)
CSS ──解析──→ CSSOM树  ├→ Layout(布局/回流)
                        ├→ Paint(绘制/重绘)
JS可修改DOM/CSSOM         └→ Composite(合成)

关键路径:
HTML → DOM → CSSOM → Render → Layout → Paint → Composite
                                    ↑
                          JS可能触发任意阶段
#### 🔧 详解
**DOM树**：HTML解析生成，描述页面结构。**CSSOM树**：CSS解析生成，描述样式规则。**Render树**：合并DOM和CSSOM，排除不可见元素（display:none、head）。（注意visibility:hidden还在Render树中）。**Layout**：计算每个节点的位置和大小。**Paint**：将节点绘制为像素。**Composite**：将多个图层合成最终画面（GPU加速）。JS执行可能触发任意阶段的回流或重绘。

#### 💻 代码
// 什么操作触发什么阶段
// 仅触发Composite(GPU)
el.style.transform = "translateX(100px)";

// 触发Layout+Paint+Composite
el.style.width = "200px";

// 触发Paint+Composite
el.style.color = "red";

// 强制同步布局(读写交替=性能杀手)
el.style.width = "100px";        // 写
console.log(el.offsetHeight);    // 读→强制布局!
// 应该: 先读完再写
#### ❓ 追问
为什么操作DOM慢？答：JS引擎和渲染引擎是两个模块，跨引擎操作有开销；且可能触发回流/重绘的级联更新。

---
## 2. 重绘和回流？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 30

#### 🎯 本质
回流(Reflow)=元素几何属性变化，重新计算布局。重绘(Repaint)=外观变化（颜色、阴影等），不影响布局。

#### 🧒 类比
回流像重新摆放家具（改了位置大小），重绘像重新刷墙（只改颜色）。

#### 📊 触发条件
回流: width/height/margin/padding/display/position...
重绘: color/background/box-shadow/visibility...
#### 💡 优化策略
1.使用transform替代top/left（GPU加速）
2.使用visibility:hidden替代display:none
3.批量修改DOM(文档片段/className)
4.避免逐条改style，用cssText一次性设置
5.读写分离（避免强制同步布局）
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
如何在实际项目中应用？

---
## 3. 从输入URL到页面展示的完整流程？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 81

#### 🎯 本质
这是一个**端到端**的Web请求生命周期，涵盖DNS解析、网络连接、数据传输、页面渲染四大阶段，涉及浏览器、操作系统、网络协议、服务器等多个模块的协作。

#### 🧒 类比
像寄快递的全过程——查地址（DNS）→打通电话确认（TCP握手）→确认安全通道（TLS）→下单发货（HTTP请求）→收到包裹拆包（解析渲染）→摆上货架（页面展示）。

#### 📊 图解
完整流程(8步):

① URL解析: 浏览器补全协议,检查HSTS
② DNS解析: 域名→IP地址
  浏览器缓存→OS缓存→路由器→ISP→根域名
③ TCP三次握手: 建立可靠连接
  SYN→SYN+ACK→ACK
④ TLS握手(HTTPS):
  协商加密套件+交换密钥+验证证书
⑤ 发送HTTP请求:
  请求行+请求头+请求体
⑥ 服务端处理+返回响应:
  负载均衡→应用服务器→数据库→组装响应
⑦ 浏览器解析渲染:
  HTML→DOM树
  CSS→CSSOM树
  DOM+CSSOM→Render树
  Layout(布局)→Paint(绘制)→Composite(合成)
⑧ 执行JavaScript:
  可能修改DOM触发回流/重绘
  DOMContentLoaded→load事件
#### 🔧 详解
**DNS解析**可能有缓存命中（浏览器→OS→hosts文件），未命中则递归查询。**TCP握手**后如果是HTTPS还需TLS握手（增加1-2个RTT）。**浏览器解析**是增量式的——HTML边下载边构建DOM树，遇到CSS会阻塞渲染，遇到JS会阻塞解析（加async/defer可异步）。**关键优化点**：DNS预解析、preconnect、资源预加载、SSR。

#### 💻 代码
// 性能分析:各阶段耗时
const [nav] = performance.getEntriesByType("navigation");
console.log("DNS查询:", nav.domainLookupEnd - nav.domainLookupStart, "ms");
console.log("TCP连接:", nav.connectEnd - nav.connectStart, "ms");
console.log("TLS握手:", nav.connectEnd - nav.secureConnectionStart, "ms");
console.log("请求发送:", nav.responseStart - nav.requestStart, "ms");
console.log("响应接收:", nav.responseEnd - nav.responseStart, "ms");
console.log("DOM解析:", nav.domInteractive - nav.responseEnd, "ms");
console.log("总加载:", nav.loadEventEnd - nav.startTime, "ms");

// 优化提示
// DNS预解析
// 
// 预连接
// 
// 资源预加载
// 
#### ❓ 追问
DNS解析的递归和迭代查询有什么区别？答：递归是DNS服务器帮你查到底，迭代是服务器告诉你下一步去哪查。什么是HSTS？答：HTTP Strict Transport Security，浏览器强制使用HTTPS，避免降级攻击。预加载和预获取的区别？答：preload加载当前页面必需资源（高优先级），prefetch加载下一页面可能需要的资源（低优先级）。

---
## 4. Cookie、Session、Token的区别？

> **难度**: easy | **分类**: 浏览器原理 | **ID**: 82

#### 🎯 本质
三者都是**身份认证**的方案。Cookie是浏览器存储机制，Session是服务端会话管理，Token是无状态的认证令牌。它们代表了认证方案从有状态到无状态的演进。

#### 🧒 类比
Cookie像你的身份证（随身携带每次出示），Session像酒店前台给你一个房卡号（前台记录你的信息），Token像一个自带信息的电子证件（不用查后台就知道你是谁）。

#### 📊 图解
认证方案对比:

Cookie+Session:
  登录→服务端创建Session→返回SessionID(设Cookie)
  后续请求自动带Cookie→服务端查Session
  ✅ 简单  ❌ 服务端需存储,不利于扩展
  ❌ CSRF风险(Cookie自动发送)

Token(JWT):
  登录→服务端签发Token(包含用户信息+签名)
  客户端存储(LocalStorage/Cookie)
  请求时Authorization头部带Token
  服务端验签,无需存储
  ✅ 无状态,易扩展  ✅ 跨域友好
  ❌ Token较大  ❌ 无法主动失效

JWT结构: Header.Payload.Signature
  Header: {alg, typ}
  Payload: {userId, role, exp}
  Signature: HMAC(Header+Payload, secret)
#### 🔧 详解
**Cookie+Session**是传统方案，服务端维护所有用户的Session数据，分布式环境需共享Session（用Redis）。**JWT**是无状态方案，Token自带用户信息，服务端只验签不存储，天然支持分布式。但JWT一旦签发无法主动撤销（除非加黑名单）。最佳实践：Access Token（短期）+ Refresh Token（长期）双Token方案。

#### 💻 代码
// JWT签发(Node.js)
const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { userId: 123, role: "admin" },
  "secret",
  { expiresIn: "2h" }
);

// JWT验证
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send();
  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Token无效");
  }
});

// 双Token方案
const accessToken = jwt.sign(payload, secret, { expiresIn: "15m" });
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
// Access Token过期→用Refresh Token换新的
#### ❓ 追问
JWT存在哪里更安全？答：HttpOnly Cookie防XSS但需防CSRF，LocalStorage易被XSS窃取但无CSRF风险。生产环境推荐HttpOnly Cookie+CSRF Token。如何解决JWT无法主动失效的问题？答：维护一个Token黑名单（Redis），或使用短期Access Token+Refresh Token轮换。

---
## 5. 浏览器渲染流程？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 225

#### 🎯 本质
浏览器将HTML/CSS/JS转化为**像素**：解析→DOM/CSSOM→渲染树→布局→绘制→合成。

#### 🧒 类比
浏览器渲染像印刷厂——拿到稿纸(HTML)和设计稿(CSS)，排版→印刷→装订。

#### 📊 图解
渲染流程:
1.解析HTML→DOM树
2.解析CSS→CSSOM树
3.DOM+CSSOM→渲染树
4.布局(Layout/Reflow)
5.绘制(Paint)
6.合成(Composite)
#### 🔧 详解
HTML解析构建DOM树(遇到CSS/JS可能阻塞)。CSS解析构建CSSOM树。两者合并生成渲染树(只包含可见元素)。布局计算每个元素的位置和大小。绘制填充像素。合成将多个图层合并为最终画面。

#### 💻 代码
// Performance API查看
const [nav]=performance.getEntriesByType('navigation');
console.log('DOM解析:',nav.domComplete-nav.domInteractive);
console.log('首字节:',nav.responseStart-nav.requestStart);

// 查看渲染各阶段
const paintEntries=performance.getEntriesByType('paint');
#### ❓ 追问
什么是关键渲染路径？答：HTML到首屏像素的链路。CSS会阻塞什么？答：CSS阻塞渲染(不会阻塞HTML解析但阻塞渲染树构建)。

---
## 6. V8引擎的垃圾回收？

> **难度**: hard | **分类**: 浏览器原理 | **ID**: 226

#### 🎯 本质
V8使用**分代回收**：新生代(Scavenge算法)和老生代(Mark-Sweep/Mark-Compact)。增量标记减少停顿。

#### 🧒 类比
GC像小区垃圾分类——新垃圾快速处理(新生代)，老家具定期大扫除(老生代)。

#### 📊 图解
新生代(1-8MB):
  From→To空间复制(Scavenge)
  存活两次晋升老生代

老生代:
  标记清除(Mark-Sweep)
  标记整理(Mark-Compact)
  增量标记(减少停顿)
#### 🔧 详解
新生代内存分为From和To两半。新对象分配在From。GC时存活对象复制到To并交换。经历过两次Scavenge的对象晋升老生代。老生代用标记清除：从根遍历标记可达对象，清除未标记的。增量标记将标记阶段拆分避免长时间停顿。

#### 💻 代码
// 查看内存使用
console.log(process.memoryUsage());
// {rss:30MB, heapTotal:10MB, heapUsed:8MB}

// 手动触发GC(Node.js启动加--expose-gc)
if(global.gc) global.gc();

// 检测内存泄漏
const before=process.memoryUsage().heapUsed;
doSomething();
const after=process.memoryUsage().heapUsed;
if(after-before>threshold) console.warn('可能的内存泄漏');
#### ❓ 追问
什么是内存泄漏？答：不再使用的对象无法被GC回收。WeakMap/WeakSet为什么不会内存泄漏？答：弱引用不影响GC回收。

---
## 7. 事件循环(Event Loop)？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 227

#### 🎯 本质
事件循环是**JS实现异步的机制**：调用栈→微任务队列→宏任务队列。先清空微任务再取一个宏任务。

#### 🧒 类比
事件循环像医院叫号——急诊(微任务)优先，普通门诊(宏任务)排队。

#### 📊 图解
执行顺序:
1.执行同步代码(调用栈)
2.清空微任务队列
   Promise.then/MutationObserver
3.取一个宏任务
   setTimeout/setInterval/I/O
4.可能渲染(每16.6ms)
5.回到步骤2
#### 🔧 详解
每个宏任务执行完后清空所有微任务。requestAnimationFrame在渲染前执行(既不是微也不是宏)。Promise.then是微任务。setTimeout是宏任务。async/await本质是Promise。微任务优先级高于宏任务。

#### 💻 代码
console.log(1);                    // 同步
setTimeout(()=>console.log(2),0);   // 宏任务
Promise.resolve().then(()=>console.log(3)); // 微任务
console.log(4);                    // 同步
// 输出: 1 4 3 2
#### ❓ 追问
requestAnimationFrame是微任务还是宏任务？答：都不是，在每一帧渲染前执行。

---
## 8. 浏览器进程架构？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 228

#### 🎯 本质
Chrome采用**多进程架构**：浏览器主进程、渲染进程、GPU进程、网络进程、插件进程等。站点隔离让每个站点独立渲染进程。

#### 🧒 类比
浏览器多进程像公司部门制——各部门(进程)独立运作，一个部门崩溃不影响其他。

#### 📊 图解
Chrome进程:
1.浏览器主进程: 地址栏/书签/网络
2.渲染进程: 每个Tab一个(DOM/JS/布局)
3.GPU进程: 3D CSS/Canvas/视频
4.网络进程: HTTP请求
5.插件进程: 每个插件一个

站点隔离(Site Isolation)
#### 🔧 详解
多进程的好处：一个Tab崩溃不影响其他。安全性：渲染进程在沙箱中运行。缺点：每个进程有基础内存开销。站点隔离让不同源的iframe在独立渲染进程中(防Spectre)。

#### 💻 代码
// Chrome查看进程
chrome://process-internals/
// 任务管理器
Shift+Esc

// 性能分析
// Chrome DevTools → Performance面板
// Memory面板查看堆快照
#### ❓ 追问
什么是站点隔离？答：不同源的页面运行在独立渲染进程中。Spectre漏洞的影响？答：CPU侧信道攻击可读取同进程其他页面内存。

---
## 9. 什么是同源策略？

> **难度**: easy | **分类**: 浏览器原理 | **ID**: 229

#### 🎯 本质
同源策略限制**不同源的文档/脚本**之间的交互。同源=协议+域名+端口都相同。

#### 🧒 类比
同源策略像国界线——不同国家(源)之间的人员(脚本)不能随便往来。

#### 📊 图解
同源: 协议+域名+端口完全相同
  https://a.com === https://a.com ✅
  http://a.com ≠ https://a.com ❌
  a.com ≠ b.com ❌

限制:
  Cookie/DOM/JS访问
  AJAX请求

不受限: //
#### 🔧 详解
同源策略限制：1)DOM访问(不同源iframe不能操作)2)Cookie/Storage隔离 3)AJAX请求限制。不受限的标签：script(img/link/video/iframe)可以加载跨域资源。绕过方式：CORS、JSONP、postMessage、代理服务器。

#### 💻 代码
// JSONP绕过(仅GET)
function handleData(data){console.log(data);}

// postMessage跨域通信
iframe.contentWindow.postMessage('hello','https://other.com');
window.addEventListener('message',e=>{
  if(e.origin==='https://trusted.com') console.log(e.data);
});
#### ❓ 追问
JSONP的缺点？答：只支持GET、有安全风险(XSS)。为什么script标签不受同源限制？答：历史原因，Web早期需要加载CDN资源。

---
## 10. 浏览器存储机制？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 230

#### 🎯 本质
浏览器提供**Cookie、localStorage、sessionStorage、IndexedDB**四种存储方案，各有特点和适用场景。

#### 🧒 类比
存储像不同大小的储物柜——Cookie(迷你柜)、localStorage(标准柜)、IndexedDB(仓库)。

#### 📊 图解
Cookie: 4KB, 每次请求携带
localStorage: 5MB+, 持久化
sessionStorage: 5MB+, 标签页关闭清除
IndexedDB: 无限制, 结构化存储

Cache API: Service Worker缓存
#### 🔧 详解
Cookie用于认证/跟踪(有HttpOnly/Secure/SameSite属性)。localStorage存不敏感的持久数据(用户偏好)。sessionStorage存标签页临时数据。IndexedDB存大量结构化数据(离线应用)。Cache API用于PWA离线缓存。

#### 💻 代码
// Cookie
document.cookie='name=Tom; max-age=3600; path=/';
// localStorage
localStorage.setItem('theme','dark');
const theme=localStorage.getItem('theme');
// IndexedDB
const db=await idb.open('myDB',1,upgradeDB=>{
  upgradeDB.createObjectStore('users',{keyPath:'id'});
});
const tx=db.transaction('users','readwrite');
tx.objectStore('users').put({id:1,name:'Tom'});
#### ❓ 追问
localStorage和sessionStorage的区别？答：localStorage跨标签页持久化，sessionStorage标签页隔离且关闭清除。

---
## 11. 浏览器合成层和GPU加速？

> **难度**: hard | **分类**: 浏览器原理 | **ID**: 231

#### 🎯 本质
CSS的**transform和opacity**可以创建独立的合成层由GPU处理，跳过CPU的布局和绘制阶段。

#### 🧒 类比
GPU加速像给特殊元素配了专用电梯——不用和普通元素挤楼梯(CPU重排重绘)。

#### 📊 图解
渲染层→合成层:
  transform: translate3d/translateZ
  will-change: transform/opacity
  position:fixed
  video/canvas/iframe
  CSS animation/transition

合成: GPU处理(快)
#### 🔧 详解
每个合成层由GPU独立处理。合成层之间只需要合并(composite)不需要重绘。transform/opacity不触发layout和paint。但合成层过多会占用大量GPU显存。will-change提前告知浏览器准备GPU层。

#### 💻 代码
// GPU加速
.gpu-accelerated {
  transform: translateZ(0); /* 强制GPU层 */
  will-change: transform;
}
// 动画用transform代替top/left
.animate {
  transition: transform 0.3s ease;
  /* 不用 transition: left 0.3s */
}
.animate:hover {
  transform: translateX(100px);
}
#### ❓ 追问
will-change为什么不能滥用？答：每个合成层占用GPU显存。如何查看合成层？答：Chrome DevTools→Layers面板。

---
## 12. 回流(Reflow)的触发条件？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 232

#### 🎯 本质
回流发生在**元素几何属性变化**或**读取布局属性**时。浏览器会批量处理但读写交替会破坏优化。

#### 🧒 类比
回流像房子重新测量——移动了墙(改布局属性)就要重新量所有房间。

#### 📊 图解
触发回流的操作:
1.改几何属性(width/height/margin)
2.增删DOM元素
3.读布局属性(offsetWidth等)
4.窗口resize
5.字体大小变化
6.改display/position
#### 🔧 详解
修改CSS几何属性会标记需要回流。浏览器会合并多次回流在下一帧统一处理。但读取offsetWidth等属性会强制立即执行排队的回流(强制同步布局)。避免在循环中读写交替。使用requestAnimationFrame批量修改DOM。

#### 💻 代码
// ❌ 强制同步布局
elements.forEach(el=>{
  const h=el.offsetHeight; // 强制回流!
  el.style.height=h+10+'px';
});
// ✅ 先读后写
const heights=elements.map(el=>el.offsetHeight);
heights.forEach((h,i)=>{
  elements[i].style.height=h+10+'px';
});
#### ❓ 追问
什么是布局抖动(Layout Thrashing)？答：循环中读写交替导致频繁强制回流。如何避免？答：批量读→批量写。

---
## 13. 浏览器缓存位置？

> **难度**: easy | **分类**: 浏览器原理 | **ID**: 233

#### 🎯 本质
浏览器缓存有**四个层级**：Service Worker→Memory Cache→Disk Cache→Push Cache。查找从上到下。

#### 🧒 类比
缓存像衣服收纳——随身口袋(SW)→衣柜(内存)→仓库(磁盘)→快递柜(Push)。

#### 📊 图解
缓存优先级:
1.Service Worker缓存(可控)
2.Memory Cache(内存,关闭Tab清除)
3.Disk Cache(磁盘,持久化)
4.Push Cache(HTTP/2推送,会话级)

查找顺序: 从1到4
#### 🔧 详解
Service Worker可完全控制缓存策略。Memory Cache存储当前页面的资源(关闭Tab释放)。Disk Cache持久化存储(按HTTP头决定)。Push Cache是HTTP/2服务器推送的缓存(很少见)。优先级：内存>磁盘。

#### 💻 代码
// 查看缓存
// Chrome DevTools → Application → Cache Storage
// Network面板 → Size列显示缓存来源
//   (from memory cache)/(from disk cache)

// 清除缓存
caches.keys().then(keys=>
  keys.forEach(key=>caches.delete(key))
);
#### ❓ 追问
from memory cache和from disk cache的区别？答：内存缓存快但不持久，磁盘缓存持久但稍慢。

---
## 14. 浏览器的预加载扫描器？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 234

#### 🎯 本质
预加载扫描器是**HTML解析的辅助线程**，在主解析器遇到阻塞资源前提前发现并开始下载。

#### 🧒 类比
预加载扫描像先遣部队——在主力(主解析器)还没到时，先找到需要的物资(资源)提前准备。

#### 📊 图解
工作流程:
1.主线程解析HTML
2.预加载扫描器并行扫描
3.发现CSS/JS/图片等资源
4.提前开始下载(不等主线程到达)

HTML → [主解析器]
     → [预加载扫描器] → 提前下载资源
#### 🔧 详解
预加载扫描器在不阻塞主解析的情况下提前下载资源。它不执行JS只扫描HTML找资源引用。link[rel=preload]显式告诉浏览器优先加载某个资源。这解释了为什么CSS放在head而JS放在body底部。

#### 💻 代码
// 显式预加载

// 预连接

#### ❓ 追问
preload和prefetch的区别？答：preload当前页面需要(高优先)，prefetch未来页面可能需要(低优先)。

---
## 15. 浏览器的任务调度机制？

> **难度**: hard | **分类**: 浏览器原理 | **ID**: 235

#### 🎯 本质
浏览器通过**帧(Frame)**为单位调度任务：JS执行→样式计算→布局→绘制→合成→空闲回调，每帧约16.67ms。

#### 🧒 类比
浏览器像严格的工厂流水线——每个工位(JS/布局/绘制)有固定时间，超时就要等下一轮。

#### 📊 图解
一帧(16.67ms=60fps):
1.处理宏任务+微任务
2.requestAnimationFrame回调
3.样式计算→布局→绘制→合成
4.空闲时间→requestIdleCallback

长任务(>50ms)阻塞帧
#### 🔧 详解
requestAnimationFrame在每帧渲染前执行(适合动画)。requestIdleCallback在空闲时执行(适合低优先级任务)。长任务阻塞主线程导致掉帧。用Web Worker/时间切片(requestIdleCallback/setTimeout分片)处理长任务。

#### 💻 代码
// requestAnimationFrame(动画)
function animate(){
  updateState();
  render();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// requestIdleCallback(低优先级)
requestIdleCallback(deadline=>{
  while(deadline.timeRemaining()>0 && tasks.length){
    doTask(tasks.pop());
  }
  if(tasks.length) requestIdleCallback(processTasks);
});
#### ❓ 追问
requestAnimationFrame和setTimeout的区别？答：rAF与屏幕刷新同步(不丢帧)，setTimeout不保证。什么是长任务？答：超过50ms的JS执行。

---
## 16. 浏览器的跨域通信方式？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 236

#### 🎯 本质
跨域通信通过**postMessage、CORS、代理、WebSocket**等机制实现不同源之间的数据交换。

#### 🧒 类比
跨域通信像外交渠道——不同国家(源)通过大使馆(postMessage)/贸易协定(CORS)交流。

#### 📊 图解
方式:
1.postMessage(窗口间)
2.CORS(AJAX)
3.JSONP(仅GET)
4.WebSocket(不受同源限制)
5.代理服务器(同源代理)
6.document.domain(子域)
#### 🔧 详解
postMessage用于窗口(iframe/新窗口)间通信。CORS用于AJAX跨域。WebSocket不受同源限制。开发环境用webpack-dev-server的proxy。生产环境用Nginx反向代理。CORS是最标准的方式。

#### 💻 代码
// postMessage
// 父窗口
iframe.contentWindow.postMessage(data,'https://child.com');
// 子窗口
window.addEventListener('message',e=>{
  if(e.origin!=='https://parent.com') return;
  console.log(e.data);
});
// Nginx代理
location /api {
  proxy_pass http://backend:8080;
}
#### ❓ 追问
为什么WebSocket不受同源限制？答：WebSocket协议不实现同源策略。代理服务器原理？答：浏览器→同源代理→目标服务器(服务器间无同源限制)。

---
## 17. 浏览器DevTools性能分析？

> **难度**: medium | **分类**: 浏览器原理 | **ID**: 237

#### 🎯 本质
DevTools提供**Performance、Memory、Network、Lighthouse**等面板分析网页性能瓶颈。

#### 🧒 类比
DevTools像体检中心——各种仪器(面板)从不同角度检查网站健康。

#### 📊 图解
常用面板:
Performance: 录制分析运行时性能
Memory: 堆快照/分配时间线
Network: 请求瀑布图
Lighthouse: 综合评分
Coverage: 代码使用率

快捷键: Ctrl+Shift+I
#### 🔧 详解
Performance面板录制后查看FPS/CPU/网络/渲染。火焰图分析JS调用栈。Memory面板拍摄堆快照对比找内存泄漏。Network瀑布图看请求依赖和耗时。Lighthouse评分Performance/Accessibility/SEO/Best Practices。

#### 💻 代码
// 性能标记
performance.mark('start');
doWork();
performance.mark('end');
performance.measure('work','start','end');
console.log(performance.getEntriesByName('work')[0].duration);

// User Timing API在DevTools中显示标记
#### ❓ 追问
什么是Long Task？答：超过50ms的任务在Performance面板中红色标记。如何用Coverage面板？答：查看CSS/JS的使用率，移除未使用的代码。

---
