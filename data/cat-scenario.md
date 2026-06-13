# 场景题

> 共 16 题

## 1. 如何设计无限滚动列表？

> **难度**: medium | **分类**: 场景题 | **ID**: 52

#### 🎯 本质
无限滚动列表的核心是**触底检测+分页加载+虚拟列表**三者的结合。大数据量下还需要虚拟滚动技术只渲染可视区域的DOM节点，避免页面卡顿。

#### 🧒 类比
普通列表像把所有照片都贴在墙上（多了墙就撑不住），无限滚动像手机相册——只看到屏幕上的几张，滑到底自动加载下一批。

#### 📊 图解
方案一:简单无限滚动
  IntersectionObserver监听底部哨兵元素
  → 触底时加载下一页
  → 追加数据到列表
  ⚠️ DOM越来越多,大数据量会卡

方案二:虚拟列表(推荐)
  只渲染可视区域的N个DOM节点
  滚动时计算startIndex和endIndex
  用transform偏移模拟滚动位置
  DOM总数固定=可视数+缓冲区

关键参数:
  itemHeight(每项高度)
  containerHeight(容器高度)
  bufferSize(上下缓冲区大小)
  scrollTop(当前滚动位置)
#### 🔧 详解
**IntersectionObserver**比scroll事件性能更好，浏览器内部优化。虚拟列表的难点在于**不定高**场景，需要预估高度+渲染后缓存真实高度。开源方案有react-window、react-virtualized、vue-virtual-scroller。

#### 💻 代码
// 1.触底检测(IntersectionObserver)
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting && hasMore) {
      loadMore();
    }
  }, { rootMargin: "200px" }
);
observer.observe(sentinelEl);

// 2.虚拟列表核心逻辑
function VirtualList({ items, itemHeight }) {
  const [scrollTop, setScroll] = useState(0);
  const containerH = 600;
  const start = Math.floor(scrollTop / itemHeight);
  const end = start + Math.ceil(containerH / itemHeight);
  const visible = items.slice(start, end + 1);
  return (
     setScroll(e.target.scrollTop)}
      style={{ height: containerH, overflow: "auto" }}>
      
        
          {visible.map(item =>
            
          )}
        
      
    
  );
}
#### ❓ 追问
不定高虚拟列表怎么实现？答：先给预估高度，渲染后缓存真实高度，用位置缓存表(offsetTop)加速计算。如何做平滑加载？答：骨架屏+loading状态+数据预加载（提前一屏加载）。

---
## 2. 前端埋点监控？

> **难度**: hard | **分类**: 场景题 | **ID**: 53

#### 🎯本质
前端埋点监控是对用户行为和系统性能进行**数据采集、上报和分析**的工程体系，包括性能监控、错误监控、行为监控三大模块，是前端工程化的重要基础设施。

#### 🧒类比
埋点像在商场装摄像头+传感器——记录顾客去了哪里（行为）、哪条通道拥堵（性能）、哪里地板湿滑（错误），方便优化经营。

#### 📊图解
监控三大模块:
性能监控: FCP/LCP/CLS/FID/TTFB
  → Performance API + PerformanceObserver
错误监控:
  同步错误→window.onerror
  Promise错误→unhandledrejection
  资源错误→addEventListener(error,true)
行为监控: PV/UV/点击/停留时长
  → 事件代理+路由拦截

上报策略:
① sendBeacon(页面卸载时不丢失)
② requestIdleCallback(空闲批量)
③ 图片打点(1x1 gif,跨域友好)
④ 数据聚合后定时批量上报
#### 🔧详解
性能指标用**PerformanceObserver**采集Web Vitals，注意FCP/LCP需在PerformanceObserver中监听paint类型。错误捕获要区分资源加载错误（addEventListener捕获阶段）和JS运行错误（onerror）。上报推荐sendBeacon+批量聚合，避免请求过多影响性能。开源方案推荐**Sentry**（错误监控）和**Google Analytics**（行为分析）。

#### 💻代码
// 性能指标采集
const po = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    report({
      name: entry.name,
      duration: entry.startTime,
      type: entry.entryType
    });
  });
});
po.observe({ entryTypes: ["paint","largest-contentful-paint"] });

// 错误捕获
window.onerror = (msg, src, line, col, err) => {
  report({ type: "jsError", msg, src, line, stack: err?.stack });
};
window.addEventListener("unhandledrejection", e => {
  report({ type: "promiseError", reason: e.reason });
});

