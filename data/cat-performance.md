# 性能优化

> 共 17 题

## 1. 前端性能优化手段？

> **难度**: medium | **分类**: 性能优化 | **ID**: 35

#### 🎯 本质
前端性能优化是从**网络传输、资源加载、页面渲染、缓存策略**四个维度系统性提升用户体验的过程。核心目标是减少首屏时间和提升交互响应速度。

#### 🧒 类比
优化像给快递提速——用更近的仓库(CDN)、打包更小(Gzip)、只寄需要的(代码分割)、提前备货(预加载)、用过的留着(缓存)。

#### 📊 图解
网络层:
  CDN加速 | HTTP/2多路复用 | Gzip/Brotli压缩
  DNS预解析(dns-prefetch) | 减少重定向

资源层:
  代码分割(路由懒加载) | Tree Shaking
  图片:WebP+懒加载+响应式srcset
  字体:font-display:swap | 子集化

渲染层:
  虚拟列表(大列表) | 防抖节流(高频事件)
  CSS containment | will-change(GPU加速)
  减少回流重绘 | requestAnimationFrame

缓存层:
  强缓存(Cache-Control) | 协商缓存(ETag)
  Service Worker离线缓存
  本地缓存(localStorage/IndexedDB)

加载策略:
  preload关键资源 | prefetch未来资源
  SSR/SSG首屏 | 骨架屏感知优化
#### 🔧 详解
**网络优化**：CDN将静态资源部署到离用户最近的边缘节点，减少网络延迟。HTTP/2多路复用一个TCP连接并行传输。Gzip/Brotli压缩可减少70%传输体积。**资源优化**：代码分割按路由或组件拆分，首屏只加载必要代码。Tree Shaking移除未引用代码。图片转WebP可减少30%体积。**渲染优化**：虚拟列表只渲染可视区域DOM，防抖节流控制事件触发频率。

#### 💻 代码
// 路由懒加载
const Home = () => import("./Home.vue");
const About = () => import("./About.vue");

// 图片懒加载
&lt;img loading="lazy" src="photo.webp"&gt;

// 预加载关键资源
&lt;link rel="preload" href="app.js" as="script"&gt;
&lt;link rel="prefetch" href="next-page.js"&gt;

// 虚拟列表核心思路
function renderVisibleItems(scrollTop) {
  const start = Math.floor(scrollTop / itemHeight);
  const end = start + Math.ceil(containerH / itemHeight);
  render(items.slice(start, end + 1));
}
#### ❓ 追问
如何量化性能优化效果？答：用Lighthouse评分、Web Vitals(LCP/FID/CLS)、Performance API埋点。什么是关键渲染路径？答：从HTML到首屏渲染必须经过的最短路径，优化它就能加快首屏。

---
## 2. 什么是首屏加载优化？

> **难度**: medium | **分类**: 性能优化 | **ID**: 57

#### 🎯本质
首屏加载优化是指用户打开页面到**看到完整首屏内容**这一过程中的所有优化手段。目标是让用户**尽快看到可用内容**，减少白屏等待时间。

#### 🧒类比
首屏优化像开一家餐厅——顾客进门到上第一道菜的时间越短，满意度越高。可以先上小菜（骨架屏），主菜后上（异步加载），但别让客人干等着。

#### 📊图解
关键渲染路径优化:
  CSS放head(尽早构建CSSOM)
  JS放body底部或加defer/async
  关键CSS内联(above-the-fold)

资源优化:
  代码分割→路由级lazy loading
  Tree Shaking→移除未使用代码
  图片→WebP+懒加载+srcset响应式
  字体→font-display:swap+子集化

加载策略:
  preload→关键资源提前加载
  prefetch→未来页面预获取
  SSR/SSG→服务端渲染/静态生成
  骨架屏→感知上的加载优化

网络层:
  CDN加速静态资源
  HTTP/2多路复用
  Gzip/Brotli压缩
#### 🔧详解
**代码分割**是最有效的手段，通过动态import()按路由拆分，首屏只加载当前页面代码。**SSR**在服务端生成HTML直接返回，但增加服务器成本。**骨架屏**通过CSS占位让用户感知加载更快（感知优化≠真实优化）。Critical CSS将首屏样式内联到HTML中，避免渲染阻塞。

