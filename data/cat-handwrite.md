# 手写题

> 共 17 题

## 1. 手写深拷贝？

> **难度**: medium | **分类**: 手写题 | **ID**: 50

#### 🎯 本质
深拷贝**递归复制所有层级**，创建全新的独立对象。处理循环引用用WeakMap。

#### 🧒 类比
深拷贝像3D打印——照着原件做一个完全独立的复制品。

#### 📊 图解
obj={a:1,b:{c:2}}
深拷贝→ newObj={a:1,b:{c:2}}
改newObj不影响obj
#### 🔧 详解
递归遍历对象属性。基本类型直接复制。引用类型递归拷贝。循环引用用WeakMap缓存。特殊对象(Date/RegExp/Map/Set)需特殊处理。

#### 💻 代码
function deepClone(obj,map=new WeakMap()){
  if(obj===null||typeof obj!=="object") return obj;
  if(map.has(obj)) return map.get(obj);
  if(obj instanceof Date) return new Date(obj);
  const clone=Array.isArray(obj)?[]:{};
  map.set(obj,clone);
  Object.keys(obj).forEach(k=>{clone[k]=deepClone(obj[k],map);});
  return clone;
}
#### ❓ 追问
JSON.parse(JSON.stringify())的局限？答：不支持函数/undefined/循环引用。

---
## 2. 手写Promise？

> **难度**: hard | **分类**: 手写题 | **ID**: 51

#### 🎯 本质
Promise是一个拥有**三种状态**（pending/fulfilled/rejected）的状态机。状态只能从pending变为fulfilled或rejected，且不可逆。then方法返回新的Promise实现链式调用，通过queueMicrotask实现异步执行。

#### 🧒 类比
Promise像餐厅的叫号器——拿到号码（pending），叫号成功了去取餐（fulfilled），或者被告知没菜了（rejected），状态定了不会变。

#### 📊 图解
三种状态(不可逆):
  pending → fulfilled ✅
  pending → rejected ❌

核心机制:
  resolve(value) → 状态→fulfilled
  reject(reason) → 状态→rejected
  then(onFulfilled, onRejected)
    → 返回新Promise(链式调用)
  回调通过微任务异步执行
    (queueMicrotask)
#### 🔧 详解
实现要点：①用value/reason存储结果，reason存储失败原因；②onFulfilled/onRejected用数组存储（支持多次then）；③resolve/reject只能执行一次；④then返回新Promise，根据回调返回值决定新Promise的状态；⑤resolve一个Promise需递归处理。

#### 💻 代码
class MyPromise {
  #state = "pending";
  #value = undefined;
  #callbacks = [];
  constructor(executor) {
    const resolve = val => {
      if (this.#state !== "pending") return;
      this.#state = "fulfilled";
      this.#value = val;
      this.#callbacks.forEach(cb => cb.onFulfilled(val));
    };
    const reject = err => {
      if (this.#state !== "pending") return;
      this.#state = "rejected";
      this.#value = err;
      this.#callbacks.forEach(cb => cb.onRejected(err));
    };
    try { executor(resolve, reject); }
    catch(e) { reject(e); }
  }
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handle = () => {
        queueMicrotask(() => {
          const fn = this.#state === "fulfilled"
            ? onFulfilled : onRejected;
          try {
            resolve(fn(this.#value));
          } catch(e) { reject(e); }
        });
      };
      if (this.#state === "pending")
        this.#callbacks.push({
          onFulfilled: handle, onRejected: handle
        });
      else handle();
    });
  }
}
#### ❓ 追问
Promise.all如何实现？答：计数器+数组，所有fulfilled后resolve，任一rejected就reject。如何处理Promise的并发限制？答：用一个池子控制同时执行的Promise数量，完成一个放一个进去。

---
## 3. 手写call/apply/bind？

> **难度**: easy | **分类**: 手写题 | **ID**: 95

#### 🎯 本质
EventEmitter是**发布-订阅模式**。on订阅emit发布off取消。

#### 🧒 类比
EventEmitter像广播站——听众订阅频道，广播员发消息，所有听众收到。

#### 📊 图解
events={"click":[fn1,fn2],"data":[fn3]}
emit("click") -> fn1()+fn2()
#### 🔧 详解
维护事件到回调列表的映射。on注册回调。emit触发所有回调。off移除回调。once注册一次性回调。

#### 💻 代码
class EventEmitter {
  constructor(){this.events={};}
  on(e,fn){(this.events[e]||=[]).push(fn);return this;}
  emit(e,...args){(this.events[e]||[]).forEach(fn=>fn(...args));return this;}
  off(e,fn){this.events[e]=(this.events[e]||[]).filter(f=>f!==fn);return this;}
  once(e,fn){const w=(...a)=>{fn(...a);this.off(e,w);};return this.on(e,w);}
}
#### ❓ 追问
如何防止内存泄漏？答：组件卸载时off所有订阅。

