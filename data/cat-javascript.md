# JavaScript基础

> 共 12 题

## 1. var、let、const 的区别是什么？

> **难度**: easy | **分类**: JavaScript基础 | **ID**: 1

#### 🎯 本质
核心区别在于**作用域**、**提升**和**可变性**。

#### 🧒 类比
var像公共广播，let像房间对讲机，const像刻石头。

#### 📊 图解
         var     let      const
作用域   函数级   块级      块级
提升     是       否(TDZ)  否(TDZ)
重复声明 是       否       否
重新赋值 是       是       否
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
这道题的底层原理是什么？

---
## 2. == 和 === 的区别？

> **难度**: easy | **分类**: JavaScript基础 | **ID**: 2

#### 🎯 本质
**==** 是宽松比较，比较前会进行**隐式类型转换**；**===** 是严格比较，要求类型和值完全相同，不做任何转换。

#### 🧒 类比
== 像只比身高数值（不管单位，英尺和米一样高就算相等），=== 像必须身高数值和单位都一模一样才算相等。

#### 📊 图解
==  vs  ===
"1" == 1     → true  (字符串转数字)
"1" === 1    → false (类型不同)
null == undefined  → true  (特殊规则)
null === undefined → false (类型不同)
NaN == NaN   → false
NaN === NaN  → false (NaN不等于自己)
0 == false   → true
0 === false  → false
#### 🔧 详解
== 遵循**抽象相等比较算法**：当两边类型不同时，会按规则转换——字符串转数字、布尔值转数字、null和undefined互相相等、对象调valueOf/toString。=== 直接比较，类型不同直接返回false。**最佳实践：始终使用===，避免隐式转换带来的意外bug。**

#### 💻 代码
console.log(1 == "1");    // true
console.log(1 === "1");   // false
console.log(null == undefined);  // true
console.log(null === undefined); // false
console.log("" == false); // true（都转0）
console.log("" === false);// false
// 推荐：永远用 ===
#### ❓ 追问
Object.is() 和 === 有何区别？答：Object.is(NaN, NaN)返回true，Object.is(-0, 0)返回false，其他与===一致。

---
## 3. 闭包是什么？有哪些应用场景？

> **难度**: medium | **分类**: JavaScript基础 | **ID**: 3

#### 🎯 本质
闭包=函数+其创建时的词法环境。

#### 🧒 类比
用生活中的场景来类比理解这个概念，降低认知门槛。

#### 📊 图解

```
概念关系图示
```
function outer(){
  let count=0;
  return function(){ return ++count; };
}
#### 🔧 应用
数据私有化柯里化防抖节流React Hooks
#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
这道题的底层原理是什么？

---
## 4. 原型链是什么？

> **难度**: medium | **分类**: JavaScript基础 | **ID**: 4

#### 🎯 本质
每个JS对象都有一个隐藏属性 **__proto__**（即[[Prototype]]），指向其构造函数的 prototype 对象。 prototype 本身也是对象，也有自己的 __proto__，层层向上直到 null，形成**原型链**。属性查找时沿链向上搜索。

#### 🧒 类比
你没钱了先翻自己口袋（自身属性），没有就找爸爸要（__proto__），爸爸没有找爷爷，一直找到祖宗（null）还没有就返回 undefined。

#### 📊 图解
实例obj → obj.__proto__
        = Person.prototype
        → Person.prototype.__proto__
        = Object.prototype
        → Object.prototype.__proto__
        = null (链终点)
#### 🔧 详解
**prototype** 是函数的属性，定义实例共享的方法。**__proto__** 是对象的属性，指向创建该对象的构造函数的 prototype。当访问 obj.prop 时，JS引擎先查 obj 自身，没有则沿 __proto__ 向上查找。Object.create(null) 可创建无原型对象。

#### 💻 代码
function Person(name) { this.name = name; }
Person.prototype.sayHi = function() {
  return "Hi, " + this.name;
};
const p = new Person("Tom");
console.log(p.sayHi());        // "Hi, Tom" (原型链上找到)
console.log(p.hasOwnProperty("name")); // true (Object.prototype上)
console.log(Object.getPrototypeOf(p) === Person.prototype); // true
#### ❓ 追问
如何判断属性是自身的还是继承的？答：hasOwnProperty()。如何创建纯净无原型对象？答：Object.create(null)。

---
## 5. this 的指向规则？

> **难度**: medium | **分类**: JavaScript基础 | **ID**: 5

#### 🎯 本质
this 是函数运行时自动生成的内部对象，指向**调用该函数的对象**。它的值在运行时确定，取决于函数的调用方式，而非定义位置。

#### 🧒 类比
this 像英语中的"我"——谁在说话（谁调用函数），"我"就指谁。张三说"我"指张三，李四说"我"指李四。

#### 📊 图解
四条规则（优先级从高到低）:
1. new绑定  → this指向新创建的对象
2. 显式绑定 → call/apply/bind 指定this
3. 隐式绑定 → obj.fn() 中this指向obj
4. 默认绑定 → 独立调用this指向window
   (严格模式下为undefined)
