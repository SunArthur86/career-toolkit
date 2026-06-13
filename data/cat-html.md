# HTML

> 共 14 题

## 1. HTML5语义化标签？

> **难度**: easy | **分类**: HTML | **ID**: 21

#### 🎯 本质
HTML5语义化标签是用有意义的标签名来描述内容的结构和含义，而非只用 div/span。让机器（搜索引擎、屏幕阅读器）和开发者都能理解页面结构。

#### 🧒 类比
非语义化像所有书都不写书名只用编号（div1、div2...），语义化像每本书都标好书名和分类——一看就知道是什么。

#### 📊 图解
HTML5常用语义化标签:
   页头/区域头部
      导航链接区域
     页面主内容(唯一)
  独立完整的内容块
  主题性分组(带标题)
    侧边栏/附加内容
   页脚/区域尾部
   图片+说明(ficaption)
  可折叠详情(配合summary)
   对话框/模态框
     时间日期
     高亮标记
#### 🔧 详解
语义化的好处：**SEO友好**（搜索引擎更容易理解页面结构）、**无障碍**（屏幕阅读器能正确导航）、**可维护性**（代码结构清晰）。一个页面应该只有一个 main 标签，article 代表可独立分发的内容（博客文章、评论）。

#### 💻 代码

  
    首页
    关于
  

  
    文章标题
    2024年1月
    文章内容...

  
  相关推荐

版权信息
#### ❓ 追问
section 和 div 的区别？答：section 有语义（带标题的主题分组），div 无语义。没有标题的内容不要用 section。

---
## 2. localStorage、sessionStorage、Cookie区别？

> **难度**: easy | **分类**: HTML | **ID**: 22

#### 🎯 本质
三者都是浏览器端的存储机制，但**容量、生命周期、网络行为**各不相同。Cookie是HTTP协议的一部分，localStorage/sessionStorage是Web Storage API。

#### 🧒 类比
Cookie 像身份证（随身携带，每次都出示），localStorage 像家里保险柜（永久存放，不会带着走），sessionStorage 像酒店房卡（退房就失效）。

#### 📊 图解
         Cookie    localStorage  sessionStorage
容量      4KB       5MB           5MB
生命周期  可设过期   永久(手动清除) 关标签页消失
HTTP请求  自动携带   不发送        不发送
作用域    同源+路径  同源          同源+同标签页
API      document   window.       window.
         .cookie    localStorage  sessionStorage

操作API:
localStorage.setItem("key","value")
localStorage.getItem("key")
localStorage.removeItem("key")
localStorage.clear()
#### 🔧 详解
Cookie 每次 HTTP 请求自动携带，影响性能，适合身份认证（设 HttpOnly 防XSS）。localStorage 适合持久化配置（主题、语言）。sessionStorage 适合临时数据（表单草稿）。三者都只能存字符串，对象需JSON.stringify。

#### 💻 代码
// localStorage
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme");
localStorage.removeItem("theme");

// 存对象
const user = { name: "Tom", age: 25 };
localStorage.setItem("user", JSON.stringify(user));
const saved = JSON.parse(localStorage.getItem("user"));

// Cookie(需要自己拼字符串)
document.cookie = "token=abc; max-age=3600; path=/";
// 注意:没有原生的getCookie方法,需手动解析
#### ❓ 追问
localStorage 能跨域共享吗？答：不能，同源策略限制。如何监听 localStorage 变化？答：window.addEventListener("storage", handler)，注意只在其他标签页触发。

---
## 3. script标签的defer和async？

> **难度**: medium | **分类**: HTML | **ID**: 119

#### 🎯 本质
**defer**延迟执行——下载不阻塞解析，解析完后按顺序执行。**async**异步执行——下载完立即执行不保证顺序。

#### 🧒 类比
defer像排队买票按顺序来，async像抢购谁先下载完谁先执行。

#### 📊 图解
defer: HTML→遇script→后台下载→继续解析→解析完→按序执行
async: HTML→遇script→后台下载→下载完立即执行(可能打断解析)
#### 🔧 详解
defer保证顺序适合有依赖的脚本，async适合独立脚本(统计/广告)。动态创建script默认async。defer只对外部脚本有效。

#### 💻 代码

#### ❓ 追问
module类型script默认defer吗？答：是的。动态import和静态import的区别？答：静态编译时确定，动态运行时加载。

---
## 4. meta viewport的作用？

> **难度**: medium | **分类**: HTML | **ID**: 120

