# Node.js

> 共 17 题

## 1. Node事件循环vs浏览器？

> **难度**: medium | **分类**: Node.js | **ID**: 43

#### 🎯 本质
Node.js和浏览器都基于**事件循环**实现异步，但**宏任务阶段划分不同**。浏览器只有简单的宏任务队列，Node.js将宏任务细分为6个阶段。微任务的执行时机也有差异。

#### 🧒 类比
浏览器的事件循环像一个售票窗口（来一个办一个），Node的像一个综合服务大厅（分不同窗口：定时器、IO、检查等，按顺序轮转）。

#### 📊 图解
浏览器事件循环:
  调用栈清空 → 微任务队列(全执行)
  → 取一个宏任务 → 微任务队列 → 循环

Node.js事件循环(6个阶段):
  ┌→ timers(setTimeout/setInterval)
  │     → 微任务
  ├→ pending callbacks(系统级回调)
  │     → 微任务
  ├→ idle, prepare(内部使用)
  ├→ poll(获取新I/O事件)
  │     → 微任务
  ├→ check(setImmediate)
  │     → 微任务
  └→ close callbacks(关闭事件)
        → 微任务

微任务优先级:
  Node: process.nextTick > Promise.then
  浏览器: 只有Promise等,无nextTick
#### 🔧 详解
**关键区别**：①Node中process.nextTick优先于所有微任务；②Node的微任务在**每个阶段间隙**执行，浏览器在每个宏任务后执行；③setImmediate在check阶段执行，setTimeout在timers阶段，两者执行顺序不确定（取决于系统调度）。Node 11+以后微任务行为已与浏览器趋于一致。

#### 💻 代码
// 经典输出顺序题(Node环境)
setTimeout(() => console.log(1), 0);
setImmediate(() => console.log(2));
Promise.resolve().then(() => console.log(3));
process.nextTick(() => console.log(4));
console.log(5);
// 输出: 5 4 3 (1和2顺序不确定)
// 解释:
// 5-同步 | 4-nextTick | 3-Promise微任务
// 1和2在不同阶段,顺序取决于启动速度

// poll阶段对Node很关键:
// 如果poll队列为空:
//   有setImmediate→进入check阶段
//   无setImmediate→等待回调加入
//   有timer超时→回到timers阶段
#### ❓ 追问
Node 11以后微任务的行为有什么变化？答：每个宏任务后立即执行微任务（不再等整个阶段结束），与浏览器行为一致。setImmediate和setTimeout(fn,0)谁先执行？答：在主模块中不确定，在I/O回调中setImmediate一定先。

---
## 2. CommonJS和ESM的区别？

> **难度**: easy | **分类**: Node.js | **ID**: 66

#### 🎯本质
**CommonJS(CJS)**是Node.js的默认模块系统，require/module.exports，运行时同步加载。**ESM(ECMAScript Modules)**是JS标准模块系统，import/export，编译时静态分析。两者在设计哲学和使用方式上有根本差异。

#### 🧒类比
CJS像点外卖——到了才下单（运行时加载），整个盒饭一起给。ESM像套餐预定——提前知道要什么（静态分析），每道菜按需上。

#### 📊图解
         CommonJS          ESM
语法     require()        import
导出     module.exports   export/default
加载时机 运行时           编译时(静态)
加载方式 同步             异步
值类型   值的拷贝         值的引用(绑定)
Tree     不支持           支持
Shaking
循环引用 返回已执行部分   引用绑定(live)

Node中使用ESM:
  方式1: 文件后缀用.mjs
  方式2: package.json加
    "type": "module"
  方式3: --input-type=module标志
#### 🔧详解
CJS的require是**同步**的（适合服务端本地文件），module.exports导出的是**值的拷贝**（修改不影响原模块）。ESM的import是**静态分析**的（编译时确定依赖关系），export导出的是**值的引用绑定**（原模块变了这边也变）。正因为静态分析，ESM才能支持Tree Shaking（打包时移除未使用代码）。

#### 💻代码
// CommonJS(math.js)
const PI = 3.14;
function add(a, b) { return a + b; }
module.exports = { PI, add };
// 使用
const { PI, add } = require("./math");