#### 🔧 详解
**new绑定**：new Fn() 时创建空对象，this指向它。**显式绑定**：fn.call(obj) 硬性指定this。**隐式绑定**：obj.fn() 时this为obj，但赋值给变量后丢失（隐式丢失）。**箭头函数**没有自己的this，继承外层函数的this（定义时确定，不可更改）。

#### 💻 代码
const obj = {
  name: "Tom",
  say: function() { return this.name; },
  greet: () => this.name // 箭头函数，this为外层
};
console.log(obj.say());       // "Tom"
const fn = obj.say;
console.log(fn());            // undefined (隐式丢失)
console.log(fn.call(obj));    // "Tom" (显式绑定)
#### ❓ 追问
箭头函数可以做构造函数吗？答：不可以，没有prototype和this绑定，new会报错。bind多次绑定生效几次？答：只生效一次，bind返回的函数再call无效。

---
## 6. Event Loop 事件循环机制？

> **难度**: hard | **分类**: JavaScript基础 | **ID**: 6

#### 🎯 本质
JS单线程通过事件循环实现异步。

#### 🧒 类比
用生活中的场景来类比理解这个概念，降低认知门槛。

#### 📊 图解

```
概念关系图示
```

```
调用栈(同步)→清空→微任务(Promise)全执行→宏任务(setTimeout)取一个→循环
```
console.log(1);setTimeout(()=>log(2),0);
Promise.resolve().then(()=>log(3));log(4);
// 1,4,3,2
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
这道题的底层原理是什么？

---
## 7. Promise 状态和常用方法？

> **难度**: medium | **分类**: JavaScript基础 | **ID**: 7

#### 🎯 本质
Promise 是异步编程的解决方案，表示一个异步操作的最终结果。它有三种状态：**pending**（进行中）→ **fulfilled**（已成功）/ **rejected**（已失败），状态一旦变更不可逆。

#### 🧒 类比
Promise 像在餐厅取号等位——拿到小票（pending），要么叫到号入座（fulfilled），要么被告知没位了（rejected）。状态定了就不会再变。

#### 📊 图解
pending(进行中)
  ├→ fulfilled(已成功) ✅ → .then()接收
  └→ rejected(已失败) ❌ → .catch()接收
  (一旦确定不可逆)

常用方法:
Promise.all()      → 全部成功才成功
Promise.allSettled()→ 全部完成(不论成败)
Promise.race()     → 取第一个完成的
Promise.any()      → 取第一个成功的
#### 🔧 详解
**Promise.all**：所有都fulfilled才fulfilled，任一rejected就rejected（短路）。**Promise.allSettled**：等全部完成，不会短路，返回每项结果。**Promise.race**：取最先改变状态的。**Promise.any**：取最先fulfilled的，全rejected才rejected。**链式调用**：.then() 返回新 Promise，支持链式。

#### 💻 代码
const p1 = fetch("/api/user");
const p2 = fetch("/api/posts");
Promise.all([p1, p2])
  .then(([user, posts]) => {
    console.log("全部成功", user, posts);
  })
  .catch(err => console.log("任一失败", err));
Promise.allSettled([p1, p2])
  .then(results => {
    results.forEach(r => {
      console.log(r.status, r.value || r.reason);
    });
  });
#### ❓ 追问
如何实现Promise串行执行？答：用reduce将then链串联。async/await的异常处理怎么做？答：try/catch包裹await。

---
## 8. 数组哪些方法会修改原数组？

> **难度**: easy | **分类**: JavaScript基础 | **ID**: 8

#### 🎯 本质
数组方法分为两类：**Mutating（会修改原数组）**和**Immutable（不修改原数组，返回新数组）**。这是React等框架中正确更新状态的关键知识。

#### 🧒 类比
Mutating方法像在原画上直接涂改（画就变了），Immutable方法像先复印一份再在复印件上改（原画不变）。

#### 📊 图解
会修改原数组(Mutating):
push/pop    → 尾部增删
unshift/shift → 头部增删
splice      → 任意位置增删改
sort        → 排序
reverse     → 反转
fill        → 填充

不修改原数组(Immutable):
map/filter/reduce → 遍历变换
slice       → 截取子数组
concat      → 拼接
flat/flatMap → 扁平化
find/findIndex → 查找
includes/indexOf → 搜索
#### 🔧 详解
React 中必须用 Immutable 方法更新数组，否则引用没变，视图不更新。sort 默认按字符串排序，[10,2,1].sort() 结果是 [1,10,2]，需传比较函数。splice 是万能方法，可同时增删改。

#### 💻 代码
const arr = [3, 1, 2];
// Mutating
arr.sort((a, b) => a - b); // arr变为[1,2,3]
arr.push(4);               // arr变为[1,2,3,4]
arr.splice(1, 1, 99);      // arr变为[1,99,3,4]

// Immutable
const arr2 = [3, 1, 2];
const sorted = [...arr2].sort((a, b) => a - b);
const doubled = arr2.map(x => x * 2);
console.log(arr2);    // [3,1,2] 原数组不变
#### ❓ 追问
React中如何正确更新数组状态？答：setState([...arr, newItem]) 或 setState(arr.filter(...))，用展开运算符或Immutable方法。