// 批量上报
const queue = [];
function report(data) {
  queue.push({ ...data, ts: Date.now() });
  if (queue.length >= 10) flush();
}
function flush() {
  navigator.sendBeacon("/api/report", JSON.stringify(queue));
  queue.length = 0;
}
#### ❓追问
如何保证埋点不影响业务性能？答：用requestIdleCallback在空闲时上报，sendBeacon不阻塞页面卸载，采样率控制（如只上报10%的用户数据）。如何做用户行为漏斗分析？答：按关键路径埋点（首页→搜索→详情→下单），统计每步转化率。

---
## 3. 如何设计一个前端错误监控系统？

> **难度**: hard | **分类**: 场景题 | **ID**: 92

#### 🎯 本质
前端监控**采集性能/错误/行为数据**上报到分析平台，用于发现和定位线上问题。

#### 🧒 类比
前端监控像行车记录仪——记录一切，出问题回放找原因。

#### 📊 图解
采集→上报→存储→分析→告警
性能  beacon  ES  Grafana 钉钉
错误  img  Kafka  SQL  SMS
行为  xhr  S3  聚合  邮件
#### 🔧 详解
性能监控：Navigation Timing/LCP/FID/CLS。错误监控：onerror/unhandledrejection/接口错误。行为监控：PV/UV/点击/路由。上报用sendBeacon。采样率控制量。SourceMap反解定位源码。

#### 💻 代码
window.onerror=(msg,url,line,col,err)=>{
  report({type:"js_error",msg,line,stack:err?.stack});
};
window.addEventListener("unhandledrejection",e=>{
  report({type:"promise_error",reason:e.reason});
});
function report(data){
  navigator.sendBeacon("/api/report",JSON.stringify(data));
}
#### ❓ 追问
SourceMap如何处理？答：生产不暴露sourcemap，错误上报后服务端用sourcemap反解定位源码。

---
## 4. 如何实现权限路由？

> **难度**: medium | **分类**: 场景题 | **ID**: 93

#### 🎯 本质
权限路由是根据**用户角色和权限动态控制页面访问**的机制。核心思路是：路由表分离（公共+权限），登录后获取权限动态注册路由，路由守卫做二次校验。

#### 🧒 类比
像公司门禁系统——公共区域所有人都能进（公共路由），实验室只有特定员工刷卡才能进（权限路由）。HR根据你的工种给你开通对应的门禁权限（动态添加路由）。

#### 📊 图解
权限路由实现流程:

1. 定义路由表
   staticRoutes: [/login, /404, /home]
   asyncRoutes:  [/admin, /user, /order]
     每个路由带 meta: { roles: ["admin"] }

2. 登录流程
   用户登录 → 获取token
   → 请求 getUserInfo 获取角色/权限
   → 根据角色过滤 asyncRoutes
   → router.addRoute() 动态添加

3. 路由守卫
   router.beforeEach:
     有token? → 有用户信息? → 有
       → 目标路由在权限表内?
         → 是: 放行
         → 否: 跳403
     无token → 目标是登录页?
       → 是: 放行
       → 否: 跳登录页

4. 按钮级权限
   v-permission="['edit']"
   或 usePermission() hook
#### 🔧 详解
**路由级别权限**用动态路由+路由守卫实现，用户看不到无权限的菜单。**按钮级别权限**用自定义指令或组合式函数控制，隐藏或禁用无权限的操作按钮。后端也必须做权限校验（前端控制只是UI层面，不安全）。

#### 💻 代码
// Vue3 权限路由核心实现
import router from "./router";
import staticRoutes from "./staticRoutes";
import asyncRoutes from "./asyncRoutes";

// 根据角色过滤路由
function filterRoutes(routes, roles) {
  return routes.filter(route => {
    if (route.meta?.roles) {
      const hasRole = route.meta.roles
        .some(r => roles.includes(r));
      if (!hasRole) return false;
    }
    if (route.children) {
      route.children = filterRoutes(
        route.children, roles
      );
    }
    return true;
  });
}

// 动态添加路由
export async function setupPermission() {
  const { roles } = await getUserInfo();
  const allowed = filterRoutes(asyncRoutes, roles);
  allowed.forEach(route => {
    router.addRoute(route);
  });
}

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return to.path === "/login"
      ? next() : next("/login");
  }
  if (!store.state.user.roles) {
    return setupPermission().then(() => {
      next({ ...to, replace: true });
    });
  }
  next();
});

