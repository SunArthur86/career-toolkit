# 设计模式

> 共 17 题

## 1. 前端常见设计模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 42

#### 🎯 本质
设计模式是**软件设计中常见问题的可复用解决方案**。前端常用的有单例、观察者、发布订阅、策略、代理、装饰器等模式，它们让代码更优雅、可维护、可扩展。

#### 🧒 类比
设计模式像厨师的拿手菜谱——遇到某种食材（问题场景），按菜谱（模式）做就行，不用每次从头琢磨。

#### 📊 图解
① 单例模式(Singleton)
  全局只一个实例
  应用:Vuex/Redux store, 全局弹窗管理器

② 观察者模式(Observer)
  一对多依赖,状态变化自动通知
  应用:Vue2响应式(Dep→Watcher)

③ 发布订阅模式(Pub/Sub)
  通过事件总线解耦发布者和订阅者
  应用:Redux(dispatch→subscribe), EventEmitter

④ 策略模式(Strategy)
  算法族封装,可互相替换
  应用:表单验证规则,价格计算策略

⑤ 代理模式(Proxy)
  控制对象访问,加中间层
  应用:ES6 Proxy(响应式), 图片懒加载

⑥ 装饰器模式(Decorator)
  动态添加功能,不改变原对象
  应用:React HOC, TS @decorator
#### 🔧 详解
**观察者vs发布订阅**：观察者直接通知（Subject知道Observer），发布订阅通过EventBus中转（完全解耦）。**策略模式**核心是将if/else替换为策略对象映射，新增策略只需加配置不改逻辑。**代理模式**在Vue3中广泛使用，Proxy拦截get/set实现响应式。

#### 💻 代码
// 策略模式:表单验证
const rules = {
  required: v => !!v || "必填",
  email: v => /@/.test(v) || "邮箱格式错误",
  minLen: (v, n) => v.length >= n || "最少"+n+"字符"
};
function validate(value, ruleList) {
  for (const [rule, ...args] of ruleList) {
    const msg = rules[rule](value, ...args);
    if (msg !== true) return msg;
  }
  return true;
}

