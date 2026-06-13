# 小程序

> 共 11 题

## 1. 小程序和H5的区别？

> **难度**: easy | **分类**: 小程序 | **ID**: 345

#### 🎯 本质
小程序运行在宿主App内有原生API能力。H5运行在浏览器。

#### 🧒 类比
小程序像商场内的店(有特权)，H5像街边的店(受限)。

#### 📊 图解

```
环境/API/性能/审核
```

#### 🔧 详解
双线程模型。可调原生API。需审核。

#### 💻 代码

```
wx.scanCode({success(res){console.log(res.result);}});
```

#### ❓ 追问
双线程模型？答：渲染层(WebView)+逻辑层(JsCore)通过Native通信。

---
## 2. 小程序生命周期？

> **难度**: medium | **分类**: 小程序 | **ID**: 346

#### 🎯 本质
有App和Page两级生命周期。

#### 🧒 类比
生命周期像产品流程——开发→上架→下架。

#### 📊 图解

```
onLaunch/onLoad/onShow/onReady/onUnload
```

#### 🔧 详解
onLaunch首次打开一次。onLoad可获取参数。

#### 💻 代码

```
Page({onLoad(opt){this.fetchData(opt.id);},onShow(){},onReady(){},onUnload(){}});
```

#### ❓ 追问
onLoad和onShow区别？答：onLoad只一次可取参，onShow每次显示执行。

---
## 3. 小程序状态管理？

> **难度**: medium | **分类**: 小程序 | **ID**: 347

#### 🎯 本质
原生data+setData。大型用MobX/Redux。

#### 🧒 类比
setData像对讲机告诉渲染层更新。

#### 📊 图解

```
data+setData/globalData/Storage
```

#### 🔧 详解
setData是更新视图的唯一方式。

#### 💻 代码
this.setData({list:data});
this.setData({'list[0].name':'Tom'});
#### ❓ 追问
setData优化？答：只传变化部分、合并调用。

---
## 4. 小程序分包加载？

> **难度**: medium | **分类**: 小程序 | **ID**: 348

#### 🎯 本质
主包≤2MB，分包拆分总≤20MB。

#### 🧒 类比
分包像行李托运——随身行李限2kg。

#### 📊 图解

```
主包/分包/独立分包/预下载
```

#### 🔧 详解
按功能模块拆分。独立分包可独立运行。

#### 💻 代码

```
{"subpackages":[{"root":"moduleA","pages":["index"]}]}
```

#### ❓ 追问
独立分包？答：不需要主包就可独立运行。

---
## 5. 小程序自定义组件？

> **难度**: easy | **分类**: 小程序 | **ID**: 349

#### 🎯 本质
Component构造器+属性+方法+生命周期。

#### 🧒 类比
组件像积木——独立小块拼成完整作品。

#### 📊 图解

```
properties/data/methods/lifetimes
```

#### 🔧 详解
properties接收外部数据。triggerEvent发事件。

#### 💻 代码

```
Component({properties:{title:{type:String}},methods:{add(){this.triggerEvent('change');}}});
```

#### ❓ 追问
组件通信？答：properties父→子、triggerEvent子→父。

---
## 6. 小程序性能优化？

> **难度**: medium | **分类**: 小程序 | **ID**: 350

#### 🎯 本质
setData优化、分包、图片优化、按需注入。

#### 🧒 类比
小程序性能优化像给手机瘦身。

#### 📊 图解

```
setData/分包/虚拟列表/按需注入
```

#### 🔧 详解
setData关键：只传变化数据合并调用。

#### 💻 代码

```
{"lazyCodeLoading":"requiredComponents"}
```

#### ❓ 追问
recycle-view？答：虚拟列表只渲染可见区域。

---
## 7. 小程序登录流程？

> **难度**: medium | **分类**: 小程序 | **ID**: 351

#### 🎯 本质
wx.login→code→服务端→微信API→openid。

#### 🧒 类比
登录像酒店入住——前端拿房卡(code)→前台验证。

#### 📊 图解

```
wx.login→code→服务端→openid
```

#### 🔧 详解
code5分钟有效。服务端用code+secret换openid。

#### 💻 代码

```
wx.login({success(r){wx.request({url:'api/login',data:{code:r.code}});}});
```

#### ❓ 追问
unionid和openid？答：openid小程序内唯一，unionid开放平台全应用唯一。

---
## 8. 小程序支付流程？

> **难度**: medium | **分类**: 小程序 | **ID**: 352

#### 🎯 本质
前端下单→服务端统一下单→微信支付→回调。

#### 🧒 类比
支付像网购——下单→付款→确认。

#### 📊 图解

```
wx.requestPayment
```

#### 🔧 详解
服务端获取prepay_id。前端调用wx.requestPayment。

#### 💻 代码

```
wx.requestPayment({timeStamp:'',package:'prepay_id=xxx',signType:'MD5',paySign:'',success(){}});
```

#### ❓ 追问
prepay_id？答：微信支付预支付交易会话标识。

---
## 9. 小程序分享功能？

> **难度**: easy | **分类**: 小程序 | **ID**: 353

#### 🎯 本质
onShareAppMessage(好友)+onShareTimeline(朋友圈)。

#### 🧒 类比
分享像转发朋友圈——配标题和图片。

#### 📊 图解

```
好友分享/朋友圈分享
```

#### 🔧 详解
定义标题/路径/图片。支持按钮触发。

#### 💻 代码

```
Page({onShareAppMessage(){return{title:'快来看看',path:'/pages/detail?id=123'};}});
```

#### ❓ 追问
禁止分享？答：不定义onShareAppMessage。

---
## 10. 小程序云开发？

> **难度**: medium | **分类**: 小程序 | **ID**: 354

#### 🎯 本质
云开发提供云函数+云数据库+云存储无需服务器。

#### 🧒 类比
云开发像拎包入住——不用搭服务器直接开发。

#### 📊 图解

```
云函数/云数据库/云存储
```

#### 🔧 详解
无需服务器。云函数Node.js云端运行。

#### 💻 代码
exports.main=async(event)=>{return await db.collection('users').get();};
wx.cloud.callFunction({name:'getUsers'});
#### ❓ 追问
适合什么项目？答：中小型、MVP、个人项目。

---
## 11. 小程序web-view？

> **难度**: medium | **分类**: 小程序 | **ID**: 355

#### 🎯 本质
web-view嵌入H5页面，JSSDK通信。

#### 🧒 类比
web-view像小程序里开了浏览器窗口。

#### 📊 图解

```
web-view + JSSDK
```

#### 🔧 详解
加载H5。postMessage通信。域名需白名单。

#### 💻 代码

```

```

#### ❓ 追问
web-view限制？答：域名白名单、不支持小程序组件。

---
