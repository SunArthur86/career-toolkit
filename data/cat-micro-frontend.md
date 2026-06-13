# 微前端

> 共 11 题

## 1. 什么是微前端？

> **难度**: easy | **分类**: 微前端 | **ID**: 356

#### 🎯 本质
将大型应用拆分为独立子应用，各自开发部署。

#### 🧒 类比
微前端像购物中心——每个店独立经营共用大楼。

#### 📊 图解

```
qiankun/Module Federation/iframe
```

#### 🔧 详解
解决巨石应用维护难、团队独立开发。

#### 💻 代码

```
registerMicroApps([{name:'app1',entry:'//localhost:3001',activeRule:'/app1'}]);
```

#### ❓ 追问
解决什么问题？答：巨石应用难维护、团队独立开发。

---
## 2. qiankun框架？

> **难度**: medium | **分类**: 微前端 | **ID**: 357

#### 🎯 本质
基于single-spa提供JS沙箱CSS隔离通信机制。

#### 🧒 类比
qiankun像购物中心管理公司统一管理。

#### 📊 图解

```
Proxy沙箱/Shadow DOM/initGlobalState
```

#### 🔧 详解
Proxy代理window隔离JS。shadow DOM隔离样式。

#### 💻 代码
registerMicroApps([{name:'vue-app',entry:'//8081',container:'#app',activeRule:'/vue'}]);
start({sandbox:{strictStyleIsolation:true}});
#### ❓ 追问
JS沙箱原理？答：Proxy代理window，子应用修改不影响全局。

---
## 3. Module Federation？

> **难度**: medium | **分类**: 微前端 | **ID**: 358

#### 🎯 本质
Webpack 5运行时共享模块去中心化微前端。

#### 🧒 类比
Module Federation像图书馆互借——A馆借B馆的书。

#### 📊 图解

```
host/remote/exposes/shared
```

#### 🔧 详解
host消费remote模块。shared共享依赖。

#### 💻 代码

```
new ModuleFederationPlugin({name:'host',remotes:{app1:'app1@http://loc/remoteEntry.js'},shared:{react:{singleton:true}}});
```

#### ❓ 追问
和qiankun区别？答：MF共享模块(构建时)，qiankun集成应用(运行时)。

---
## 4. 微前端通信方案？

> **难度**: medium | **分类**: 微前端 | **ID**: 359

#### 🎯 本质
CustomEvent、全局状态、URL参数、postMessage。

#### 🧒 类比
通信像对讲机——不同店铺间交流。

#### 📊 图解

```
CustomEvent/GlobalState/URL/postMessage
```

#### 🔧 详解
initGlobalState创建全局状态。

#### 💻 代码
const{onGlobalStateChange,setGlobalState}=initGlobalState({user:null});
setGlobalState({user:{name:'Tom'}});
#### ❓ 追问
通信挑战？答：类型安全、状态同步。

---
## 5. 微前端路由管理？

> **难度**: hard | **分类**: 微前端 | **ID**: 360

#### 🎯 本质
主路由控制子应用加载子路由控制内部页面。

#### 🧒 类比
路由像地铁换乘——主线到站换乘支线。

#### 📊 图解

```
主路由匹配→加载子应用→子路由接管
```

#### 🔧 详解
主应用监听路由匹配子应用。base route配置。

#### 💻 代码

```
const router=new VueRouter({base:window.__POWERED_BY_QIANKUN__?'/vue':'/'});
```

#### ❓ 追问
activeRule？答：URL匹配规则匹配时加载子应用。

---
## 6. 微前端样式隔离？

> **难度**: medium | **分类**: 微前端 | **ID**: 361

#### 🎯 本质
Shadow DOM/Scoped CSS/CSS Modules/前缀防止样式污染。

#### 🧒 类比
样式隔离像每个店铺有自己装修风格互不干扰。

#### 📊 图解

```
Shadow DOM/scoped/CSS Modules
```

#### 🔧 详解
Shadow DOM完全隔离。scoped添加属性选择器。