#### 🎯 本质
viewport meta标签控制**移动端浏览器的视口行为**——宽度、缩放、用户缩放权限。

#### 🧒 类比
viewport像手机屏幕取景框——告诉浏览器用多大的框显示网页。

#### 📊 图解
viewport属性：
width=device-width → 视口=设备宽度
initial-scale=1 → 初始缩放100%
user-scalable=yes → 允许缩放(无障碍要求)
#### 🔧 详解
没有viewport meta时移动浏览器假设页面宽980px然后缩小显示。accessibility要求不禁止用户缩放。safe-area-inset处理刘海屏。

#### 💻 代码

padding: env(safe-area-inset-top);
#### ❓ 追问
CSS像素和设备像素的区别？答：通过devicePixelRatio换算。什么是3倍屏？答：1个CSS像素对应3个物理像素。

---
## 5. Web Components了解吗？

> **难度**: medium | **分类**: HTML | **ID**: 121

#### 🎯 本质
Web Components是浏览器原生的**组件化标准**：Custom Elements、Shadow DOM、HTML Templates。

#### 🧒 类比
像标准化零件——不管你用什么框架，零件都能通用。

#### 📊 图解
三件套：
1.Custom Elements→自定义HTML标签
2.Shadow DOM→封装DOM(样式隔离)
3.HTML Templates→+
#### 🔧 详解
Custom Elements定义新标签支持生命周期回调。Shadow DOM创建隔离DOM子树外部CSS不影响内部。Slots类似Vue的slot允许外部传入内容。

#### 💻 代码
class MyCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode:"open"});
    shadow.innerHTML = `
      :host{display:block;border:1px solid #ccc;}
      `;
  }
}
customElements.define("my-card",MyCard);
#### ❓ 追问
Shadow DOM和Virtual DOM的区别？答：Shadow DOM是浏览器封装，Virtual DOM是框架优化。

---
## 6. 浏览器同源策略和跨域方案？

> **难度**: hard | **分类**: HTML | **ID**: 122

#### 🎯 本质
**同源策略**限制不同源的文档交互。同源=协议+域名+端口完全一致。跨域方案：CORS、代理、postMessage等。

#### 🧒 类比
同源策略像门禁系统——外面的人需要特殊通行证(CORS)。

#### 📊 图解
跨域方案对比：
1.CORS(推荐)→服务端设置响应头
2.代理→开发时vite/webpack代理
3.postMessage→跨窗口通信
4.JSONP→只支持GET(过时)
#### 🔧 详解
CORS最标准：服务端设Access-Control-Allow-Origin。简单请求直接发，预检请求先发OPTIONS。Vite代理开发用，Nginx反向代理生产用。Cookie跨域需SameSite和withCredentials。

#### 💻 代码
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','https://my-site.com');
  res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
  if(req.method==='OPTIONS') return res.sendStatus(204);
  next();
});
#### ❓ 追问
什么是CSRF？答：伪造请求利用已登录状态。预检请求什么时候触发？答：非简单请求(自定义头/PUT/DELETE)。

---
## 7. Web Worker和Service Worker？

> **难度**: medium | **分类**: HTML | **ID**: 123

#### 🎯 本质
**Web Worker**在后台线程运行JS不阻塞UI。**Service Worker**是特殊Worker充当网络代理实现离线缓存和推送。

#### 🧒 类比
Web Worker像后台助手帮你算数，Service Worker像前台接待拦截所有网络请求。

#### 📊 图解
Web Worker: 后台计算，postMessage通信
Service Worker: 网络代理，离线缓存，推送通知
生命周期: install→activate→fetch
#### 🔧 详解
Web Worker不能操作DOM，通过postMessage通信。Service Worker有独立生命周期，必须HTTPS，可拦截fetch请求实现缓存策略。

#### 💻 代码
const w = new Worker('worker.js');
w.postMessage({data: largeArray});
w.onmessage = e => console.log(e.data);

// Service Worker
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
#### ❓ 追问
SharedArrayBuffer是什么？答：允许多个Worker共享内存。SW更新策略？答：检测新SW→安装→等待旧SW结束→激活。

---
## 8. HTML5新增的input类型？

> **难度**: easy | **分类**: HTML | **ID**: 124

#### 🎯 本质
HTML5新增了多种**语义化input类型**：email、url、number、range、date、color、search、tel等，提供更好的移动端输入体验和内置验证。

#### 🧒 类比
像给表单字段装了智能识别器——email类型自动弹出邮箱键盘，date类型弹出日历选择器。

