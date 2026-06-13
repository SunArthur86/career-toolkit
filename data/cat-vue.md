# Vue

> 共 17 题

## 1. Composition API vs Options API？

> **难度**: medium | **分类**: Vue | **ID**: 27

#### 🎯 本质
**Options API** 按选项类型（data/methods/computed/watch）组织代码，**Composition API** 按逻辑功能组织代码。Composition API 是 Vue 3 的核心特性。

#### 🧒 类比
Options API 像按物品类型整理（所有衣服放一起、所有书放一起），Composition API 像按场景整理（游泳装备放一袋、登山装备放一袋）。

#### 📊 图解
Options API (按选项类型):
export default {
  data() { return { count: 0, user: null }; },
  methods: { increment(){}, fetchUser(){} },
  computed: { doubleCount(){} },
  watch: { count(){} }
  // 同一功能的代码分散在各个选项中
}

Composition API (按逻辑功能):
setup() {
  // 计数功能(全部聚合)
  const { count, increment, doubleCount } = useCounter();
  // 用户功能(全部聚合)
  const { user, fetchUser } = useUser();
  return { count, user, ... };
}
#### 🔧 详解
Composition API 的优势：**逻辑聚合**（相关代码不再分散）、**更好的类型推导**（TS友好）、**复用性强**（composables 替代 mixins，避免命名冲突和数据来源不清）。

#### 💻 代码
// 可复用的composable
function useCounter(initial = 0) {
  const count = ref(initial);
  const double = computed(() => count.value * 2);
  function increment() { count.value++; }
  watch(count, (val) => {
    console.log("count changed:", val);
  });
  return { count, double, increment };
}
// 在组件中使用
export default {
  setup() {
    const { count, double, increment } = useCounter();
    return { count, double, increment };
  }
}
#### ❓ 追问
mixins 有什么缺点？答：命名冲突、数据来源不透明、类型推导困难。composables 通过显式传参解决这些问题。

---
## 2. Vue响应式原理？

> **难度**: medium | **分类**: Vue | **ID**: 28

#### 🎯 本质
Vue 的响应式系统通过**劫持数据访问和修改**来实现数据驱动视图更新。Vue2 用 Object.defineProperty，Vue3 改用 Proxy。

#### 🧒 类比
响应式像给每个数据配了一个监控摄像头——谁读取了数据（依赖收集），数据变了就通知谁（派发更新）。

#### 📊 图解
Vue2: Object.defineProperty
  ✅ 能检测属性读取和修改
  ❌ 无法检测新增/删除属性
  ❌ 无法检测数组下标修改
  (用$set/$delete弥补)

Vue3: Proxy
  ✅ 能检测所有操作(增删改查)
  ✅ 惰性响应式(按需代理子对象)
  ✅ 性能更好(一次性代理整个对象)
  ✅ 原生支持Map/Set/WeakMap
#### 🔧 详解
核心流程：**依赖收集**（get时收集当前Watcher/Effect）→ **派发更新**（set时通知所有依赖执行更新）。Vue3 用 effect + track + trigger 替代 Watcher，配合 Proxy 的 get/set handler 实现。深层对象采用**惰性代理**（访问子属性时才代理）。

#### 💻 代码
// Vue3 简化原理
const reactive = (target) => {
  return new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key); // 收集依赖
      const result = Reflect.get(obj, key, receiver);
      return typeof result === "object"
        ? reactive(result) // 深层惰性代理
        : result;
    },
    set(obj, key, val, receiver) {
      const result = Reflect.set(obj, key, val, receiver);
      trigger(obj, key); // 触发更新
      return result;
    }
  });
};
#### ❓ 追问
ref 和 reactive 的区别？答：ref 用于基本类型（通过.value访问），reactive 用于对象类型（直接访问属性）。ref 底层也用Proxy（对象值时）或class getter/setter。

---
## 3. Vue的响应式原理？

> **难度**: easy | **分类**: Vue | **ID**: 145

#### 🎯 本质
Vue 3用**Proxy**拦截对象操作实现响应式。Vue 2用Object.defineProperty劫持getter/setter。

#### 🧒 类比
Proxy像在门口装监控——进出都要经过拦截。defineProperty像给每个房间装锁——逐个处理。

#### 📊 图解
Vue2: Object.defineProperty
  - 逐个属性劫持
  - 无法检测新增属性
Vue3: Proxy
  - 整体代理
  - 能检测新增/删除