// ESM(math.mjs)
export const PI = 3.14;
export function add(a, b) { return a + b; }
export default class Calculator {}
// 使用
import Calc, { PI, add } from "./math.mjs";

// 动态import(两种模块系统都支持)
const mod = await import("./math.mjs");

// 值拷贝 vs 值引用
// CJS: require后值不变
const { count } = require("./counter");
// counter内部改了count,这里不变

// ESM: import的是引用绑定
import { count } from "./counter.mjs";
// counter内部改了count,这里也变
#### ❓追问
Node.js中CJS和ESM能混用吗？答：不能直接混用，但可以用动态import()在CJS中加载ESM。Tree Shaking为什么依赖ESM？答：因为import/export是静态声明，打包工具（webpack/rollup）能在编译时分析哪些export没被import，从而安全移除。

---
## 3. Node.js的Stream流机制？

> **难度**: hard | **分类**: Node.js | **ID**: 67

#### 🎯本质
Stream是Node.js处理**流式数据**的核心机制，将大数据分割成小块逐段处理，避免一次性加载全部数据到内存。有四种基本类型：Readable、Writable、Duplex、Transform。

#### 🧒类比
不用Stream像用桶接水——必须等桶装满才能搬（内存爆炸）。用Stream像用水管——水持续流过管道，随到随处理（内存恒定）。

#### 📊图解
四种流类型:
Readable:  可读(如fs.createReadStream)
Writable:  可写(如fs.createWriteStream)
Duplex:    可读+可写(如TCP Socket)
Transform: 可读+可写+变换(如zlib压缩)

两种模式:
  Flowing模式: 自动读取,通过事件推送数据
  Paused模式: 手动调用read()拉取数据

背压(Backpressure):
  写入速度 
#### 🔧详解
Stream基于**EventEmitter**实现，通过事件驱动处理数据。高水位线(highWaterMark)控制缓冲区大小。pipe()是最便捷的使用方式，自动处理背压和数据流转。大型项目推荐用**pipeline()**替代pipe()，更好的错误处理和资源清理。

#### 💻代码
// 文件复制(流式,内存友好)
const { pipeline } = require("stream/promises");
const fs = require("fs");
const zlib = require("zlib");

// 方式1: pipe链式
fs.createReadStream("big.log")
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream("big.log.gz"));

// 方式2: pipeline(推荐,错误处理更好)
await pipeline(
  fs.createReadStream("big.log"),
  zlib.createGzip(),
  fs.createWriteStream("big.log.gz")
);

// 自定义Transform流
const { Transform } = require("stream");
class UpperCase extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}
// HTTP请求体处理
app.use((req, res) => {
  // req本身就是Readable流
  const chunks = [];
  req.on("data", c => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    res.end("ok");
  });
});
#### ❓追问
pipe()和pipeline()的区别？答：pipeline()提供完善的错误处理和资源清理，pipe()错误不会传播可能导致内存泄漏。什么是Object Mode？答：流可以推送任意JS对象而非仅Buffer/String，设objectMode:true开启。

---
## 4. Express中间件原理？

> **难度**: medium | **分类**: Node.js | **ID**: 68

#### 🎯本质
中间件是Express的核心设计模式——请求从外到内依次穿过**一系列处理函数**，每个函数可以修改req/res、执行逻辑、或调用next()传递给下一个中间件。本质是**洋葱模型**。

#### 🧒类比
中间件像工厂流水线——产品（请求）经过一站又一站，每站可以加工（修改请求）、检查（鉴权）、或直接下线（返回响应），next()就是把产品传给下一站。

#### 📊图解
洋葱模型:
  请求→
    中间件A(前置)
      →中间件B(前置)
        →路由处理(核心逻辑)
      ←中间件B(后置)
    ←中间件A(后置)
  ←响应

Express中间件类型:
  app.use()    → 应用级(所有请求)
  router.use() → 路由级(特定路径)
  内置: express.json() express.static()
  错误: (err,req,res,next) => {}