// 按钮级权限指令
app.directive("permission", {
  mounted(el, binding) {
    const roles = store.state.user.roles;
    if (!binding.value.some(r => roles.includes(r))) {
      el.parentNode?.removeChild(el);
    }
  }
});
#### ❓ 追问
如果用户直接在地址栏输入无权限的URL怎么办？答：路由守卫会拦截，跳转到403页面。前后端权限不一致怎么办？答：以后端为准，前端只是UI层面的优化，每次操作都应调后端接口验证。如何实现数据级别权限？答：后端根据用户角色过滤返回的数据范围。

---
## 5. 设计一个无限滚动列表？

> **难度**: hard | **分类**: 场景题 | **ID**: 367

#### 🎯 本质
无限滚动：**虚拟列表+IntersectionObserver+分页加载**。只渲染可见区域DOM。

#### 🧒 类比
无限滚动像看风景——只看窗前的风景(可见DOM)窗外的不渲染。

#### 📊 图解

```
滚动→计算可见范围→渲染可见项
```

#### 🔧 详解
虚拟列表只渲染可见区域的DOM。IntersectionObserver检测滚动到底部触发加载。

#### 💻 代码
class VirtualList {
  constructor(container,items,itemHeight){
    this.container=container;
    this.items=items;
    this.itemHeight=itemHeight;
    this.visibleCount=Math.ceil(container.clientHeight/itemHeight)+2;
    this.container.addEventListener('scroll',()=>this.render());
  }
  render(){
    const startIdx=Math.floor(this.container.scrollTop/this.itemHeight);
    const visible=this.items.slice(startIdx,startIdx+this.visibleCount);
    // 渲染visible
  }
}
#### ❓ 追问
IntersectionObserver的兼容？答：现代浏览器都支持，不支持用scroll事件+getBoundingClientRect降级。

---
## 6. 设计一个实时搜索？

> **难度**: hard | **分类**: 场景题 | **ID**: 368

#### 🎯 本质
实时搜索：**防抖+取消请求+缓存+高亮**。输入停止300ms后搜索并取消前一次。

#### 🧒 类比
实时搜索像智能搜索框——你打字它等你不打了才去查。

#### 📊 图解

```
input→debounce→cancel prev→fetch→cache→highlight
```

#### 🔧 详解
防抖减少请求频率。AbortController取消前次请求。缓存避免重复请求。

#### 💻 代码
let controller;
async function search(query){
  controller?.abort();
  controller=new AbortController();
  const cache=sessionStorage.getItem('search:'+query);
  if(cache) return JSON.parse(cache);
  const res=await fetch('/api/search?q='+query,{signal:controller.signal});
  const data=await res.json();
  sessionStorage.setItem('search:'+query,JSON.stringify(data));
  return data;
}
input.addEventListener('input',debounce(e=>search(e.target.value),300));
#### ❓ 追问
AbortController原理？答：通过AbortSignal通知fetch终止请求。

---
## 7. 设计大文件上传？

> **难度**: hard | **分类**: 场景题 | **ID**: 369

#### 🎯 本质
大文件上传：**分片(Chunk)+断点续传+并发控制+进度显示+秒传**。

#### 🧒 类比
大文件上传像搬家——把家具拆成零件(分片)分批运，断电了从断点继续。

#### 📊 图解

```
文件切片→hash计算→并发上传→合并
```

#### 🔧 详解
文件切片用Blob.slice。MD5/SparkMD5计算文件hash。并发控制限制同时3个。

#### 💻 代码
async function upload(file){
  const CHUNK_SIZE=5*1024*1024; // 5MB
  const chunks=Math.ceil(file.size/CHUNK_SIZE);
  // 计算hash(秒传)
  const hash=await calculateHash(file);
  const exists=await checkExists(hash);
  if(exists) return; // 秒传
  // 分片上传
  const tasks=Array.from({length:chunks},(_,i)=>{
    const blob=file.slice(i*CHUNK_SIZE,(i+1)*CHUNK_SIZE);
    return ()=>uploadChunk(blob,hash,i);
  });
  await concurrentLimit(tasks,3);
  await mergeChunks(hash,chunks);
}
#### ❓ 追问
什么是秒传？答：计算文件hash如果服务器已存在则跳过上传。

---
## 8. 实现主题切换(深色/浅色)？

> **难度**: medium | **分类**: 场景题 | **ID**: 370

#### 🎯 本质
主题切换：**CSS变量+data-theme属性+localStorage持久化**。

#### 🧒 类比
主题切换像换衣服——CSS变量是衣柜里的衣服，data-theme决定穿哪套。