#### 🔧 详解
Vue 2的defineProperty需要递归遍历对象的每个属性。不能检测属性新增/删除(需$set)。Vue 3的Proxy代理整个对象，能检测所有操作。响应式系统通过track收集依赖，trigger触发更新。

#### 💻 代码
// Vue 3 响应式
import {reactive,effect} from 'vue';
const state=reactive({count:0});
effect(()=>console.log(state.count)); // 自动追踪
state.count++; // 触发effect重新执行

// Vue 2
defineProperty(obj,'name',{
  get(){/*收集依赖*/},
  set(val){/*通知更新*/}
});
#### ❓ 追问
Vue 3为什么选Proxy？答：能拦截所有操作(增删/遍历等)。Vue 2的$set原理？答：手动调用defineProperty+触发更新。

---
## 4. Vue组合式API vs 选项式API？

> **难度**: medium | **分类**: Vue | **ID**: 146

#### 🎯 本质
**选项式API**按选项(data/methods/computed)组织代码。**组合式API**用setup函数按逻辑关注点组织代码。

#### 🧒 类比
选项式像按部门分类(财务部、市场部)，组合式像按项目分类(项目A、项目B各包含财务和市场)。

#### 📊 图解
选项式:
  data(){return{...}}
  methods:{...}
  computed:{...}
组合式:
  setup(){
    const x=ref(0);
    const double=computed(()=>x.value*2);
    return {x,double};
  }
#### 🔧 详解
选项式API更适合简单组件。组合式API在逻辑复杂时更好维护，相关代码聚合而非分散在多个选项。组合式API复用逻辑通过组合函数(composables)而非mixins。

#### 💻 代码
// 选项式
export default{
  data(){return{count:0}},
  computed:{double(){return this.count*2}},
  methods:{increment(){this.count++}}
}
// 组合式
export default{
  setup(){
    const count=ref(0);
    const double=computed(()=>count.value*2);
    const increment=()=>count.value++;
    return {count,double,increment};
  }
}
#### ❓ 追问
什么是composables？答：可复用的组合函数，类似React Hooks。script setup语法糖的作用？答：简化setup写法自动暴露变量。

---
## 5. Vue的computed和watch？

> **难度**: medium | **分类**: Vue | **ID**: 147

#### 🎯 本质
**computed**声明计算属性有缓存。**watch**观察数据变化执行副作用。watchEffect自动收集依赖。

#### 🧒 类比
computed像缓存备忘录(同样的输入直接返回缓存结果)，watch像监控摄像头(发生变化时执行动作)。

#### 📊 图解
computed: 有缓存,依赖不变不重算
watch: 无缓存,变化时执行副作用
watchEffect: 自动收集依赖

computed → 值
watch → 副作用
#### 🔧 详解
computed基于依赖缓存结果，只有依赖变化才重新计算。watch需要显式指定监听源。watchEffect自动追踪依赖。deep:true深度监听对象。immediate:true立即执行。

#### 💻 代码
const count=ref(0);
const double=computed(()=>count.value*2); // 有缓存
watch(count,(newVal,oldVal)=>{
  console.log('changed',oldVal,'→',newVal);
},{deep:true,immediate:false});
watchEffect(()=>console.log(count.value)); // 自动追踪
#### ❓ 追问
computed可以setter吗？答：可以传get/set对象。watch的deep性能问题？答：深度监听大对象开销大，尽量监听具体属性。

---
## 6. Vue组件生命周期？

> **难度**: easy | **分类**: Vue | **ID**: 148

#### 🎯 本质
生命周期钩子是组件**从创建到销毁**过程中的关键节点，允许在不同阶段执行代码。

#### 🧒 类比
像人的一生——出生(created)→上学(mounted)→工作(updated)→退休(unmounted)。

#### 📊 图解
Vue3组合式:
  onBeforeMount → onMounted
  onBeforeUpdate → onUpdated
  onBeforeUnmount → onUnmounted
Vue3新增: onRenderTracked/Triggered
#### 🔧 详解
setup()在beforeCreate之前执行。onMounted中可访问DOM。onUnmounted清理副作用(定时器、事件监听)。KeepAlive的组件有onActivated/onDeactivated。

#### 💻 代码
import {onMounted,onUnmounted} from 'vue';
setup(){
  let timer;
  onMounted(()=>{
    timer=setInterval(()=>{},1000);
  });
  onUnmounted(()=>{
    clearInterval(timer);
  });
}
#### ❓ 追问
父子组件生命周期顺序？答：父beforeMount→子created/mounted→父mounted。KeepAlive是什么？答：缓存不活动的组件避免重复渲染。