#### 💻代码
// 路由懒加载(React)
const Home = React.lazy(() => import("./Home"));
const About = React.lazy(() => import("./About"));

// 图片懒加载

// 关键资源预加载

// 骨架屏CSS
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
#### ❓追问
如何量化首屏时间？答：用Performance API获取FCP(首次内容绘制)和LCP(最大内容绘制)指标。SSR和SSG怎么选？答：内容变化频繁用SSR，静态内容用SSG（构建时生成HTML，性能最优）。

---
## 3. Core Web Vitals三大指标？

> **难度**: hard | **分类**: 性能优化 | **ID**: 58

#### 🎯 本质
Core Web Vitals是Google定义的**三个核心用户体验指标**：LCP/INP/CLS。

#### 🧒 类比
像体检报告——LCP是视力(看得清)、INP是反应力(点得动)、CLS是稳定性(不晃眼)。

#### 📊 图解
LCP &lt;2.5s: 最大内容渲染
INP &lt;200ms: 交互响应延迟
CLS &lt;0.1: 累积布局偏移
#### 🔧 详解
LCP衡量最大内容渲染时间。INP替代FID衡量交互响应。CLS衡量布局稳定性。优化LCP用preload+CDN+图片优化。优化INP减少JS执行。优化CLS设图片宽高+预留空间。

#### 💻 代码
new PerformanceObserver(list=>{
  list.getEntries().forEach(e=>{
    if(e.entryType==="largest-contentful-paint")
      console.log("LCP:",e.startTime);
  });
}).observe({type:"largest-contentful-paint",buffered:true});
#### ❓ 追问
如何监控线上CWV？答：web-vitals库+上报analytics，或Lighthouse CI集成部署。

---
## 4. 什么是防抖和节流？应用场景？

> **难度**: easy | **分类**: 性能优化 | **ID**: 59

#### 🎯本质
**防抖(Debounce)**：事件停止触发n秒后才执行，如果期间又触发了则重新计时。**节流(Throttle)**：n秒内只执行一次，不管触发多少次。两者都是为了**限制高频事件的执行频率**，优化性能。

#### 🧒类比
防抖像电梯——有人进来就重新等10秒，10秒没人进才关门出发。节流像公交车——不管站台有多少人，每15分钟固定发一班车。

#### 📊图解
防抖(Debounce):
  触发→取消→触发→取消→触发→等n秒→执行
  适合:搜索框输入、窗口resize

节流(Throttle):
  触发→执行→触发→跳过→触发→跳过→执行
  适合:滚动事件、鼠标移动、拖拽

其他定时器:
  requestAnimationFrame: 16.6ms一帧
    → 适合动画,与屏幕刷新同步
  requestIdleCallback: 浏览器空闲时执行
    → 适合低优先级任务(埋点上报)
#### 🔧详解
防抖的核心是每次触发都**清除旧定时器并新建**，只有最后一次触发后等待n秒才执行。节流的核心是用**时间戳或锁**标记，在冷却期内直接return。实际开发中lodash的debounce/throttle最常用，支持leading/trailing选项。React中注意用useCallback包裹避免每次渲染新建函数。

#### 💻代码
// 防抖
function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
// 使用:搜索框
input.oninput = debounce(e => {
  search(e.target.value);
}, 500);

// 节流
function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
// 使用:滚动加载
window.onscroll = throttle(() => {
  checkLoadMore();
}, 200);

// React Hook版
function useDebounce(fn, delay) {
  const ref = useRef();
  useEffect(() => () => clearTimeout(ref.current), []);
  return (...args) => {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => fn(...args), delay);
  };
}
#### ❓追问
防抖的leading模式是什么？答：第一次触发立即执行，之后n秒内不再执行（如按钮防双击）。节流的时间戳版本和定时器版本有什么区别？答：时间戳版本首次立即执行，定时器版本首次延迟执行。

---
## 5. 什么是懒加载？

> **难度**: easy | **分类**: 性能优化 | **ID**: 199

#### 🎯 本质
懒加载是**延迟加载非关键资源**，用到时再加载。减少首屏加载量。