#### 📊 图解
:root{--bg:#fff;--text:#333}
[data-theme='dark']{--bg:#111;--text:#eee}
#### 🔧 详解
CSS变量定义颜色。JS切换data-theme。localStorage记住选择。prefers-color-scheme检测系统偏好。

#### 💻 代码
:root{--bg:#fff;--text:#333;--border:#ddd}
[data-theme='dark']{--bg:#1a1a1a;--text:#e5e5e5;--border:#333}
body{background:var(--bg);color:var(--text)}

function toggleTheme(){
  const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=theme;
  localStorage.setItem('theme',theme);
}
#### ❓ 追问
如何检测系统深色模式？答：matchMedia('(prefers-color-scheme:dark)')。

---
## 9. 实现权限路由？

> **难度**: hard | **分类**: 场景题 | **ID**: 371

#### 🎯 本质
权限路由：**路由元信息+全局守卫+动态路由**。无权限重定向到403。

#### 🧒 类比
权限路由像门禁系统——有卡(权限)才能进对应的门(路由)。

#### 📊 图解

```
routes定义meta.role→守卫检查→放行/拒绝
```

#### 🔧 详解
路由元信息(meta)标记需要的权限。全局前置守卫检查用户角色。

#### 💻 代码
// Vue Router
const routes=[
  {path:'/admin',component:Admin,meta:{role:'admin'}},
  {path:'/user',component:User,meta:{role:'user'}}
];
router.beforeEach((to,from,next)=>{
  const userRole=getUserRole();
  if(to.meta.role&&!to.meta.role.includes(userRole))
    next('/403');
  else next();
});
#### ❓ 追问
什么是动态路由？答：根据用户权限动态添加路由(addRoute)。

---
## 10. 前端错误上报方案？

> **难度**: medium | **分类**: 场景题 | **ID**: 372

#### 🎯 本质
错误上报：**全局捕获(window.onerror)+资源错误+Promise错误+接口错误**。

#### 🧒 类比
错误上报像黑匣子——记录飞机(应用)的所有异常供分析。

#### 📊 图解

```
onerror+addEventListener+unhandledrejection+fetch拦截
```

#### 🔧 详解
window.onerror捕获运行时错误。addEventListener('error')捕获资源加载错误。unhandledrejection捕获Promise错误。

#### 💻 代码
window.onerror=(msg,url,line,col,err)=>{report({type:'js',msg,stack:err?.stack});};
window.addEventListener('error',e=>{if(e.target!==window)report({type:'resource',src:e.target.src});},true);
window.addEventListener('unhandledrejection',e=>{report({type:'promise',reason:e.reason});});
#### ❓ 追问
上报策略？答：批量合并+降级(Image发送)+采样率。

---
## 11. 实现拖拽排序？

> **难度**: medium | **分类**: 场景题 | **ID**: 373

#### 🎯 本质
拖拽排序：**HTML5 Drag API或mousedown/mousemove/mouseup**。

#### 🧒 类比
拖拽排序像整理书架——按住书(拖)放到新位置(放)。

#### 📊 图解
mousedown→mousemove→mouseup
或 dragstart→dragover→drop
#### 🔧 详解
mousedown记录起始位置。mousemove计算偏移量实时更新位置。mouseup确定最终位置。

#### 💻 代码
let dragEl;
list.addEventListener('dragstart',e=>{dragEl=e.target;e.dataTransfer.effectAllowed='move';});
list.addEventListener('dragover',e=>{e.preventDefault();const after=getDragAfterElement(list,e.clientY);if(after) list.insertBefore(dragEl,after);else list.appendChild(dragEl);});
function getDragAfterElement(container,y){
  const els=[...container.querySelectorAll('.item:not(.dragging)')];
  return els.reduce((closest,el)=>{
    const box=el.getBoundingClientRect();
    const offset=y-box.top-box.height/2;
    if(offsetclosest.offset) return{offset,element:el};
    return closest;
  },{offset:Number.NEGATIVE_INFINITY}).element;
}
#### ❓ 追问
如何实现拖拽动画？答：FLIP动画技术(First Last Invert Play)。

---
## 12. 实现undo/redo(撤销重做)？

> **难度**: hard | **分类**: 场景题 | **ID**: 374

#### 🎯 本质
撤销重做：**命令模式或状态快照栈**。undoStack+redoStack。

#### 🧒 类比
undo/redo像时间旅行——undo回到过去，redo去到未来。

#### 📊 图解
undoStack: [state1,state2,state3]
          ↑current
redoStack: [state4]
#### 🔧 详解
每次操作前保存状态快照。undo弹出当前状态到redoStack恢复上一个。redo弹出redoStack恢复。

#### 💻 代码
class History {
  constructor(){this.undoStack=[];this.redoStack=[];this.current=null;}
  push(state){this.undoStack.push(this.current);this.current=state;this.redoStack=[];}
  undo(){if(!this.undoStack.length) return null;this.redoStack.push(this.current);this.current=this.undoStack.pop();return this.current;}
  redo(){if(!this.redoStack.length) return null;this.undoStack.push(this.current);this.current=this.redoStack.pop();return this.current;}
}
#### ❓ 追问
命令模式和快照模式区别？答：命令模式记录操作(增量)，快照模式记录状态(全量)。

---
## 13. 实现懒加载？

> **难度**: medium | **分类**: 场景题 | **ID**: 375

#### 🎯 本质
懒加载：**IntersectionObserver或scroll事件**。元素进入视口才加载。

#### 🧒 类比
懒加载像窗帘——走近了(进入视口)才拉开(加载)。

#### 📊 图解

```
IntersectionObserver→isIntersecting→load
```

#### 🔧 详解
IntersectionObserver监听元素是否进入视口。进入时加载图片/组件。

#### 💻 代码
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const img=entry.target;
      img.src=img.dataset.src;
      observer.unobserve(img);
    }
  });
});
document.querySelectorAll('img[data-src]').forEach(img=>observer.observe(img));
#### ❓ 追问
Vue中如何懒加载组件？答：defineAsyncComponent或import()动态导入。