#### 💻 代码
start({sandbox:{strictStyleIsolation:true}}); // Shadow DOM
start({sandbox:{experimentalStyleIsolation:true}}); // scope
#### ❓ 追问
Shadow DOM兼容问题？答：弹窗挂body无法继承样式。

---
## 7. 微前端公共依赖？

> **难度**: medium | **分类**: 微前端 | **ID**: 362

#### 🎯 本质
externals+CDN、Module Federation shared。

#### 🧒 类比
公共依赖像购物中心中庭——多店共享。

#### 📊 图解

```
externals/CDN/Shared
```

#### 🔧 详解
相同React/Vue不应重复加载。

#### 💻 代码
module.exports={externals:{react:'React'}};
// CDN引入
#### ❓ 追问
externals的缺点？答：CDN不可控、版本管理复杂。

---
## 8. iframe方案的优劣？

> **难度**: easy | **分类**: 微前端 | **ID**: 363

#### 🎯 本质
iframe**天然隔离**但体验差(弹窗/路由/通信问题)。

#### 🧒 类比
iframe像在店里建了一堵墙——完全隔离但沟通不便。

#### 📊 图解
优点: 完全隔离
缺点: 体验差/弹窗/路由/通信
#### 🔧 详解
iframe有完整的JS/CSS隔离。但弹窗被截断、URL不同步、通信需postMessage。

#### 💻 代码

```

```

#### ❓ 追问
什么场景用iframe？答：完全独立的第三方系统、不需要深度交互。

---
## 9. single-spa框架？

> **难度**: medium | **分类**: 微前端 | **ID**: 364

#### 🎯 本质
single-spa是**微前端鼻祖**：管理多个框架应用的加载/卸载/路由。

#### 🧒 类比
single-spa像物业管理——统一管理不同类型的店铺。

#### 📊 图解

```
registerApplication/start
```

#### 🔧 详解
定义应用的bootstrap/mount/unmount生命周期。路由匹配加载。

#### 💻 代码
import {registerApplication,start} from 'single-spa';
registerApplication({name:'react-app',app:()=>import('./react-app'),activeWhen:'/react'});
start();
#### ❓ 追问
qiankun和single-spa的关系？答：qiankun基于single-spa封装了沙箱和样式隔离。

---
## 10. 微前端子应用接入？

> **难度**: hard | **分类**: 微前端 | **ID**: 365

#### 🎯 本质
子应用需要导出**bootstrap/mount/unmount**三个生命周期函数。

#### 🧒 类比
子应用接入像开店——要注册(bootstrap)、营业(mount)、歇业(unmount)。

#### 📊 图解

```
export bootstrap/mount/unmount
```

#### 🔧 详解
主应用调用子应用的生命周期。webpack设置libraryTarget。

#### 💻 代码
// 子应用入口
export async function bootstrap(){/*初始化*/}
export async function mount(props){/*渲染应用*/}
export async function unmount(){/*卸载应用*/}
// webpack
output:{library:'app1',libraryTarget:'umd'};
#### ❓ 追问
子应用如何独立运行？答：判断是否在微前端环境(__POWERED_BY_QIANKUN__)。

---
## 11. 微前端部署策略？

> **难度**: medium | **分类**: 微前端 | **ID**: 366

#### 🎯 本质
微前端**独立部署**：每个子应用独立CI/CD、独立域名或路径。

#### 🧒 类比
部署像连锁店——每个分店独立运营但共享品牌(主应用)。

#### 📊 图解

```
独立部署/Nginx路由/CDN
```

#### 🔧 详解
每个子应用独立构建部署。Nginx配置路由分发。

#### 💻 代码
server {
  location /app1 {proxy_pass http://localhost:3001;}
  location /app2 {proxy_pass http://localhost:3002;}
  location / {proxy_pass http://localhost:3000;}
}
#### ❓ 追问
如何处理版本兼容？答：semver约定、接口版本化、feature detection。

---