#### 🧒 类比
懒加载像自助餐——先拿面前的吃，远处的菜走过去再拿。

#### 📊 图解
懒加载方式:
1.图片: loading='lazy'
2.组件: React.lazy/dynamic import
3.路由: 按需加载
4.代码分割: splitChunks
#### 🔧 详解
原生loading='lazy'让浏览器自动延迟加载屏幕外的图片。IntersectionObserver检测元素进入视口再加载。代码分割将大包拆成小块按需加载。

#### 💻 代码
// 原生图片懒加载

// IntersectionObserver
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.src=e.target.dataset.src;
      observer.unobserve(e.target);
    }
  });
});
document.querySelectorAll('img[data-src]')
  .forEach(img=>observer.observe(img));
#### ❓ 追问
预加载(preload)和懒加载的区别？答：preload提前加载关键资源，lazy延迟非关键资源。

---
## 6. 首屏加载优化？

> **难度**: medium | **分类**: 性能优化 | **ID**: 200

#### 🎯 本质
首屏优化通过**减少关键资源大小和数量**来缩短FCP/LCP时间。

#### 🧒 类比
首屏优化像准备舞台——只摆必需的道具，其他后台准备。

#### 📊 图解
优化方向:
1.减少资源大小(压缩/Tree-shaking)
2.减少请求数(合并/内联)
3.加快传输(CDN/HTTP2)
4.优先加载关键资源
5.延迟非关键资源
#### 🔧 详解
关键渲染路径：HTML→DOM→CSSOM→渲染树→布局→绘制。阻塞渲染的资源(CSS/同步JS)要最小化。preload预加载关键资源。prefetch预获取未来资源。内联关键CSS减少请求。

#### 💻 代码
// preload关键资源

// prefetch未来资源

// 内联关键CSS
/* 首屏关键样式 */
#### ❓ 追问
FCP和LCP的区别？答：FCP首次内容绘制，LCP最大内容绘制。什么是关键渲染路径？答：HTML到像素的链路。

---
## 7. Webpack代码分割？

> **难度**: medium | **分类**: 性能优化 | **ID**: 201

#### 🎯 本质
代码分割将**大包拆成小块按需加载**：入口分割、动态import、SplitChunksPlugin。

#### 🧒 类比
代码分割像分批上菜——不用等所有菜做完一起上。

#### 📊 图解
分割方式:
1.入口分割(multi-entry)
2.动态import(): import('./module')
3.SplitChunksPlugin: 抽取公共依赖
4.路由懒加载

Webpack配置:
optimization.splitChunks
#### 🔧 详解
动态import()返回Promise实现按需加载。SplitChunksPlugin自动提取公共模块(node_modules)。魔法注释/* webpackChunkName */命名chunk。bundle、chunk、module的区别。

#### 💻 代码
// 动态import
const module=await import('./heavy-module');
// 命名chunk
const mod=await import(/* webpackChunkName:'utils' */'./utils');

// webpack.config.js
optimization:{
  splitChunks:{
    chunks:'all',
    cacheGroups:{
      vendor:{
        test:/node_modules/,
        name:'vendors',
        chunks:'all'
      }
    }
  }
}
#### ❓ 追问
bundle/chunk/module的区别？答：module是单个文件，chunk是webpack处理单元，bundle是最终输出文件。

---
## 8. Tree-shaking原理？

> **难度**: medium | **分类**: 性能优化 | **ID**: 202

#### 🎯 本质
Tree-shaking在**构建时移除未使用的代码**。依赖ES Module的静态结构分析。

#### 🧒 类比
Tree-shaking像摇树——没用的叶子(未引用代码)被摇下来。

#### 📊 图解
前提:
1.ES Module(import/export)
2.静态结构(不能运行时导入)
3.sideEffects:false标记

Webpack: production模式自动开启
Rollup: 默认支持
#### 🔧 详解
ES Module的import/export是静态声明，编译时就能分析哪些导出被使用。CommonJS的require是运行时调用无法静态分析。sideEffects:false告诉打包器模块没有副作用可以安全删除未使用的导出。

#### 💻 代码
// package.json
{"sideEffects":false}
// 指定有副作用的文件
{"sideEffects":["*.css","./src/polyfill.js"]}