Koa中间件(更优雅):
  app.use(async (ctx, next) => {
    // 前置
    await next(); // 等待下游完成
    // 后置(可修改响应)
  });
#### 🔧详解
Express内部维护一个**中间件栈数组**，请求到来时按注册顺序依次执行。调用next()继续下一个，不调用则请求中止（如鉴权失败）。Express的中间件是**线性执行**的（回调），Koa用async/await实现真正的**洋葱模型**（可以await next()后在响应阶段执行代码，方便修改响应）。

#### 💻代码
// Express中间件
const express = require("express");
const app = express();

// 日志中间件(前置)
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next(); // 传给下一个
});

// 鉴权中间件
app.use("/api", (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send();
  req.user = verifyToken(token);
  next();
});

// 错误处理中间件(4个参数)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Koa中间件(洋葱模型)
const Koa = require("koa");
const app = new Koa();
app.use(async (ctx, next) => {
  const start = Date.now();
  await next(); // 等下游完成
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", ms + "ms");
});
#### ❓追问
Express中间件和Koa中间件的最大区别？答：Express用回调（线性），Koa用async/await（真正的洋葱，可以在next()之后修改响应）。如何写一个可配置的中间件？答：用高阶函数返回中间件函数，如const auth = (secret) => (req,res,next) => {}。

---
## 5. Node.js的事件循环？

> **难度**: easy | **分类**: Node.js | **ID**: 264

#### 🎯 本质
Node.js事件循环分**6个阶段**：timers→pending→idle/prepare→poll→check→close。不同于浏览器。

#### 🧒 类比
Node.js事件循环像多车道环岛——不同类型的车(任务)走不同的道(阶段)。

#### 📊 图解
   ┌──────────────────────┐
┌─>│        timers         │ setTimeout/setInterval
│  └──────────┬───────────┘
│  ┌──────────┴───────────┐
│  │     pending callbacks │ TCP错误回调
│  └──────────┬───────────┘
│  ┌──────────┴───────────┐
│  │       poll           │ I/O回调
│  └──────────┬───────────┘
│  ┌──────────┴───────────┐
│  │       check          │ setImmediate
│  └──────────┬───────────┘
│  ┌──────────┴───────────┐
│  │    close callbacks   │ socket.on('close')
│  └──────────┬───────────┘
└─────────────┘
#### 🔧 详解
每个阶段有自己的队列。timers执行到期的定时器回调。poll阶段获取新I/O事件。check阶段执行setImmediate。process.nextTick是微任务在每个阶段切换时优先执行。微任务(Promise.then)在每个宏任务后执行。

#### 💻 代码
// 执行顺序
setTimeout(()=>console.log('timeout'),0);
setImmediate(()=>console.log('immediate'));
// 在I/O循环中: timeout → immediate
// 在主模块: 不确定

process.nextTick(()=>console.log('nextTick'));
Promise.resolve().then(()=>console.log('promise'));
// nextTick → promise → timeout/immediate
#### ❓ 追问
process.nextTick和Promise微任务谁先？答：nextTick先于Promise微任务。setImmediate和setTimeout(0)谁先？答：在I/O回调中setImmediate先。

---
## 6. Stream流？

> **难度**: medium | **分类**: Node.js | **ID**: 265

#### 🎯 本质
Stream是**流式处理数据**的方式，不需要将全部数据加载到内存。四种类型：Readable/Writable/Duplex/Transform。

#### 🧒 类比
Stream像水管——水(数据)持续流过而不是等所有水装满桶再倒。

#### 📊 图解
四种流:
Readable: 可读(fs.createReadStream)
Writable: 可写(fs.createWriteStream)
Duplex: 可读可写(TCP socket)
Transform: 转换(zlib.createGzip)

模式:
paused(暂停) / flowing(流动)
#### 🔧 详解
Readable有两种模式：paused(手动read)和flowing(自动推送)。pipe()连接可读到可写。背压(backpressure)防止消费者处理慢导致内存溢出。Stream基于EventEmitter实现。