---
## 4. 手写EventEmitter？

> **难度**: medium | **分类**: 手写题 | **ID**: 96

#### 🎯 本质
Promise.all**等所有成功**才resolve。Promise.race**取第一个完成的**。

#### 🧒 类比
Promise.all像等人齐才出发。Promise.race像赛跑谁先到谁赢。

#### 📊 图解
Promise.all: [p1,p2,p3]全成功->[r1,r2,r3]
Promise.race: [p1,p2,p3]先完成->该结果
#### 🔧 详解
Promise.all维护计数器+结果数组。全部resolve才resolve。任一reject立即reject。Promise.race谁先完成返回谁。

#### 💻 代码
Promise.myAll=function(promises){
  return new Promise((resolve,reject)=>{
    const r=[];let c=0;
    promises.forEach((p,i)=>{
      Promise.resolve(p).then(v=>{r[i]=v;if(++c===promises.length)resolve(r);}).catch(reject);
    });
  });
};
Promise.myRace=function(promises){
  return new Promise((resolve,reject)=>{
    promises.forEach(p=>Promise.resolve(p).then(resolve).catch(reject));
  });
};
#### ❓ 追问
Promise.all一个失败怎么办？答：用allSettled或catch包装每个Promise。

---
## 5. 手写Promise？

> **难度**: medium | **分类**: 手写题 | **ID**: 321

#### 🎯 本质
Promise是**异步编程的核心**：三种状态(pending/fulfilled/rejected)，状态不可逆。

#### 🧒 类比
Promise像自动售货机——投币(pending)→出货(fulfilled)或退币(rejected)，不可逆。

#### 📊 图解
状态: pending → fulfilled/rejected
核心: then/catch/finally
#### 🔧 详解
状态只能从pending变fulfilled或rejected。then返回新Promise实现链式。resolve/reject是executor参数。

#### 💻 代码
class MyPromise {
  constructor(executor){
    this.state='pending';
    this.value=undefined;
    this.callbacks=[];
    const resolve=val=>{
      if(this.state!=='pending') return;
      this.state='fulfilled';this.value=val;
      this.callbacks.forEach(cb=>cb.onFulfilled(val));
    };
    const reject=err=>{
      if(this.state!=='pending') return;
      this.state='rejected';this.value=err;
      this.callbacks.forEach(cb=>cb.onRejected(err));
    };
    try{executor(resolve,reject);}catch(e){reject(e);}
  }
}
#### ❓ 追问
Promise.all如果有一个reject？答：整个reject。allSettled呢？答：等待所有完成不论成功失败。

---
## 6. 手写call/apply/bind？

> **难度**: medium | **分类**: 手写题 | **ID**: 322

#### 🎯 本质
call/apply**立即调用**函数并指定this。bind**返回新函数**永久绑定this。

#### 🧒 类比
call像当面委托(列参数)，apply像打包委托(数组)，bind像签委托书(永久)。

#### 📊 图解
call(thisArg,...args)
apply(thisArg,[args])
bind(thisArg,...args)
#### 🔧 详解
call和apply立即执行。call传参数列表，apply传数组。bind返回新函数不立即执行。

#### 💻 代码
Function.prototype.myCall=function(ctx,...args){
  ctx=ctx||window;
  const key=Symbol();
  ctx[key]=this;
  const result=ctx[key](...args);
  delete ctx[key];
  return result;
};
Function.prototype.myBind=function(ctx,...args){
  const fn=this;
  return function(...rest){
    return fn.apply(ctx,[...args,...rest]);
  };
};
#### ❓ 追问
bind返回的函数能被new调用吗？答：能，new时this指向新实例。

---
## 7. 手写深拷贝？

> **难度**: medium | **分类**: 手写题 | **ID**: 323

#### 🎯 本质
深拷贝**递归复制所有层级**。处理循环引用、特殊对象(Date/RegExp/Map/Set)。

#### 🧒 类比
深拷贝像复印整本书(每一页)，浅拷贝像只复印目录。

#### 📊 图解
深拷贝关键:
1.递归复制
2.循环引用(WeakMap)
3.特殊对象
#### 🔧 详解
JSON.parse(JSON.stringify())简单但有局限。递归实现用WeakMap防止循环。