// 确保tree-shaking
// ✅ 命名导入
import {debounce} from 'lodash-es';
// ❌ 整体导入
import _ from 'lodash'; // 无法tree-shake
#### ❓ 追问
为什么CommonJS不能tree-shake？答：require是运行时调用无法静态分析。什么是副作用？答：模块被导入时执行的代码(如修改全局变量)。

---
## 9. 什么是防抖和节流？

> **难度**: easy | **分类**: 性能优化 | **ID**: 203

#### 🎯 本质
**防抖**在事件停止后执行一次。**节流**在固定间隔执行。都用于减少高频事件的处理次数。

#### 🧒 类比
防抖像电梯等人(最后一个人进来才关门)，节流像公交车(每隔几分钟发一趟不管有没有人)。

#### 📊 图解
防抖(debounce):
  输入停止300ms后才搜索
  resize停止后才重新计算

节流(throttle):
  scroll每100ms执行一次
  拖拽每16ms更新位置
#### 🔧 详解
防抖：每次触发重置定时器，只在最后一次触发后执行。节流：固定间隔执行，触发之间忽略。防抖适合搜索输入/窗口resize。节流适合滚动/拖拽/动画。leading/trailing控制前后是否执行。

#### 💻 代码
function debounce(fn,delay){
  let timer;
  return function(...args){
    clearTimeout(timer);
    timer=setTimeout(()=>fn.apply(this,args),delay);
  };
}
function throttle(fn,interval){
  let last=0;
  return function(...args){
    const now=Date.now();
    if(now-last>=interval){
      last=now;
      fn.apply(this,args);
    }
  };
}
#### ❓ 追问
requestAnimationFrame和节流的关系？答：rAF是浏览器帧同步的特殊节流(约16.7ms)。

---
## 10. 虚拟列表？

> **难度**: medium | **分类**: 性能优化 | **ID**: 204

#### 🎯 本质
虚拟列表只**渲染视口可见的DOM元素**，通过滚动偏移动态替换内容，支持万级数据。

#### 🧒 类比
虚拟列表像窄窗看书——只看窗口内那几行，前后页都空白。

#### 📊 图解
原理:
1.总高度=数据长度×行高(撑滚动条)
2.只渲染可见区域的数据
3.滚动时计算偏移量更新渲染

工具: react-window/react-virtualized
#### 🔧 详解
用一个高容器撑出正确滚动条高度。根据scrollTop计算可见区域的起止索引。只渲染这些行的DOM。使用transform/absolute定位模拟滚动位置。overscan多渲染几行避免快速滚动时闪白。

#### 💻 代码
// react-window示例
import {FixedSizeList} from 'react-window';
function MyList({items}){
  const Row=({index,style})=>(
    {items[index].name}
  );
  return(
    
      {Row}
    
  );
}
#### ❓ 追问
动态高度怎么处理？答：缓存已测量高度+预估未测量高度+滚动时修正。

---
## 11. Web Worker？

> **难度**: medium | **分类**: 性能优化 | **ID**: 205

#### 🎯 本质
Web Worker在**后台线程**执行JS，不阻塞UI主线程。适合CPU密集型任务(大数据处理/图片处理)。

#### 🧒 类比
Web Worker像雇佣了一个后台助手——他在后厨干活(计算)不影响前台服务(UI)。

#### 📊 图解
Worker线程:
  独立全局上下文
  不能操作DOM
  通过postMessage通信

类型:
  Dedicated Worker(专用)
  Shared Worker(共享)
  Service Worker(离线/缓存)
#### 🔧 详解
Worker有独立的全局作用域(self)。不能直接操作DOM。通过postMessage和onMessage与主线程通信。SharedArrayBuffer+Atomics实现共享内存。Worker中可以用fetch/IndexedDB/WebSocket。

#### 💻 代码
// main.js
const worker=new Worker('worker.js');
worker.postMessage({data:heavyData});
worker.onmessage=e=>console.log(e.data.result);

// worker.js
self.onmessage=e=>{
  const result=heavyComputation(e.data.data);
  self.postMessage({result});
};
#### ❓ 追问
Worker能操作DOM吗？答：不能，只能通过postMessage通知主线程。什么是Service Worker？答：特殊的Worker，用于离线缓存和网络代理。