#### 💻 代码
// 流式文件处理
const fs=require('fs');
const zlib=require('zlib');
fs.createReadStream('big.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('big.txt.gz'));

// Transform流
const {Transform}=require('stream');
const upper=new Transform({
  transform(chunk,enc,cb){
    this.push(chunk.toString().toUpperCase());
    cb();
  }
});
#### ❓ 追问
什么是背压(backpressure)？答：消费者处理慢时通知生产者减速，避免内存溢出。

---
## 7. Express中间件原理？

> **难度**: medium | **分类**: Node.js | **ID**: 266

#### 🎯 本质
Express中间件是**按顺序执行的函数链**，每个函数可以访问req/res/next。next()调用下一个中间件。

#### 🧒 类比
中间件像流水线——每个工位(中间件)处理一道工序，完成后传给下个工位(next)。

#### 📊 图解
中间件栈:
req → [middleware1] → [middleware2] → [route handler] → res
       ↓next()         ↓next()

app.use() 全局
app.get() 路由
router.use() 路由级
err(err,req,res,next) 错误
#### 🔧 详解
中间件按注册顺序执行。next()调用下一个中间件。不调用next()则链断裂(需自己结束响应)。错误中间件有4个参数(err,req,res,next)放在最后。app.use挂载到所有路由。

#### 💻 代码
const express=require('express');
const app=express();

// 日志中间件
app.use((req,res,next)=>{
  console.log(req.method,req.url);
  next();
});

// 鉴权中间件
app.use('/api',(req,res,next)=>{
  if(!req.headers.authorization) return res.status(401).end();
  next();
});

// 错误处理
app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).json({error:err.message});
});
#### ❓ 追问
Express和Koa中间件的区别？答：Express是线性(数组)，Koa是洋葱模型(async/await)。

---
## 8. Node.js集群和多进程？

> **难度**: hard | **分类**: Node.js | **ID**: 267

#### 🎯 本质
Node.js单线程用**cluster模块**创建多个工作进程充分利用多核CPU。Master进程管理工作进程。

#### 🧒 类比
集群像连锁店——一个总部(Master)管理多家分店(Worker)，分担客流量。

#### 📊 图解
cluster模式:
  Master进程:
    - 监听端口
    - 分配连接给Worker
    - 管理Worker生命周期
  Worker进程:
    - 各自独立的事件循环
    - 共享端口(通过IPC)

进程间通信: IPC/共享内存
#### 🔧 详解
cluster.fork()创建工作进程。所有进程共享同一个端口(round-robin分配连接)。Worker崩溃时Master自动重启。PM2是进程管理工具提供集群、监控、自动重启。sticky session确保同一用户请求到同一Worker。

#### 💻 代码
// cluster
const cluster=require('cluster');
const os=require('os');
if(cluster.isPrimary){
  const cpus=os.cpus().length;
  for(let i=0;i{
    console.log('Worker died:',worker.pid);
    cluster.fork(); // 自动重启
  });
} else {
  require('./server'); // Worker启动服务
}
#### ❓ 追问
PM2的作用？答：进程管理、集群模式、日志、监控、自动重启。什么是sticky session？答：同一用户的请求始终路由到同一Worker。

---
## 9. 什么是npm？

> **难度**: easy | **分类**: Node.js | **ID**: 268

#### 🎯 本质
npm是**Node.js包管理器**和世界最大的开源注册表。管理项目依赖和脚本。

#### 🧒 类比
npm像应用商店——搜索/安装/更新第三方包(工具库)。

#### 📊 图解
核心命令:
npm init: 初始化项目
npm install: 安装依赖
npm run: 运行脚本
npm publish: 发布包

package.json: 项目配置
package-lock.json: 锁定版本
node_modules: 存储依赖
#### 🔧 详解
dependencies是生产依赖。devDependencies是开发依赖(测试/构建工具)。semver语义化版本：^1.2.3(兼容1.x)、~1.2.3(兼容1.2.x)。npx执行包命令不需全局安装。.npmrc配置registry。

#### 💻 代码
// package.json
{
  "name":"my-app",
  "scripts":{
    "dev":"vite",
    "build":"vite build",
    "test":"jest"
  },
  "dependencies":{
    "express":"^4.18.0"
  },
  "devDependencies":{
    "jest":"^29.0.0"
  }
}
// 安装
npm install lodash --save
npm install jest --save-dev
#### ❓ 追问
npm和yarn的区别？答：yarn更快(并行)、有workspace、lockfile不同。什么是workspace？答：monorepo中管理多个子包。