// 发布订阅:EventBus
class EventBus {
  #map = new Map();
  on(evt, fn) {
    this.#map.set(evt, [...(this.#map.get(evt)||[]), fn]);
  }
  emit(evt, data) {
    (this.#map.get(evt)||[]).forEach(fn => fn(data));
  }
  off(evt, fn) {
    this.#map.set(evt, (this.#map.get(evt)||[]).filter(f=>f!==fn));
  }
}
#### ❓ 追问
工厂模式和抽象工厂的区别？答：工厂模式创建一种产品，抽象工厂创建一族相关产品。前端最常用的设计模式是哪个？答：观察者/发布订阅（所有响应式框架和状态管理都基于此）。

---
## 2. 什么是单例模式？前端应用？

> **难度**: easy | **分类**: 设计模式 | **ID**: 63

#### 🎯 本质
确保一个类只有一个实例。

#### 🧒 类比
用生活中的场景来类比理解这个概念，降低认知门槛。

#### 📊 图解

```
概念关系图示
```
// JS实现
const Singleton = (function() {
  let instance;
  return function() {
    if (!instance) instance = this;
    return instance;
  };
})();
#### 💡 应用
Vuex/Redux的store全局WebSocket连接弹窗管理器
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
在前端框架中有哪些体现？

---
## 3. 观察者模式 vs 发布订阅模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 64

#### 🎯本质
**观察者模式**：Subject直接通知Observer，两者有直接依赖关系。**发布订阅模式**：通过EventBus(调度中心)中转，发布者和订阅者完全解耦。两者都是一对多的依赖关系，但解耦程度不同。

#### 🧒类比
观察者像老师直接点名通知学生（老师认识每个学生），发布订阅像微信公众号——作者发文（发布），粉丝收推送（订阅），作者和粉丝互不认识，通过平台中转。

#### 📊图解
观察者模式(Observer):
  Subject ←→ Observer(直接联系)
  Subject维护Observer列表
  Subject.notify() → 逐个调用Observer.update()
  应用: Vue2响应式 Dep→Watcher

发布订阅模式(Pub/Sub):
  Publisher → EventBus → Subscriber
  发布者和订阅者互不知道对方
  通过事件名(channel)匹配
  应用: Redux, EventEmitter, 自定义事件

核心区别:
  观察者: 两个角色,直接通信,耦合
  发布订阅: 三个角色,间接通信,解耦
  发布订阅=观察者+事件总线
#### 🔧详解
**观察者模式**适合组件内部通信（如Vue的响应式系统：Dep收集Watcher，数据变化时Dep通知所有Watcher更新）。**发布订阅模式**适合跨模块通信（如Redux：组件dispatch action，reducer处理后通知订阅者）。EventEmitter是发布订阅的典型实现。

#### 💻代码
// 观察者模式
class Subject {
  #observers = [];
  subscribe(obs) { this.#observers.push(obs); }
  unsubscribe(obs) {
    this.#observers = this.#observers
      .filter(o => o !== obs);
  }
  notify(data) {
    this.#observers.forEach(o => o.update(data));
  }
}
class Observer {
  update(data) { console.log("收到:", data); }
}

// 发布订阅模式
class EventBus {
  #map = new Map();
  on(event, fn) {
    this.#map.set(event,
      [...(this.#map.get(event)||[]), fn]);
  }
  emit(event, data) {
    (this.#map.get(event)||[])
      .forEach(fn => fn(data));
  }
  off(event, fn) {
    this.#map.set(event,
      (this.#map.get(event)||[])
        .filter(f => f !== fn));
  }
  once(event, fn) {
    const wrap = (...args) => {
      fn(...args);
      this.off(event, wrap);
    };
    this.on(event, wrap);
  }
}
const bus = new EventBus();
bus.on("login", user => console.log(user));
bus.emit("login", { name: "Tom" });
#### ❓追问
Vue2的Dep和Watcher是哪种模式？答：观察者模式，Dep(Subject)直接持有Watcher(Observer)引用。Redux是哪种？答：发布订阅，通过store中转，组件和reducer互不知道对方。如何避免EventBus内存泄漏？答：组件销毁时必须off取消订阅，或使用once只触发一次。

---
## 4. 什么是策略模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 65

#### 🎯 本质
定义一系列算法，封装起来，使其可以互相替换。

#### 🧒 类比
用生活中的场景来类比理解这个概念，降低认知门槛。

#### 📊 图解

```
概念关系图示
```
const validator = {
  required: v => !!v || "必填",
  email: v => /@/.test(v) || "邮箱格式错误",
  min: (v, n) => v.length >= n || "最少"+n+"字符"
};
// 使用: validator[rule](value)
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
在前端框架中有哪些体现？

---
## 5. 单例模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 251

#### 🎯 本质
单例保证**一个类只有一个实例**并提供全局访问点。常用于全局状态、配置、连接池。

#### 🧒 类比
单例像国家的总统——只能有一个，全世界(全局)都能访问到。

#### 📊 图解
实现要点:
1.私有构造函数
2.静态实例变量
3.静态获取方法

JS实现:
闭包/模块/Symbol

应用:
全局状态/配置/日志/连接池
#### 🔧 详解
JS中闭包+立即执行函数可以创建私有变量。模块(ES Module)天然是单例(只执行一次)。Java用私有构造+静态方法。懒汉式(延迟创建)vs饿汉式(类加载时创建)。多线程需加锁(double-checked locking)。

#### 💻 代码
// JS闭包实现
const Singleton=(function(){
  let instance;
  function create(){return{data:'singleton'};}
  return {
    getInstance(){
      if(!instance) instance=create();
      return instance;
    }
  };
})();

// ES Module天然单例
// config.js
export const config={apiUrl:'...'}; // 只执行一次
#### ❓ 追问
单例有什么缺点？答：全局状态难以测试、隐藏依赖。什么场景必须用？答：数据库连接池、日志记录器。

---
## 6. 观察者模式vs发布订阅模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 252

#### 🎯 本质
**观察者**直接通知订阅者。**发布订阅**通过事件中心(调度站)解耦发布者和订阅者。

#### 🧒 类比
观察者像老师直接通知学生，发布订阅像通过公告栏——老师贴通知学生自己来看。

#### 📊 图解
观察者: Subject ←→ Observer
  直接通知(紧耦合)

发布订阅:
  Publisher → [Event Channel] → Subscriber
  通过调度站(松耦合)
#### 🔧 详解
观察者模式中Subject直接调用Observer的方法。发布订阅通过Event Bus/Channel解耦。Vue的响应式是观察者。EventEmitter是发布订阅。React的Context更像观察者。

#### 💻 代码
// 观察者
class Subject {
  observers=new Set();
  subscribe(fn){this.observers.add(fn);}
  notify(data){this.observers.forEach(fn=>fn(data));}
}

// 发布订阅(EventEmitter)
class EventBus {
  events={};
  on(event,fn){(this.events[event]||=[]).push(fn);}
  emit(event,data){(this.events[event]||[]).forEach(fn=>fn(data));}
  off(event,fn){this.events[event]=this.events[event]?.filter(f=>f!==fn);}
}
#### ❓ 追问
Vue响应式用的是哪种？答：观察者模式(dep→watcher)。Redux的subscribe是哪种？答：发布订阅(store.subscribe)。

---
## 7. 工厂模式？

> **难度**: easy | **分类**: 设计模式 | **ID**: 253

#### 🎯 本质
工厂模式**将对象的创建过程封装**，调用者不需要知道具体创建逻辑。

#### 🧒 类比
工厂像外卖平台——你说要什么(类型)，平台(工厂)负责创建，你不用知道厨房怎么做的。

#### 📊 图解
简单工厂: 一个函数根据参数创建
工厂方法: 子类决定创建哪个
抽象工厂: 创建一系列相关对象

优势: 解耦创建和使用
#### 🔧 详解
简单工厂通过switch/if返回不同实例。工厂方法定义接口让子类决定实例化哪个类。抽象工厂创建一族相关对象(如跨平台UI组件)。JS中常用简单工厂+闭包。

#### 💻 代码
// 简单工厂
function createButton(type){
  switch(type){
    case 'primary': return new Button('blue','click');
    case 'danger': return new Button('red','delete');
    default: return new Button('gray','default');
  }
}

// 工厂方法
class Dialog {
  createButton(){} // 子类实现
  render(){this.createButton().render();}
}
class WindowsDialog extends Dialog {
  createButton(){return new WindowsButton();}
}
#### ❓ 追问
工厂模式和构造函数的区别？答：工厂返回新对象不一定要new，构造函数必须new。

---
## 8. 策略模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 254

#### 🎯 本质
策略模式将**算法封装为可互换的策略对象**，使算法可以独立变化。

#### 🧒 类比
策略模式像出行策略——可以选开车/地铁/步行，换个策略不影响目的地。

#### 📊 图解
结构:
Context(上下文)
  → Strategy接口
    → StrategyA(具体策略)
    → StrategyB(具体策略)

应用:
表单验证/排序/折扣计算
#### 🔧 详解
将if/else或switch替换为策略映射表。每个策略实现同一接口(有同名方法)。运行时可以切换策略。开闭原则：新增策略不改旧代码。

#### 💻 代码
// 策略模式
const strategies={
  'S':salary=>salary*4,
  'A':salary=>salary*3,
  'B':salary=>salary*2
};
function calculateBonus(level,salary){
  return strategies[level](salary);
}

// 表单验证
const validators={
  required:v=>!!v||'必填',
  minLength:(v,n)=>v.length>=n||`最少${n}字符`,
  pattern:(v,r)=>r.test(v)||'格式错误'
};
#### ❓ 追问
策略模式和状态模式的区别？答：策略由客户端选择，状态由对象内部状态自动切换。

---
## 9. 装饰器模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 255

#### 🎯 本质
装饰器模式**动态给对象添加功能**而不修改原对象。比继承更灵活。

#### 🧒 类比
装饰器像给照片加滤镜——不改原照片但在上面叠加效果。

#### 📊 图解
结构:
Component(接口)
  → ConcreteComponent(原对象)
  → Decorator(装饰器基类)
    → ConcreteDecorator(具体装饰)

特点: 可叠加多个装饰器
#### 🔧 详解
装饰器和被装饰对象实现相同接口。装饰器内部持有被装饰对象的引用。可以层层嵌套装饰。JS中高阶函数/装饰器语法实现。React HOC本质是装饰器模式。

#### 💻 代码
// JS装饰器(高阶函数)
function withLog(fn){
  return function(...args){
    console.log('calling',fn.name,args);
    return fn.apply(this,args);
  };
}
function withTimer(fn){
  return function(...args){
    console.time(fn.name);
    const result=fn.apply(this,args);
    console.timeEnd(fn.name);
    return result;
  };
}
const enhanced=withTimer(withLog(calculate));
#### ❓ 追问
装饰器和继承的区别？答：装饰器动态组合不创建子类爆炸。

---
## 10. 代理模式？

> **难度**: easy | **分类**: 设计模式 | **ID**: 256

#### 🎯 本质
代理模式为对象提供**替身或占位符**控制对原对象的访问。虚拟代理/保护代理/缓存代理。

#### 🧒 类比
代理像经纪人——你不直接联系明星而是通过经纪人(代理)控制访问。

#### 📊 图解
代理类型:
虚拟代理: 延迟加载(图片懒加载)
保护代理: 权限控制
缓存代理: 缓存结果

ES6 Proxy: 元编程级别的代理
#### 🔧 详解
Proxy拦截对象操作(get/set/apply等)。虚拟代理在需要时才创建真实对象(图片懒加载)。保护代理检查权限后转发。缓存代理缓存方法结果。Vue 3的reactive用Proxy实现。

#### 💻 代码
// ES6 Proxy
const handler={
  get(target,prop){
    console.log('访问:',prop);
    return Reflect.get(target,prop);
  },
  set(target,prop,val){
    console.log('设置:',prop,val);
    return Reflect.set(target,prop,val);
  }
};
const proxy=new Proxy({name:'Tom'},handler);
proxy.name;  // 访问: name
proxy.age=25; // 设置: age 25
#### ❓ 追问
Proxy和Object.defineProperty的区别？答：Proxy拦截所有操作，defineProperty只能拦截已有属性。

---
## 11. 适配器模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 257

#### 🎯 本质
适配器模式将**不兼容的接口转换为兼容的接口**。让原本不能协作的类可以一起工作。

#### 🧒 类比
适配器像转接头——不同标准的插头通过适配器就能用。

#### 📊 图解
结构:
Target(目标接口)
  → Adapter(适配器)
    → Adaptee(被适配者)

场景:
第三方库接口统一
旧接口兼容新接口
#### 🔧 详解
适配器包装已有对象转换接口。不修改原有代码只做转换。常见场景：统一多个第三方库的接口、旧API兼容新API、数据格式转换。

#### 💻 代码
// 适配器模式
class OldAPI {
  getData(){return{name:'Tom',years:25};}
}
class Adapter {
  constructor(oldAPI){this.api=oldAPI;}
  getUser(){
    const d=this.api.getData();
    return {name:d.name,age:d.years}; // 转换接口
  }
}
const adapter=new Adapter(new OldAPI());
adapter.getUser(); // {name:'Tom',age:25}
#### ❓ 追问
适配器和装饰器的区别？答：适配器转换接口，装饰器增强功能不改变接口。

---
## 12. 命令模式？

> **难度**: hard | **分类**: 设计模式 | **ID**: 258

#### 🎯 本质
命令模式将**请求封装为对象**，支持撤销/重做、队列、日志等操作。

#### 🧒 类比
命令模式像遥控器——每个按钮(命令)封装一个操作，可以撤销、排队执行。

#### 📊 图解
结构:
Invoker(调用者) → Command(命令接口)
  → ConcreteCommand → Receiver

应用:
撤销/重做
宏命令(组合)
命令队列
#### 🔧 详解
将操作封装为对象(命令)，调用者不需要知道接收者的具体操作。命令对象记录执行和撤销方法。可以组合多个命令(宏命令)。可以实现命令队列(异步执行)、命令日志(持久化恢复)。

#### 💻 代码
// 命令模式
class Command {
  execute(){}
  undo(){}
}
class AddTextCommand extends Command {
  constructor(editor,text){super();this.editor=editor;this.text=text;}
  execute(){this.prev=this.editor.text;this.editor.text+=this.text;}
  undo(){this.editor.text=this.prev;}
}
class Editor {
  text=''; history=[];
  execute(cmd){cmd.execute();this.history.push(cmd);}
  undo(){this.history.pop()?.undo();}
}
#### ❓ 追问
宏命令是什么？答：组合多个命令为一个命令一次性执行。命令队列的应用？答：任务调度、动画队列。

---
## 13. 迭代器模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 259

#### 🎯 本质
迭代器提供**顺序访问集合元素**的方法而不暴露内部结构。ES6的Iterator/Generator是内置实现。

#### 🧒 类比
迭代器像电视遥控器——不需要知道频道列表怎么存的，按上下键逐个浏览。

#### 📊 图解
接口:
  next() → {value, done}

ES6:
  for...of 自动调用 [Symbol.iterator]()
  Generator: function* yield

应用:
  遍历任意集合
  惰性求值
#### 🔧 详解
迭代器协议要求实现next()返回{value,done}。可迭代协议要求实现[Symbol.iterator]()返回迭代器。Generator函数是创建迭代器的简便方式。可以无限迭代(惰性)。Array/Map/Set/String都内置迭代器。

#### 💻 代码
// 自定义迭代器
const range={
  from:1, to:5,
  [Symbol.iterator](){
    return {
      current:this.from,
      last:this.to,
      next(){
        if(this.current
#### ❓ 追问
什么是惰性求值？答：只在需要时计算下一个值(无限序列也可以处理)。

---
## 14. 状态模式？

> **难度**: medium | **分类**: 设计模式 | **ID**: 260

#### 🎯 本质
状态模式允许对象**在内部状态改变时改变行为**，好像改变了类一样。

#### 🧒 类比
状态模式像自动售货机——投币状态/出货状态/缺货状态，不同状态不同行为。

#### 📊 图解
结构:
Context → State接口
  → StateA(具体状态)
  → StateB(具体状态)

vs 策略模式:
  状态自动切换
  策略由外部选择
#### 🔧 详解
把大量if/else状态判断替换为独立的状态类。每个状态类实现该状态下所有行为。状态转换由状态类自己或上下文管理。订单状态(待付款/已付款/已发货)是典型应用。

#### 💻 代码
// 状态模式
class Order {
  state=new PendingState();
  setState(s){this.state=s;}
  pay(){this.state.pay(this);}
  ship(){this.state.ship(this);}
}
class PendingState {
  pay(order){order.setState(new PaidState());}
  ship(){throw new Error('未付款不能发货');}
}
class PaidState {
  pay(){throw new Error('已付款');}
  ship(order){order.setState(new ShippedState());}
}
#### ❓ 追问
状态机和状态模式的区别？答：状态机是数学模型(有限状态自动机)，状态模式是实现方式之一。

---
## 15. 模块模式？

> **难度**: easy | **分类**: 设计模式 | **ID**: 261

#### 🎯 本质
模块模式通过**闭包封装私有成员**，暴露公共API。ES Module是语言级模块化方案。

#### 🧒 类比
模块像独立房间——私有物品(闭包内)外部看不到，只开放门口的接口(公共API)。

#### 📊 图解
模块化演进:
1.立即执行函数(IIFE)
2.CommonJS(require/exports)
3.AMD(define)
4.ES Module(import/export)

ES Module:
  静态分析/Tree-shaking/异步加载
#### 🔧 详解
IIFE创建闭包封装私有变量和方法。CommonJS运行时加载(同步)。ES Module编译时静态分析(异步)。ES Module支持Tree-shaking。import是只读引用(不能修改导出值)。

#### 💻 代码
// ES Module
// math.js
export const add=(a,b)=>a+b;
export default class Calculator{}

// app.js
import Calculator,{add} from './math.js';

// 动态import
const module=await import('./heavy.js');
#### ❓ 追问
CommonJS和ES Module的区别？答：CJS运行时加载/同步/值拷贝，ESM编译时/异步/只读引用。

---
## 16. 中介者模式？

> **难度**: hard | **分类**: 设计模式 | **ID**: 262

#### 🎯 本质
中介者模式用一个**中介对象封装一组对象的交互**，使对象不需要显式引用彼此(解耦)。

#### 🧒 类比
中介者像空中交通管制——飞机(对象)不直接通信，全通过塔台(中介)协调。

#### 📊 图解
结构:
Mediator(中介者接口)
  → ConcreteMediator
Colleague(同事类)
  → ColleagueA
  → ColleagueB

应用: 聊天室/表单联动/事件总线
#### 🔧 详解
对象之间不直接通信通过中介者转发。减少对象间的依赖关系(网状→星状)。但中介者本身可能变得复杂。应用：聊天室(服务器是中介)、表单验证联动、UI组件通信。

#### 💻 代码
// 聊天室(中介者)
class ChatRoom {
  users=new Map();
  join(user){this.users.set(user.name,user);}
  send(msg,from,to){
    if(to) this.users.get(to)?.receive(msg,from);
    else this.users.forEach(u=>{if(u.name!==from) u.receive(msg,from);});
  }
}
class User {
  constructor(name,room){this.name=name;this.room=room;room.join(this);}
  send(msg,to){this.room.send(msg,this.name,to);}
  receive(msg,from){console.log(`${from}: ${msg}`);}
}
#### ❓ 追问
中介者和观察者的区别？答：中介者双向通信解耦，观察者单向通知。中介者的缺点？答：中介者自身可能成为上帝对象。

---
## 17. 前端常用设计模式总结？

> **难度**: medium | **分类**: 设计模式 | **ID**: 263

#### 🎯 本质
前端常用：**单例、观察者、策略、装饰器、代理、工厂、发布订阅**等。框架设计中随处可见。

#### 🧒 类比
设计模式像菜谱——不用每道菜都创新，经典搭配(模式)已经过验证。

#### 📊 图解
前端常用模式:
1.观察者: Vue响应式/EventEmitter
2.发布订阅: Redux/EventBus
3.单例: 全局状态/配置
4.策略: 表单验证/折扣计算
5.装饰器: HOC/装饰器语法
6.代理: ES6 Proxy/Vue3
7.工厂: React.createElement
#### 🔧 详解
React中：HOC(装饰器)、Hooks(策略)、Context(观察者)。Vue中：Proxy(代理模式)、响应式(观察者)、组件(组合模式)。设计模式不是生搬硬套而是解决问题的思路。遵循SOLID原则。

#### 💻 代码
// React中的模式
// 装饰器模式: HOC
const withAuth=Component=>props=>
  isAuth()?:;

// 策略模式: Hooks
const strategies={
  api:useApiData,
  local:useLocalStorage,
  mock:useMockData
};
const useData=strategies[source];
#### ❓ 追问
什么是SOLID原则？答：单一职责/开闭/里氏替换/接口隔离/依赖反转。

---