#### 📊 图解
新增input类型：
email/url/tel/number/range
 date/month/week/time/datetime-local
 color/search/file

好处：
- 移动端适配键盘
- 内置验证
- 浏览器原生UI组件
#### 🔧 详解
email类型自动验证邮箱格式并在移动端弹出@键盘。date类型显示原生日期选择器。pattern属性可自定义正则验证。required标记必填。表单验证用checkValidity()和:valid/:invalid伪类。

#### 💻 代码

/* CSS验证样式 */
input:valid { border-color: green; }
input:invalid { border-color: red; }
#### ❓ 追问
datalist是什么？答：为input提供预定义选项列表。reportValidity()和checkValidity()的区别？答：前者显示浏览器验证提示，后者只返回布尔值。

---
## 9. 拖放(Drag and Drop)API？

> **难度**: medium | **分类**: HTML | **ID**: 125

#### 🎯 本质
HTML5原生**拖放API**通过事件监听实现元素的拖拽和放置，包括dragstart/dragover/drop等事件。

#### 🧒 类比
像搬家具——抬起来(dragstart)、经过门口(dragover)、放下(drop)，每一步都有对应的动作。

#### 📊 图解
事件流程：
dragstart(源元素) → drag(持续) → dragenter(进入目标)
→ dragover(在目标上方) → drop(放下) → dragend(结束)

dataTransfer对象：
setData() / getData() 携带数据
#### 🔧 详解
dragover必须preventDefault()才能触发drop事件(默认禁止放置)。dataTransfer传递拖拽数据。可设置effectAllowed和dropEffect控制视觉效果。draggable属性使元素可拖拽。

#### 💻 代码
拖我
放这里

item.addEventListener('dragstart', e => {
  e.dataTransfer.setData('text', e.target.id);
});
dropzone.addEventListener('dragover', e => {
  e.preventDefault(); // 必须阻止默认
});
dropzone.addEventListener('drop', e => {
  const id = e.dataTransfer.getData('text');
  e.target.appendChild(document.getElementById(id));
});
#### ❓ 追问
如何自定义拖拽图像？答：setDragImage(element, x, y)。移动端拖放怎么处理？答：需要touch事件或用库如SortableJS。

---
## 10. 表单验证方法？

> **难度**: medium | **分类**: HTML | **ID**: 126

#### 🎯 本质
HTML5提供**声明式验证**(required/pattern/min/max)和**JS验证**(Constraint Validation API)两种方式。

#### 🧒 类比
声明式像门口保安看工牌(属性验证)，JS验证像前台人工核实(编程验证)。

#### 📊 图解
声明式验证属性：
required / minlength / maxlength
min / max / pattern(正则) / type

JS验证API：
checkValidity() → boolean
reportValidity() → 显示提示
setCustomValidity(msg) → 自定义错误
validity对象：
valueMissing/typeMismatch/patternMismatch
#### 🔧 详解
声明式简单但不够灵活。JS验证可自定义逻辑和提示。:valid/:invalid伪类控制样式。novalidate属性禁止浏览器默认验证。实时验证监听input事件，提交验证监听submit事件。

#### 💻 代码
const form = document.querySelector('form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const email = form.querySelector('[type=email]');
  if (!email.checkValidity()) {
    email.setCustomValidity('请输入正确的邮箱');
    email.reportValidity();
  } else {
    email.setCustomValidity('');
    form.submit();
  }
});
#### ❓ 追问
如何实现异步验证(如用户名是否已存在)？答：input事件中debounce后fetch检查。如何禁用浏览器默认验证？答：form加novalidate属性。

---
## 11. Geolocation API？

> **难度**: easy | **分类**: HTML | **ID**: 127

#### 🎯 本质
Geolocation API让网页获取用户的**地理位置**(经纬度)，需用户授权。适合地图、天气、附近服务等场景。

#### 🧒 类比
像手机上的定位功能——网站想知道你在哪，得先问你同不同意。

#### 📊 图解
navigator.geolocation方法：
getCurrentPosition(success, error, options)
watchPosition() → 持续监听位置变化
clearWatch() → 停止监听

options:
enableHighAccuracy: true
timeout: 10000
maximumAge: 0
#### 🔧 详解
浏览器会弹出授权提示。HTTPS环境必须。返回coords对象包含latitude/longitude/accuracy。watchPosition实时追踪适合导航。注意隐私保护，不在后台持续定位。