---
## 10. Node.js错误处理？

> **难度**: medium | **分类**: Node.js | **ID**: 269

#### 🎯 本质
Node.js错误分**操作错误**(网络/文件系统)和**程序错误**(bug)。async/await+try/catch是现代方案。

#### 🧒 类比
错误处理像安全网——预期可能出错(操作错误)要兜住，代码bug(程序错误)要修。

#### 📊 图解
错误类型:
1.同步错误: try/catch
2.异步回调: error-first callback
3.Promise: .catch()
4.async/await: try/catch
5.未捕获: process.on('uncaughtException')
6.未处理Promise: unhandledRejection
#### 🔧 详解
同步代码用try/catch。回调风格是error-first(err,data)。Promise用.catch()。async/await用try/catch包裹。全局兜底用process.on('uncaughtException')但要尽快重启进程。Express用error middleware集中处理。

#### 💻 代码
// async/await错误处理
async function handler(req,res){
  try{
    const data=await fetchData(req.params.id);
    res.json(data);
  }catch(err){
    if(err instanceof NotFoundError) return res.status(404).json({error:'Not found'});
    res.status(500).json({error:'Internal error'});
  }
}
// 全局兜底
process.on('unhandledRejection',err=>{
  console.error('未处理的Promise拒绝:',err);
});
#### ❓ 追问
什么是error-first callback？答：(err,data)=>{}第一个参数是错误。

---
## 11. Node.js模块系统？

> **难度**: medium | **分类**: Node.js | **ID**: 270

#### 🎯 本质
Node.js支持**CommonJS(require)**和**ES Module(import)**。CJS是默认，ESM需配置。

#### 🧒 类比
模块系统像快递分拣——CJS是按需取(同步)，ESM是批量进口(异步)。

#### 📊 图解
CommonJS:
  require() 同步加载
  module.exports 导出
  值拷贝(修改不影响原)

ES Module:
  import/export 异步加载
  静态分析
  只读引用(修改同步)

package.json type: 'module'
#### 🔧 详解
CJS是运行时加载(动态)，ESM是编译时解析(静态)。CJS的require可以动态路径，ESM的import必须是静态字符串。CJS导出值的拷贝，ESM导出值的引用。Node.js通过package.json的type字段区分。

#### 💻 代码
// CommonJS
const fs=require('fs');
module.exports={add:(a,b)=>a+b};

// ES Module (type:'module')
import fs from 'fs';
export const add=(a,b)=>a+b;
export default class App {}

// 动态import
const mod=await import('./plugin.js');
#### ❓ 追问
CJS为什么不能tree-shaking？答：require是运行时调用无法静态分析。Node.js原生支持ESM要怎么配置？答：package.json加type:module或用.mjs扩展名。

---
## 12. RESTful API设计最佳实践？

> **难度**: medium | **分类**: Node.js | **ID**: 271

#### 🎯 本质
RESTful API用**名词URL+HTTP方法**设计接口。版本化、分页、错误格式统一。

#### 🧒 类比
RESTful像图书馆索引——每本书(资源)有唯一编号(URL)，用标准操作(HTTP方法)管理。

#### 📊 图解
最佳实践:
1.URL用名词复数: /users /posts
2.HTTP方法表示操作
3.版本化: /v1/users
4.分页: ?page=1&limit=20
5.过滤: ?status=active
6.错误统一格式
7.HATEOAS(超媒体驱动)
#### 🔧 详解
URL表示资源不包含动词。用查询参数做过滤/排序/分页。响应包含合适的HTTP状态码。错误响应包含code/message/details。版本化通过URL前缀或Header。幂等性：GET/PUT/DELETE幂等，POST非幂等。