---
## 12. 图片优化策略？

> **难度**: medium | **分类**: 性能优化 | **ID**: 206

#### 🎯 本质
图片优化通过**选择正确格式、压缩、响应式、懒加载**减少图片体积和加载时间。

#### 🧒 类比
图片优化像整理行李——选对箱子(WebP)、压缩衣服(tinypng)、只带要穿的(响应式)。

#### 📊 图解
优化策略:
1.格式: WebP>JP2>PNG>JPG>GIF
2.压缩: 有损/无损压缩
3.响应式: srcset/sizes
4.懒加载: loading='lazy'
5.CSS替代: 图标用SVG/字体
6.占位: blur/LQIP/SVG
#### 🔧 详解
WebP比PNG小26%比JPG小25-34%。AVIF更优但兼容性差。srcset提供不同分辨率让浏览器选。picture元素支持格式降级。CSS sprites减少请求数(但HTTP/2下意义不大)。渐进式JPEG先模糊后清晰。

#### 💻 代码
// 响应式图片

// 格式降级

  
  
  

#### ❓ 追问
什么是LQIP？答：Low Quality Image Placeholder用极小模糊图做占位。SVG为什么适合图标？答：矢量缩放不失真+体积小。

---
## 13. 浏览器渲染优化？

> **难度**: hard | **分类**: 性能优化 | **ID**: 207

#### 🎯 本质
浏览器渲染优化通过**减少重排(reflow)和重绘(repaint)**，利用GPU合成(composite)提升渲染性能。

#### 🧒 类比
重排像重新装修(贵)，重绘像刷新墙漆(便宜)，合成像切换图层(最便宜)。

#### 📊 图解
渲染流水线:
JS → Style → Layout → Paint → Composite

性能排序:
Composite > Repaint > Reflow

触发重排: width/height/margin/...
触发重绘: color/background/...
只触发合成: transform/opacity
#### 🔧 详解
重排需要重新计算布局(最昂贵)。重绘只改变外观不影响布局。transform和opacity只触发合成层(最快)。批量修改DOM用DocumentFragment。读写分离避免强制同步布局。will-change提示浏览器优化。

#### 💻 代码
// 避免强制同步布局
// ❌ 读写交替
el.style.width='100px'; // 写
const h=el.offsetHeight; // 读(强制布局!)

// ✅ 批量读写
const h=el.offsetHeight; // 先读
el.style.width='100px'; // 后写

// 用transform代替top/left
el.style.transform='translateX(100px)'; // 只触发合成
el.style.left='100px'; // 触发重排
#### ❓ 追问
什么是合成层？答：GPU单独处理的层，transform/opacity可以提升为合成层。will-change的副作用？答：占用额外内存不能滥用。

---
## 14. 什么是重排和重绘？

> **难度**: easy | **分类**: 性能优化 | **ID**: 208

#### 🎯 本质
**重排**(reflow)是元素几何属性变化重新计算布局。**重绘**(repaint)是外观变化不影响布局。

#### 🧒 类比
重排像移动家具(改变布局)，重绘像换家具颜色(不改布局)。

#### 📊 图解
重排(Reflow): 几何变化
  width/height/margin/padding
  display/position/float
  offsetWidth/offsetHeight(读取)
  font-size

重绘(Repaint): 外观变化
  color/background/border-color
  visibility/outline/box-shadow
#### 🔧 详解
重排一定伴随重绘但反之不成立。读取offsetWidth等属性会强制执行排队的重排(强制同步布局)。现代浏览器会批量处理但读写交替会破坏优化。使用CSS containment(contain属性)限制重排范围。

#### 💻 代码
// 减少重排
// 使用transform
.animate{
  transform:translateX(100px);
  transition:transform 0.3s;
}
// 使用DocumentFragment
const frag=document.createDocumentFragment();
items.forEach(item=>frag.appendChild(createEl(item)));
container.appendChild(frag); // 一次重排
#### ❓ 追问
offsetTop为什么会触发重排？答：需要最新布局信息必须先完成排队的重排。

---
## 15. Service Worker缓存策略？