#### 💻 代码
function deepClone(obj,map=new WeakMap()){
  if(obj===null||typeof obj!=='object') return obj;
  if(map.has(obj)) return map.get(obj);
  if(obj instanceof Date) return new Date(obj);
  if(obj instanceof RegExp) return new RegExp(obj);
  const clone=Array.isArray(obj)?[]:Object.create(Object.getPrototypeOf(obj));
  map.set(obj,clone);
  Reflect.ownKeys(obj).forEach(key=>{clone[key]=deepClone(obj[key],map);});
  return clone;
}
#### ❓ 追问
structuredClone和手动实现的区别？答：structuredClone是浏览器原生API支持更多类型。

---
## 8. 手写防抖debounce？

> **难度**: easy | **分类**: 手写题 | **ID**: 324

#### 🎯 本质
防抖在**事件停止触发后**执行一次。

#### 🧒 类比
防抖像等电梯——有人进来就重新等。

#### 📊 图解

```
每次触发清除旧定时器设新的
```

#### 🔧 详解
最后一次触发后delay毫秒执行。支持this和参数传递。

#### 💻 代码
function debounce(fn,delay){
  let timer;
  return function(...args){
    clearTimeout(timer);
    timer=setTimeout(()=>fn.apply(this,args),delay);
  };
}
#### ❓ 追问
什么是leading debounce？答：触发时立即执行一次然后冷却。

---
## 9. 手写EventEmitter？

> **难度**: medium | **分类**: 手写题 | **ID**: 325

#### 🎯 本质
EventEmitter是**发布订阅模式**的实现：on/emit/off/once。

#### 🧒 类比
EventEmitter像广播站——注册频道(on)→广播(emit)→取消(off)。

#### 📊 图解

```
on注册 emit触发 off移除 once一次性
```

#### 🔧 详解
支持链式调用、once自动取消。

#### 💻 代码
class EventBus {
  events={};
  on(e,fn){(this.events[e]||=[]).push(fn);return this;}
  emit(e,...a){(this.events[e]||[]).forEach(fn=>fn(...a));return this;}
  off(e,fn){
    if(!fn) delete this.events[e];
    else this.events[e]=this.events[e]?.filter(f=>f!==fn);
    return this;
  }
  once(e,fn){
    const w=(...a)=>{fn(...a);this.off(e,w);};
    this.on(e,w);
  }
}
#### ❓ 追问
如何防止内存泄漏？答：组件卸载时调用off移除监听。

---
## 10. 手写async/await原理？

> **难度**: hard | **分类**: 手写题 | **ID**: 326

#### 🎯 本质
async/await本质是**Generator+自动执行器**的语法糖。

#### 🧒 类比
async/await像自动挡(generator是手动挡)——不用自己踩离合(next)。

#### 📊 图解

```
Generator + 自动执行器 = async/await
```

#### 🔧 详解
Generator可暂停(yield)和恢复(next)。自动执行器等Promise resolve后调用next。

#### 💻 代码
function asyncToGenerator(genFn){
  return function(){
    const gen=genFn.apply(this,arguments);
    return new Promise((resolve,reject)=>{
      function step(key,arg){
        try{var {value,done}=gen[key](arg);}
        catch(e){return reject(e);}
        if(done) return resolve(value);
        Promise.resolve(value).then(v=>step('next',v),e=>step('throw',e));
      }
      step('next');
    });
  };
}
#### ❓ 追问
co库的原理？答：自动执行Generator。

---
## 11. 手写柯里化curry？

> **难度**: medium | **分类**: 手写题 | **ID**: 327

#### 🎯 本质
柯里化将**多参数函数转换为一系列单参数函数**。

#### 🧒 类比
柯里化像自动售货机逐个投币——投够金额(参数)才出货(执行)。

#### 📊 图解

```
收集参数够了再执行
```

#### 🔧 详解
fn.length是函数声明的参数个数。收集够了执行，不够返回新函数继续收集。

#### 💻 代码
function curry(fn){
  return function curried(...args){
    if(args.length>=fn.length) return fn(...args);
    return (...more)=>curried(...args,...more);
  };
}
const add=curry((a,b,c)=>a+b+c);
add(1)(2)(3); // 6
add(1,2)(3);   // 6
#### ❓ 追问
什么是偏函数？答：固定部分参数返回新函数。

---
## 12. 手写Promise.all？

> **难度**: medium | **分类**: 手写题 | **ID**: 328

#### 🎯 本质
Promise.all**等待所有Promise成功**返回结果数组。任一失败则整体失败。

#### 🧒 类比
Promise.all像团体赛——所有人通过才算通过。

#### 📊 图解

```
并发执行全部→收集结果
```

#### 🔧 详解
用count计数。Promise.resolve包装兼容非Promise值。