#### 💻 代码
// Express RESTful
app.get('/v1/users',async(req,res)=>{
  const{page=1,limit=20,status}=req.query;
  const users=await User.find({status})
    .skip((page-1)*limit).limit(+limit);
  res.json({data:users,meta:{page,limit,total}});
});
app.post('/v1/users',async(req,res)=>{
  const user=await User.create(req.body);
  res.status(201).json({data:user});
});
#### ❓ 追问
什么是HATEOAS？答：响应中包含相关操作的链接(Rest成熟度Level 3)。PUT和PATCH的区别？答：PUT全量替换，PATCH部分更新。

---
## 13. Node.js性能优化？

> **难度**: hard | **分类**: Node.js | **ID**: 272

#### 🎯 本质
Node.js性能优化：**避免阻塞事件循环、流式处理、缓存、集群、连接池**。

#### 🧒 类比
Node.js性能优化像优化餐厅——不让厨师(事件循环)闲等(阻塞)、流水线上菜(流)、开分店(集群)。

#### 📊 图解
优化方向:
1.避免同步操作(阻塞事件循环)
2.流式处理大文件(Stream)
3.缓存(Redis)
4.连接池(数据库)
5.集群(Cluster/PM2)
6.压缩(gzip)
7.监控(APM)
#### 🔧 详解
同步操作(如fs.readFileSync)会阻塞整个事件循环。大文件用Stream处理避免内存溢出。Redis缓存热点数据。数据库连接池复用连接。cluster利用多核。compression中间件压缩响应。使用clinic.js或0x做性能分析。

#### 💻 代码
// 性能优化示例
const compression=require('compression');
app.use(compression()); // gzip压缩

// 连接池
const pool=mysql.createPool({
  connectionLimit:10,
  host:'localhost',
  user:'root',
  database:'mydb'
});

// 缓存
app.get('/api/data',async(req,res)=>{
  const cached=await redis.get('data');
  if(cached) return res.json(JSON.parse(cached));
  const data=await db.query('SELECT * FROM ...');
  await redis.setex('data',300,JSON.stringify(data));
  res.json(data);
});
#### ❓ 追问
什么是事件循环阻塞？答：单个任务超过~100ms影响其他请求。如何检测？答：clinic.js doctor、0x火焰图。

---
## 14. Cookie和Session实现？

> **难度**: medium | **分类**: Node.js | **ID**: 273

#### 🎯 本质
Cookie存在**浏览器**(每次请求携带)。Session存在**服务器**(通过sessionId关联)。express-session管理Session。

#### 🧒 类比
Cookie像身份证(随身带)，Session像户籍(在公安局查)。

#### 📊 图解
流程:
1.客户端首次请求
2.服务端创建Session(内存/Redis)
3.返回Set-Cookie: sessionId=xxx
4.后续请求自动携带Cookie
5.服务端通过sessionId查找Session
#### 🔧 详解
express-session中间件自动管理Session。默认存在内存(生产环境用Redis)。Cookie可设置HttpOnly/Secure/SameSite。session cookie存在浏览器关闭后删除。session持久化到Redis解决多进程共享。

#### 💻 代码
const session=require('express-session');
const RedisStore=require('connect-redis');
app.use(session({
  store:new RedisStore({client:redisClient}),
  secret:'keyboard cat',
  resave:false,
  saveUninitialized:false,
  cookie:{
    httpOnly:true,
    secure:true,
    maxAge:3600000
  }
}));
app.get('/login',(req,res)=>{
  req.session.userId=user.id;
  res.json({ok:true});
});
#### ❓ 追问
Session和JWT的选择？答：Session可立即吊销，JWT无状态易扩展。什么是Session Fixation？答：攻击者预设sessionId。

---
## 15. 文件上传处理？

> **难度**: medium | **分类**: Node.js | **ID**: 274

#### 🎯 本质
文件上传用**multipart/form-data**编码。Node.js用multer/multiparty/formidable等中间件处理。

#### 🧒 类比
文件上传像寄包裹——用特殊包装(multipart)把普通信件(表单)和物品(文件)一起寄。

#### 📊 图解
处理流程:
1.客户端: enctype='multipart/form-data'
2.服务端: multer中间件解析
3.存储: 本地/云存储(S3/OSS)
4.验证: 类型/大小/病毒扫描