> **难度**: medium | **分类**: 性能优化 | **ID**: 209

#### 🎯 本质
Service Worker通过**拦截网络请求**实现离线缓存。常用策略：缓存优先、网络优先、 stale-while-revalidate。

#### 🧒 类比
Service Worker像快递站——可以决定是从仓库拿(缓存)还是从厂家发(网络)。

#### 📊 图解
缓存策略:
1.Cache First: 缓存优先(静态资源)
2.Network First: 网络优先(API数据)
3.Stale-While-Revalidate: 先缓存后更新
4.Cache Only: 只用缓存
5.Network Only: 只用网络
#### 🔧 详解
Cache First适合不常变化的资源(字体/图片)。Network First适合实时数据(API)。Stale-While-Revalidate先返回缓存同时后台更新。Cache API + Service Worker实现完整的PWA离线能力。

#### 💻 代码
// sw.js - Stale While Revalidate
self.addEventListener('fetch',event=>{
  event.respondWith(
    caches.open('v1').then(cache=>
      cache.match(event.request).then(cached=>{
        const fetched=fetch(event.request).then(response=>{
          cache.put(event.request,response.clone());
          return response;
        });
        return cached || fetched;
      })
    )
  );
});
#### ❓ 追问
Service Worker的作用域？答：默认限制在注册目录及其子目录。什么是Workbox？答：Google的SW工具库提供常用缓存策略。

---
## 16. Webpack构建优化？

> **难度**: medium | **分类**: 性能优化 | **ID**: 210

#### 🎯 本质
构建优化分**速度优化**(减少构建时间)和**体积优化**(减少输出大小)。

#### 🧒 类比
构建优化像优化厨房——既要出菜快(速度)又要不浪费食材(体积)。

#### 📊 图解
速度优化:
1.cache: {type:'filesystem'}
2.thread-loader多线程
3.exclude/include缩小范围
4.resolve.alias减少搜索

体积优化:
1.代码分割(splitChunks)
2.Tree-shaking
3.压缩(terser/cssnano)
4.按需引入
#### 🔧 详解
Webpack 5持久化缓存大幅提升二次构建速度。thread-loader将耗时的loader放到worker池。DLLPlugin预编译不常变的库(Webpack 5已不需要)。externals排除不打包的依赖用CDN。

#### 💻 代码
// webpack.config.js
module.exports={
  cache:{type:'filesystem'},
  module:{
    rules:[{
      test:/\.js$/,
      exclude:/node_modules/,
      use:'babel-loader'
    }]
  },
  resolve:{
    alias:{'@':path.resolve('src')},
    extensions:['.js','.jsx']
  },
  optimization:{
    splitChunks:{chunks:'all'},
    minimize:true
  }
};
#### ❓ 追问
什么是Module Federation？答：Webpack 5的微前端方案，运行时共享模块。Vite为什么比Webpack快？答：ESM原生开发服务器+Rollup构建。

---
## 17. Core Web Vitals？

> **难度**: medium | **分类**: 性能优化 | **ID**: 211

#### 🎯 本质
Core Web Vitals是Google定义的**核心用户体验指标**：LCP(加载)、FID/INP(交互)、CLS(视觉稳定)。

#### 🧒 类比
Core Web Vitals像体检指标——三个核心数据反映网站健康。

#### 📊 图解
LCP: Largest Contentful Paint
  最大内容绘制 
#### 🔧 详解
LCP衡量最大内容元素渲染时间(优化图片/字体/服务器响应)。INP衡量所有交互的响应延迟(FID只测首次)。CLS衡量视觉稳定性(给图片设宽高、预留广告位)。用Lighthouse/PageSpeed Insights测量。

#### 💻 代码
// 测量LCP
new PerformanceObserver(list=>{
  const entries=list.getEntries();
  const last=entries[entries.length-1];
  console.log('LCP:',last.startTime);
}).observe({type:'largest-contentful-paint',buffered:true});

// 减少CLS
 

#### ❓ 追问
TTFB和LCP的关系？答：TTFB是LCP的前置指标，服务器响应快LCP才能快。INP和FID的区别？答：INP测量所有交互的延迟，FID只测首次点击。

---