#### 💻 代码
Promise.all=function(promises){
  return new Promise((resolve,reject)=>{
    const results=[];let count=0;
    promises.forEach((p,i)=>{
      Promise.resolve(p).then(val=>{
        results[i]=val;
        if(++count===promises.length) resolve(results);
      },reject);
    });
  });
};
#### ❓ 追问
Promise.allSettled和all的区别？答：allSettled等所有完成不论成败。

---
## 13. 手写new操作符？

> **难度**: easy | **分类**: 手写题 | **ID**: 329

#### 🎯 本质
new做了**四件事**：创建对象→设置原型→执行构造函数→返回。

#### 🧒 类比
new像工厂——创建产品→贴品牌→加工→出厂。

#### 📊 图解
1.创建空对象
2.设置原型
3.绑定this执行
4.返回
#### 🔧 详解
创建空对象设原型链。执行构造函数。构造函数返回对象则用返回值。

#### 💻 代码
function myNew(Constructor,...args){
  const obj=Object.create(Constructor.prototype);
  const result=Constructor.apply(obj,args);
  return result instanceof Object ? result : obj;
}
#### ❓ 追问
构造函数返回对象会覆盖new创建的对象？答：规范规定如果返回值是对象则使用它。

---
## 14. 手写数组扁平化？

> **难度**: medium | **分类**: 手写题 | **ID**: 330

#### 🎯 本质
将**嵌套数组**转为**一维数组**。

#### 🧒 类比
扁平化像拆套娃——把一层层的盒子拆成平铺。

#### 📊 图解

```
递归/迭代/ES6 flat
```

#### 🔧 详解
depth参数控制扁平深度。flat(Infinity)完全扁平。

#### 💻 代码
function flatten(arr,depth=1){
  return arr.reduce((acc,val)=>
    Array.isArray(val)&&depth>0
      ? acc.concat(flatten(val,depth-1))
      : acc.concat(val)
  ,[]);
}
// ES6: arr.flat(Infinity)
#### ❓ 追问
flat方法支持？答：ES2019，Node.js 11+。

---
## 15. 手写节流throttle？

> **难度**: medium | **分类**: 手写题 | **ID**: 331

#### 🎯 本质
节流在**固定时间间隔**内只执行一次。

#### 🧒 类比
节流像红绿灯——固定时间放行一次。

#### 📊 图解

```
记录上次执行时间，间隔内忽略
```

#### 🔧 详解
距上次执行超过interval则执行并更新时间。

#### 💻 代码
function throttle(fn,interval){
  let last=0;
  return function(...args){
    const now=Date.now();
    if(now-last>=interval){
      last=now;fn.apply(this,args);
    }
  };
}
#### ❓ 追问
requestAnimationFrame和节流的关系？答：rAF是浏览器帧同步的节流(约16.7ms)。

---
## 16. 手写并发控制？

> **难度**: hard | **分类**: 手写题 | **ID**: 332

#### 🎯 本质
限制**同时执行的Promise数量**。

#### 🧒 类比
并发控制像收费站——只有N个收费口。

#### 📊 图解

```
维护执行集合+Promise.race
```

#### 🔧 详解
超过limit用Promise.race等最快完成的。

#### 💻 代码
async function concurrentLimit(tasks,limit){
  const results=[];const executing=new Set();
  for(const [i,task] of tasks.entries()){
    const p=Promise.resolve().then(()=>task()).then(val=>{results[i]=val;executing.delete(p);});
    executing.add(p);
    if(executing.size>=limit) await Promise.race(executing);
  }
  await Promise.all(executing);
  return results;
}
#### ❓ 追问
Promise.race的用途？答：返回最先完成的Promise结果。

---
## 17. 手写AJAX？

> **难度**: medium | **分类**: 手写题 | **ID**: 333

#### 🎯 本质
用**XMLHttpRequest**或**fetch**发送网络请求。

#### 🧒 类比
AJAX像后台派快递——不刷新页面就拿到数据。

#### 📊 图解

```
XHR vs fetch
```

#### 🔧 详解
XHR是传统方式。fetch是现代API(基于Promise)。

#### 💻 代码
function ajax(url,method='GET',data=null){
  return new Promise((resolve,reject)=>{
    const xhr=new XMLHttpRequest();
    xhr.open(method,url);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onload=()=>resolve(JSON.parse(xhr.responseText));
    xhr.onerror=()=>reject(xhr.statusText);
    xhr.send(data?JSON.stringify(data):null);
  });
}
// fetch
fetch(url,{method,body:JSON.stringify(data),headers:{'Content-Type':'application/json'}})
  .then(r=>r.json())
#### ❓ 追问
fetch和XHR的区别？答：fetch基于Promise、更简洁、默认不拒绝HTTP错误。

---