---
## 14. 实现表单验证？

> **难度**: medium | **分类**: 场景题 | **ID**: 376

#### 🎯 本质
表单验证：**实时验证+提交验证+错误提示**。正则+自定义规则。

#### 🧒 类比
表单验证像安检——先看身份证(格式)再查行李(业务规则)。

#### 📊 图解

```
blur→validate→error msg→submit→validate all
```

#### 🔧 详解
实时验证(blur事件)。提交时全量验证。统一错误提示。

#### 💻 代码
const rules={
  required:v=>!!v||'必填',
  email:v=>/^[\w.-]+@[\w.-]+$/.test(v)||'邮箱格式错误',
  minLength:n=>v=>v.length>=n||`最少${n}字符`,
  phone:v=>/^1[3-9]\d{9}$/.test(v)||'手机号格式错误'
};
function validate(formData,rules){
  const errors={};
  for(const[field,fieldRules]of Object.entries(rules)){
    for(const rule of fieldRules){
      const msg=rule(formData[field]);
      if(msg!==true){errors[field]=msg;break;}
    }
  }
  return errors;
}
#### ❓ 追问
如何实现异步验证(如用户名查重)？答：返回Promise的验证规则。

---
## 15. WebSocket断线重连？

> **难度**: hard | **分类**: 场景题 | **ID**: 377

#### 🎯 本质
WebSocket断线重连：**心跳检测+指数退避+最大重试**。

#### 🧒 类比
断线重连像打电话断了——等一会再打(退避)直到接通。

#### 📊 图解

```
连接→心跳→断开→退避重连
```

#### 🔧 详解
心跳定期发送ping/pong检测连接。断开后指数退避重连(1s→2s→4s→8s)。

#### 💻 代码
class ReconnectWS {
  constructor(url){this.url=url;this.retry=0;this.maxRetry=5;this.connect();}
  connect(){
    this.ws=new WebSocket(this.url);
    this.ws.onopen=()=>{this.retry=0;this.heartbeat();};
    this.ws.onclose=()=>{if(this.retry{this.ws.close();};
  }
  heartbeat(){this.ping=setInterval(()=>this.ws.send('ping'),30000);}
  reconnect(){this.retry++;setTimeout(()=>this.connect(),Math.min(1000*Math.pow(2,this.retry),30000));}
}
#### ❓ 追问
什么是指数退避？答：每次重试间隔翻倍避免服务器压力过大。

---
## 16. 实现国际化i18n？

> **难度**: medium | **分类**: 场景题 | **ID**: 378

#### 🎯 本质
国际化：**翻译字典+动态切换+语言检测**。vue-i18n/react-intl。

#### 🧒 类比
i18n像多语言导游——根据游客的语言切换讲解。

#### 📊 图解

```
翻译字典→当前语言→动态切换
```

#### 🔧 详解
翻译字典存储多语言文本。navigator.language检测语言。动态切换不刷新。

#### 💻 代码
const i18n={
  'zh':{hello:'你好',submit:'提交'},
  'en':{hello:'Hello',submit:'Submit'}
};
let lang=navigator.language.startsWith('zh')?'zh':'en';
function t(key){return i18n[lang][key]||key;}
function setLang(l){lang=l;document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});}
#### ❓ 追问
日期/数字的国际化？答：Intl.DateTimeFormat/Intl.NumberFormat。

---