---
## 7. Vue Router路由守卫？

> **难度**: medium | **分类**: Vue | **ID**: 149

#### 🎯 本质
路由守卫在**路由跳转过程中**拦截和控制导航，用于权限验证、数据预加载等。

#### 🧒 类比
像地铁站的闸机——刷卡(验证)通过才放行，否则拒绝或重定向。

#### 📊 图解
全局: router.beforeEach/afterEach
路由: beforeEnter
组件: onBeforeRouteEnter/Update/Leave

参数: to,from,next(Vue3可return false)
#### 🔧 详解
beforeEach全局前置守卫最常用(登录验证)。路由独享守卫beforeEnter写在路由配置中。组件内守卫可访问组件实例。next()在Vue3中可省略用return替代。

#### 💻 代码
router.beforeEach((to,from)=>{
  if(to.meta.requiresAuth && !isLoggedIn()){
    return '/login';
  }
});
// 路由独享
{path:'/admin',beforeEnter:()=>hasRole('admin'),component:Admin}
// 组件内
onBeforeRouteLeave((to,from)=>{
  if(hasUnsavedChanges()) return confirm('确定离开?');
})
#### ❓ 追问
完整的导航解析流程？答：beforeEach→beforeRouteUpdate→beforeEnter→组件内守卫→afterEach。

---
## 8. Pinia状态管理？

> **难度**: medium | **分类**: Vue | **ID**: 150

#### 🎯 本质
Pinia是Vue官方推荐的**状态管理库**，比Vuex更轻量：去掉了mutations、支持组合式API、完整TypeScript支持。

#### 🧒 类比
Pinia像公司共享文档——所有部门(组件)都能读写同一份最新数据。Vuex像旧版需要审批流程(mutations)。

#### 📊 图解
Pinia vs Vuex:
- 无mutations(直接改state)
- 支持Setup/Option Store
- 完整TS推导
- 支持多个store
- 轻量(~1KB)
#### 🔧 详解
Pinia通过defineStore定义store。state是响应式数据。getters是计算属性。actions处理异步。Store之间可以直接互相引用。

#### 💻 代码
import {defineStore} from 'pinia';
const useUserStore=defineStore('user',()=>{
  const name=ref('Tom');
  const upperName=computed(()=>name.value.toUpperCase());
  async function fetchUser(){
    name.value=await api.getUser();
  }
  return {name,upperName,fetchUser};
});
#### ❓ 追问
Pinia和Vuex的核心区别？答：无mutations、更好的TS支持、支持组合式写法。如何在组件外使用store？答：pinia实例传给app后即可使用。

---
## 9. Vue的v-model原理？

> **难度**: medium | **分类**: Vue | **ID**: 151

#### 🎯 本质
v-model是**:value+@input**的语法糖。在组件上默认绑定modelValue prop+update:modelValue事件。

#### 🧒 类比
v-model像双向对讲机——说话(改变值)对方立刻听到(更新状态)。

#### 📊 图解
表单: v-model = :value + @input
组件: v-model = :modelValue + @update:modelValue
自定义: modelValue/props + emit('update:modelValue')
#### 🔧 详解
在表单元素上自动根据类型选择属性和事件(text/input、checkbox/checked、select/value)。组件上可自定义prop名：v-model:title='title'。Vue 3支持多个v-model。

#### 💻 代码
// 组件上使用v-model

// 等价于

// 组件实现
app.component('ModelComp',{
  props:['modelValue'],
  emits:['update:modelValue'],
  setup(props,{emit}){
    return ()=>h('input',{
      value:props.modelValue,
      onInput:e=>emit('update:modelValue',e.target.value)
    });
  }
})
#### ❓ 追问
如何实现自定义v-model？答：定义modelValue prop和emit update:modelValue。多个v-model怎么实现？答：v-model:name='n' v-model:age='a'。

---
## 10. Vue虚拟DOM和Diff算法？

> **难度**: hard | **分类**: Vue | **ID**: 152

#### 🎯 本质
虚拟DOM是**JS对象描述的DOM树**。Diff算法对比新旧虚拟DOM找出最小变更。Vue采用**双端对比+最长递增子序列**优化。

#### 🧒 类比
虚拟DOM像设计图纸(改图纸比拆房子便宜)，Diff像对比新旧图纸找最小改动。