#### 💻 代码
navigator.geolocation.getCurrentPosition(
  pos => {
    console.log(`纬度:${pos.coords.latitude}`);
    console.log(`经度:${pos.coords.longitude}`);
  },
  err => console.error(err),
  { enableHighAccuracy: true }
);
// 持续追踪
const id = navigator.geolocation.watchPosition(updateMap);
navigator.geolocation.clearWatch(id);
#### ❓ 追问
用户拒绝定位怎么处理？答：error回调中提供手动输入选项。如何判断浏览器支持？答：if('geolocation' in navigator)。

---
## 12. Intersection Observer API？

> **难度**: medium | **分类**: HTML | **ID**: 128

#### 🎯 本质
IntersectionObserver**异步监测元素与视口的交叉状态**。替代scroll事件实现懒加载、无限滚动、曝光统计。

#### 🧒 类比
像安装了一个智能摄像头——不用一直盯着(scroll)，只在元素进入视野时自动通知你。

#### 📊 图解
用法：
const obs = new IntersectionObserver(
  (entries) => { /* 回调 */ },
  { threshold: 0.5 } // 50%可见时触发
);
obs.observe(element); // 开始观察
obs.unobserve(element); // 停止
#### 🔧 详解
threshold决定触发时机(0到1)。rootMargin扩大/缩小触发区域。相比scroll事件监听，Observer在主线程外计算不阻塞。适合图片懒加载(img加data-src)、无限滚动、元素进入动画。

#### 💻 代码
const obs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      obs.unobserve(img); // 加载后停止观察
    }
  });
}, { rootMargin: '100px' });
document.querySelectorAll('img[data-src]')
  .forEach(img => obs.observe(img));
#### ❓ 追问
rootMargin怎么用？答：类似CSS margin，提前触发。threshold可以是数组吗？答：可以[0,0.25,0.5,0.75,1]多个阈值。

---
## 13. Fetch API详解？

> **难度**: medium | **分类**: HTML | **ID**: 129

#### 🎯 本质
Fetch是现代**网络请求API**，基于Promise，替代XMLHttpRequest。更简洁的API、更好的错误处理、支持流式响应。

#### 🧒 类比
XHR像写信(繁琐的老方法)，Fetch像发微信(简洁现代)。

#### 📊 图解
fetch(url, options)
  .then(res => res.json()) // 解析响应
  .then(data => ...)
  .catch(err => ...);

options:
method/headers/body
mode/cors/credentials
signal(AbortController)
#### 🔧 详解
Fetch默认不拒绝HTTP错误(4xx/5xx)，需手动检查res.ok。credentials:'include'携带Cookie。AbortController取消请求。ReadableStream处理流式响应。上传进度需要自己封装(用ReadableStream)。

#### 💻 代码
const controller = new AbortController();
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Tom' }),
  signal: controller.signal,
  credentials: 'include'
}).then(res => {
  if (!res.ok) throw new Error(res.status);
  return res.json();
});
// 取消
controller.abort();
#### ❓ 追问
Fetch和XHR的区别？答：Fetch基于Promise、不拒绝HTTP错误、不支持超时(用AbortController)。如何获取上传进度？答：用ReadableStream或回退XHR。

---
## 14. History API和路由？

> **难度**: medium | **分类**: HTML | **ID**: 130

#### 🎯 本质
History API允许**操作浏览器历史记录**而不刷新页面，是SPA单页应用前端路由的基础。

#### 🧒 类比
像在浏览器地址栏偷偷改URL但不刷新页面——用户以为跳转了，其实只是换了内容。

#### 📊 图解
核心方法：
history.pushState(state, title, url) → 添加记录
history.replaceState(state, title, url) → 替换当前
window.addEventListener('popstate', fn) → 监听前进后退

hash路由：
location.hash = '/about'
window.addEventListener('hashchange', fn)
#### 🔧 详解
pushState/replaceState修改URL不请求服务器，配合popstate事件处理后退。这是Vue Router/React Router的基础。hash路由用URL的#部分，不需要服务器配置。history模式需要服务器配置所有路径返回index.html。

#### 💻 代码
// 简易history路由
class Router {
  routes = {};
  navigate(path) {
    history.pushState({}, '', path);
    this.routes[path]?.();
  }
  start() {
    window.addEventListener('popstate', () => {
      this.routes[location.pathname]?.();
    });
  }
}
router.add('/home', renderHome);
router.add('/about', renderAbout);
#### ❓ 追问
hash路由和history路由的区别？答：hash用#不请求服务器，history需要服务器配置fallback。什么是popstate？答：前进后退时触发的事件。

---