multer配置:
  dest/ storage
  limits: fileSize/fileCount
  fileFilter: 类型过滤
#### 🔧 详解
multer是Express最常用的上传中间件。diskStorage自定义文件名和路径。limits限制文件大小和数量。fileFilter过滤文件类型。大文件用Stream流式处理避免内存溢出。生产环境建议上传到云存储。

#### 💻 代码
const multer=require('multer');
const upload=multer({
  storage:multer.diskStorage({
    destination:'uploads/',
    filename:(req,file,cb)=>cb(null,Date.now()+'-'+file.originalname)
  }),
  limits:{fileSize:5*1024*1024}, // 5MB
  fileFilter:(req,file,cb)=>{
    if(/jpeg|jpg|png|gif/.test(file.mimetype)) cb(null,true);
    else cb(new Error('只允许图片'));
  }
});
app.post('/upload',upload.single('avatar'),(req,res)=>{
  res.json({path:req.file.path});
});
#### ❓ 追问
如何处理大文件上传？答：分片上传(Chunk) + 断点续传。multipart/form-data的原理？答：用boundary分隔符将多个字段和文件组合在一个请求中。

---
## 16. 什么是中间件？

> **难度**: easy | **分类**: Node.js | **ID**: 275

#### 🎯 本质
中间件是**位于请求和响应之间的处理函数**。可以修改请求/响应、终止请求、调用下一个中间件。

#### 🧒 类比
中间件像安检流程——经过身份验证→行李检查→登机，每一步都可以放行(next)或拦下。

#### 📊 图解
中间件功能:
1.执行任何代码
2.修改req/res对象
3.结束响应周期
4.调用next()传给下一个

类型:
应用级/路由级/错误处理/内置/第三方
#### 🔧 详解
中间件是Express的核心概念。每个中间件接收(req,res,next)三个参数。必须调用next()或结束响应，否则请求会挂起。中间件按注册顺序执行。错误处理中间件有4个参数。

#### 💻 代码
const app=express();
// 内置中间件
app.use(express.json()); // 解析JSON body
app.use(express.static('public')); // 静态文件

// 自定义中间件
app.use((req,res,next)=>{
  req.startTime=Date.now();
  next();
});

// 路由级
app.use('/api',router);
#### ❓ 追问
Express内置了哪些中间件？答：express.json/urlencoded/static。

---
## 17. Node.js的Buffer？

> **难度**: medium | **分类**: Node.js | **ID**: 276

#### 🎯 本质
Buffer是**二进制数据的容器**，在V8堆外分配内存。用于处理TCP流/文件系统/加密等二进制数据。

#### 🧒 类比
Buffer像二进制数据的中转站——在JS(文本世界)和系统(二进制世界)之间搬运数据。

#### 📊 图解
Buffer特点:
- 固定大小的内存块
- 在V8堆外分配
- 类似整数数组
- 处理二进制数据

创建:
Buffer.alloc(size) 初始化为0
Buffer.from(str/array)
Buffer.allocUnsafe(size) 不初始化
#### 🔧 详解
Buffer代表固定大小的原始内存分配。alloc初始化为0(安全)。allocUnsafe不初始化(快但可能含旧数据)。toString()转为字符串。Buffer.concat合并多个Buffer。Node.js中fs.readFile默认返回Buffer(binary encoding)。

#### 💻 代码
// 创建Buffer
const buf=Buffer.alloc(10); // 10字节全0
const buf2=Buffer.from('hello');
const buf3=Buffer.from([0x48,0x69]); // 'Hi'

// 操作
buf.write('hello');
console.log(buf.toString()); // 'hello'

// 合并
const merged=Buffer.concat([buf2,buf3]);

// 与Stream配合
const fs=require('fs');
const chunks=[];
fs.createReadStream('file.bin')
  .on('data',chunk=>chunks.push(chunk))
  .on('end',()=>Buffer.concat(chunks));
#### ❓ 追问
Buffer和TypedArray的关系？答：Buffer是Uint8Array的子类。什么是Buffer溢出？答：写入超过Buffer大小的数据会被截断。

---