#### 📊 图解
Diff策略：
1.同层比较(不跨层)
2.类型相同才复用
3.key标识节点
4.双端对比(head/head,tail/tail)
5.最长递增子序列最小化移动
#### 🔧 详解
Vue 3的Diff：从头尾双端对比，相同则跳过。剩余节点用key建立Map。通过最长递增子序列算法最小化DOM移动。静态提升(PatchFlag)跳过静态节点的diff。Block Tree收集动态节点。

#### 💻 代码
// 静态提升：静态节点只创建一次
const _hoisted=createVNode('div',null,'静态')
function render(){
  return createVNode('div',null,[_hoisted, createVNode('span',null,ctx.msg)])
}
// PatchFlag: 编译时标记动态内容
// TEXT=1, CLASS=2, PROPS=8, ...
#### ❓ 追问
Vue 3 Diff和React Diff的区别？答：Vue双端+LIS，React右移遍历。什么是Block Tree？答：将模板按v-if/v-for分割为Block减少diff范围。

---
## 11. Vue的指令有哪些？

> **难度**: easy | **分类**: Vue | **ID**: 153

#### 🎯 本质
Vue提供内置指令：**v-if/v-show**条件渲染、**v-for**列表、**v-model**双向绑定、**v-on**事件、**v-bind**属性绑定。

#### 🧒 类比
指令像给元素贴的命令标签——告诉Vue怎么处理这个元素。