---
## 9. 深拷贝如何实现？

> **难度**: medium | **分类**: JavaScript基础 | **ID**: 9

#### 🎯 本质
深拷贝是创建一个与原对象**完全独立**的新对象，递归复制所有层级的属性。修改新对象不会影响原对象。与浅拷贝（只复制第一层引用）形成对比。

#### 🧒 类比
浅拷贝像抄了一份通讯录但电话号码还是同一串数字（共享引用），深拷贝像把每个人都克隆了一遍，完全独立。

#### 📊 图解
浅拷贝: Object.assign / 展开运算符
  obj = {a:1, b:{c:2}}
  copy = {...obj}
  copy.b.c = 99 → obj.b.c也变99 ❌

深拷贝:
  copy = deepClone(obj)
  copy.b.c = 99 → obj.b.c还是2 ✅
#### 🔧 详解
**方法一**：structuredClone(obj) — 浏览器原生API，支持循环引用，推荐使用。**方法二**：JSON.parse(JSON.stringify(obj)) — 简单但不支持函数、undefined、Symbol、循环引用、Date对象。**方法三**：递归实现 + WeakMap 处理循环引用，最灵活。

#### 💻 代码
// 方法1: 原生API(推荐)
const copy = structuredClone(original);

// 方法2: JSON(简单但有局限)
const copy = JSON.parse(JSON.stringify(obj));

// 方法3: 手动递归(支持循环引用)
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (map.has(obj)) return map.get(obj);
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }
  return clone;
}
#### ❓ 追问
lodash的cloneDeep是如何处理特殊对象（Date、RegExp、Map）的？答：通过类型判断分别构造对应实例。

---
## 10. typeof 和 instanceof 的区别？

> **难度**: easy | **分类**: JavaScript基础 | **ID**: 10

#### 🎯 本质
**typeof** 是一元运算符，返回表示数据类型的字符串；**instanceof** 检测对象的原型链上是否存在某构造函数的 prototype。两者用途不同。

#### 🧒 类比
typeof 像看外表猜物种（快速但粗糙），instanceof 像验DNA确认是否属于某家族（精准但只对引用类型有效）。

#### 📊 图解
typeof返回值:
"undefined" | "string" | "number" | "boolean"
"object"   | "function" | "symbol" | "bigint"

typeof null       → "object" (历史bug)
typeof []         → "object" (无法区分数组)
typeof function(){} → "function"

instanceof:
[] instanceof Array    → true
[] instanceof Object   → true (原型链)
#### 🔧 详解
typeof 对基本类型（除null外）判断准确，对引用类型只能区分function。**instanceof** 只能判断引用类型，不能判断基本类型。最精确的类型判断用 **Object.prototype.toString.call()**，返回 [object Type]。

#### 💻 代码
console.log(typeof 123);        // "number"
console.log(typeof "hello");    // "string"
console.log(typeof null);       // "object" (bug!)
console.log(typeof []);         // "object"
console.log(typeof (() => {})); // "function"

console.log([] instanceof Array);  // true
console.log("abc" instanceof String); // false (基本类型)

// 最准确的方式
const type = Object.prototype.toString;
console.log(type.call(null));   // "[object Null]"
console.log(type.call([]));     // "[object Array]"
console.log(type.call(/a/));    // "[object RegExp]"
#### ❓ 追问
Array.isArray() 和 instanceof Array 有何区别？答：isArray 可跨iframe判断，instanceof 在不同全局环境下可能失效。

---
## 11. Generator和async/await的关系？

> **难度**: hard | **分类**: JavaScript基础 | **ID**: 11

#### 🎯 本质
async/await = Generator + 自动执行器（如 co 库）的语法糖。

#### 🧒 类比
Generator 像手动挡汽车（自己踩离合换挡），async/await 像自动挡（系统帮你换）。

#### 📊 对比
// Generator（需要手动执行器）
function* fetchData() {
  const a = yield fetch("/api/a");
  const b = yield fetch("/api/b");
  return [a, b];
}
co(fetchData()); // 需要 co 库驱动

// async/await（自动执行）
async function fetchData() {
  const a = await fetch("/api/a");
  const b = await fetch("/api/b");
  return [a, b];
}
#### ❓ 追问
Generator 还能做什么？答：迭代器协议、惰性求值、协程。

#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

---
## 12. map和forEach的区别？

> **难度**: medium | **分类**: JavaScript基础 | **ID**: 12

#### 🎯 本质
forEach 遍历无返回值；map 遍历并返回新数组。

#### 🧒 类比
forEach 像挨家挨户发传单（做完了就完了）；map 像挨家挨户收快递（收完堆成一堆还给你）。

#### 💻 代码
const arr = [1, 2, 3];
arr.forEach(x => x * 2);  // undefined（无返回）
arr.map(x => x * 2);       // [2, 4, 6]
arr.map(x => x * 2).filter(x => x > 2); // 链式调用 ✓
#### 📊 性能
map 略慢（要创建新数组），但可链式。不需要返回值时用 forEach。

#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### ❓ 追问
这道题的底层原理是什么？

---