#### 📊 图解
v-if: 条件渲染(销毁/创建DOM)
v-show: display切换(保留DOM)
v-for: 列表渲染(需key)
v-model: 双向绑定
v-on(@): 事件监听
v-bind(:): 属性绑定
v-slot(#): 插槽
#### 🔧 详解
v-if是真正的条件渲染有更高的切换开销。v-show只是CSS切换有更高的初始渲染开销。频繁切换用v-show，条件很少变用v-if。自定义指令用directive注册。

#### 💻 代码
// 内置指令
条件渲染
显示隐藏
{{item.name}}

点击

// 自定义指令
app.directive('focus',{
  mounted(el){el.focus();}
});
#### ❓ 追问
v-if和v-show的区别？答：v-if销毁/创建DOM，v-show切换display。v-for和v-if能一起用吗？答：不推荐，v-for优先级更高。

---
## 12. Vue插槽slot？

> **难度**: medium | **分类**: Vue | **ID**: 154

#### 🎯 本质
插槽允许**父组件向子组件传递模板内容**。默认插槽、具名插槽(name)、作用域插槽(传递数据给父)。

#### 🧒 类比
插槽像模板填空——子组件定义框架(空位)，父组件填入具体内容。

#### 📊 图解
默认: 
具名: 
作用域: 

使用:
默认: 内容
具名: ...
作用域: ...
#### 🔧 详解
默认插槽接收未匹配的内容。具名插槽用name区分多个出口。作用域插槽让子组件向插槽内容暴露数据。编译作用域：父模板中只能访问父作用域数据。

#### 💻 代码
// 子组件

  
    
    
  

// 父组件

  标题
  
    {{item.name}}

  

#### ❓ 追问
作用域插槽的应用场景？答：表格组件自定义列渲染、列表组件自定义项模板。

---
## 13. Vue的provide/inject？

> **难度**: medium | **分类**: Vue | **ID**: 155

#### 🎯 本质
provide/inject实现**祖先→后代跨层级传数据**，不需要逐层传递props(解决prop drilling)。

#### 🧒 类比
provide像在楼层间装管道——顶层注入水，任何楼层都能接到，不需要每层传递。

#### 📊 图解
祖先: provide('key',value)
后代: const val=inject('key',defaultValue)

⚠️ 默认不是响应式的
响应式: provide('key',reactive({}))
#### 🔧 详解
provide在祖先组件声明数据。inject在后代组件获取数据。默认不是响应式，需传reactive/ref对象。Symbol作为key避免冲突。应用级provide在整个应用可用。

#### 💻 代码
// 祖先
import {provide,reactive} from 'vue';
setup(){
  const theme=reactive({mode:'dark',color:'#333'});
  provide('theme',theme);
}
// 后代
import {inject} from 'vue';
setup(){
  const theme=inject('theme',{mode:'light'});
  return {theme};
}
#### ❓ 追问
provide/inject的响应式怎么保证？答：provide一个reactive/ref对象。和Vuex/Pinia的区别？答：provide/inject是组件级，适合简单场景。

---
## 14. Vue 3编译优化？

> **难度**: hard | **分类**: Vue | **ID**: 156

#### 🎯 本质
Vue 3编译器生成**优化过的渲染函数**：静态提升、PatchFlag标记、Block Tree收窄diff范围、缓存事件处理器。

#### 🧒 类比
编译器像智能翻译——不只是直译(生成渲染函数)，还优化翻译结果(标记哪些是动态的哪些不用管)。

#### 📊 图解
编译优化：
1.静态提升 → 静态节点只创建一次
2.PatchFlag → 标记动态部分类型
3.Block Tree → v-if/v-for分割Block
4.事件缓存 → 避免重新创建事件处理
5.内联函数缓存 → 插槽优化
#### 🔧 详解
PatchFlag用位标记(TEXT=1,CLASS=2,STYLE=4,PROPS=8...)。diff时只处理标记的部分。Block Tree将模板按结构指令分割，每个Block独立diff。Vue 3的Template编译比手写render函数更快。

#### 💻 代码
// 编译前
静态{{msg}}

// 编译后(简化)
import {createVNode as _c} from 'vue'
const _hoisted=_c('span',null,'静态')
function render(_ctx){
  return _c('div',null,[
    _hoisted,
    _c('p',null,_ctx.msg,1/*TEXT*/)
  ])
}
#### ❓ 追问
什么是Tree-shaking友好？答：Vue 3按需导入API，未使用的API不会打包。

---
## 15. Vue的nextTick？

> **难度**: medium | **分类**: Vue | **ID**: 157

#### 🎯 本质
nextTick在**下次DOM更新循环后**执行回调，确保能获取到更新后的DOM。

#### 🧒 类比
像等油漆干了再贴壁纸——等DOM更新完成后再操作DOM。

#### 📊 图解
nextTick时机：
1.数据修改
2.Vue异步更新队列(去重)
3.微任务中更新DOM
4.nextTick回调执行

返回Promise
#### 🔧 详解
Vue的DOM更新是异步的(批量更新)。修改数据后立即读取DOM可能拿到旧值。nextTick等DOM更新后执行。Vue内部用Promise.then或MutationObserver实现。

#### 💻 代码
import {nextTick} from 'vue';
const count=ref(0);
count.value++;
// DOM还没更新
console.log(document.getElementById('count').textContent); // 旧值
await nextTick();
console.log(document.getElementById('count').textContent); // 新值
#### ❓ 追问
nextTick原理？答：利用微任务(Promise.then)在DOM更新后执行。为什么DOM更新是异步的？答：批量更新避免频繁操作DOM。

---
## 16. Vue组件通信方式？

> **难度**: easy | **分类**: Vue | **ID**: 158

#### 🎯 本质
Vue组件通信：**props/emit**(父子)、**provide/inject**(跨层级)、**Pinia**(全局状态)、**事件总线**(任意组件)、**$refs**(父访问子)。

#### 🧒 类比
像团队沟通方式——面对面(父子props)、广播(provide)、公告板(Pinia)、即时通讯(事件总线)。

#### 📊 图解
父子: props↓ emit↑
跨层级: provide/inject
全局: Pinia/Vuex
任意: mitt事件总线
父访问子: ref+defineExpose
#### 🔧 详解
props单向数据流(子组件不能修改)。emit触发父组件事件。provide/inject适合深层嵌套。Pinia管理全局状态。defineExpose暴露方法给父组件ref调用。

#### 💻 代码
// 父→子 props

// 子→父 emit
const emit=defineEmits(['update']);
emit('update',newValue);
// 父调子方法
const childRef=ref();
childRef.value.someMethod(); // 需defineExpose暴露
#### ❓ 追问
Vue 3移除了$on/$off？答：是的，用mitt库替代事件总线。

---
## 17. Vue 3 Teleport和Suspense？

> **难度**: medium | **分类**: Vue | **ID**: 159

#### 🎯 本质
**Teleport**将组件渲染到DOM其他位置(如弹窗到body)。**Suspense**等待异步组件加载完成前显示fallback。

#### 🧒 类比
Teleport像传送门(把元素送到DOM另一处)，Suspense像加载动画(等待异步内容准备好)。

#### 📊 图解
Teleport:

  ...

Suspense:

  
  

#### 🔧 详解
Teleport的to属性指定目标容器。disabled属性可禁用传送。Suspense配合defineAsyncComponent或async setup使用。Suspense目前仍是实验性特性。

#### 💻 代码

  弹窗内容

  
    
  
  
    
  

#### ❓ 追问
Teleport和React Portal的区别？答：概念相同，Vue用to属性，React用createPortal函数。

---
