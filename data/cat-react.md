# React

> 共 18 题

## 1. React Fiber架构？

> **难度**: medium | **分类**: React | **ID**: 23

#### 🎯 本质
Fiber 是 React 16 引入的**新协调引擎**，将递归渲染改为**可中断的增量式渲染**。核心是时间切片+优先级调度，让渲染不阻塞用户交互。

#### 🧒 类比
旧版 React 像一口气跑完马拉松（不能停），Fiber 像跑一段歇一下（可以暂停处理紧急事），最后也能跑完。

#### 📊 图解
Fiber核心机制:
双缓冲: current树(当前屏幕) + workInProgress树(正在构建)

工作循环:
while(还有工作 && 没到截止时间) {
  执行一个Fiber单元;
}
if(到了截止时间) {
  让出主线程 → 下一帧继续;
}

优先级(lane模型):
Sync > Input > Animation > Lazy
高优先级可打断低优先级任务
#### 🔧 详解
每个 Fiber 节点是一个链表结构（child/sibling/return），支持暂停和恢复。render 阶段（可中断）构建 workInProgress 树，commit 阶段（不可中断）同步更新DOM。优先级调度确保用户交互（输入、点击）优先于低优先级渲染。

#### 💻 代码
// Fiber节点简化结构
const fiber = {
  type: "div",           // 元素类型
  props: { children },   // 属性
  stateNode: dom,        // 真实DOM
  child: childFiber,     // 第一个子节点
  sibling: nextFiber,    // 兄弟节点
  return: parentFiber,   // 父节点
  alternate: currentFiber // 双缓冲对应节点
};
// 链表结构使遍历可暂停可恢复
#### ❓ 追问
Fiber 之前 React 的渲染有什么问题？答：递归不可中断，大量组件更新时阻塞主线程，造成掉帧卡顿。

---
## 2. React常用Hooks？

> **难度**: easy | **分类**: React | **ID**: 24

#### 🎯 本质
Hooks 是 React 16.8 引入的函数，让**函数组件**也能使用状态和副作用等类组件能力。本质是基于**调用顺序**建立的链表结构。

#### 🧒 类比
Hooks 像给函数组件装"外挂"——useState 装上了记忆（记住状态），useEffect 装上了定时器（自动执行/清理），useRef 装上了安全箱（存值不改渲染）。

#### 📊 图解
常用Hooks:
useState(initial)      → 状态读写 [val, setter]
useEffect(fn, deps)    → 副作用(请求/订阅/DOM)
useRef(initial)        → 持久引用(不改渲染)
useMemo(fn, deps)      → 计算结果缓存
useCallback(fn, deps)  → 函数引用缓存
useContext(Context)     → 跨组件共享状态
useReducer(reducer, init) → 复杂状态逻辑

规则:
① 只在函数组件/自定义Hook中调用
② 不能在条件/循环/嵌套函数中调用
③ 依赖数组控制执行时机
#### 🔧 详解
Hooks 链表按调用顺序存储，条件语句会导致顺序错乱。useEffect 返回函数是清理函数（卸载时执行）。useMemo 缓存计算值避免重渲染时重复计算，useCallback 缓存函数避免子组件不必要的重渲染。

#### 💻 代码
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const inputRef = useRef(null);
  useEffect(() => {
    fetch("/api/user/" + userId)
      .then(r => r.json())
      .then(setUser);
    return () => console.log("清理"); // 卸载时
  }, [userId]); // userId变化才重新执行
  const fullName = useMemo(
    () => user.first + " " + user.last, [user]
  );
  return {fullName};
}
#### ❓ 追问
useEffect 和 useLayoutEffect 的区别？答：useLayoutEffect 在DOM更新后同步执行（阻塞渲染），useEffect 异步执行（不阻塞）。

---
## 3. 虚拟DOM和Diff算法？

> **难度**: medium | **分类**: React | **ID**: 25

#### 🎯 本质
虚拟DOM是JS对象描述UI，通过Diff算法最小化真实DOM操作。

#### 🧒 类比
虚拟DOM像建筑图纸，Diff像对比新旧图纸找差异，只修改变化的部分。

#### 📊 Diff三策略
1.Tree策略: 只比较同一层节点(不跨层)
2.Component策略: 同类型组件→继续diff子树
                  不同类型→直接替换整棵子树
3.Element策略: 同key→复用节点(更新属性)
               不同key→卸载旧节点+创建新节点
#### 💡 Key的重要性
无key → 按顺序diff(可能错位,低效)
有key → 按key匹配(精准复用,高效)
⚠️ 不要用index做key(列表增删会出问题)
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
React 18有什么新变化？

---
## 4. React状态管理选型？

> **难度**: hard | **分类**: React | **ID**: 26

#### 🎯 本质
状态管理解决的是**跨组件数据共享**问题。选型取决于项目规模、复杂度和团队偏好。没有最好，只有最合适。

#### 🧒 类比
小型项目像小卖部（记账本够用），中型项目像超市（需要货架管理），大型项目像购物中心（需要中央仓储系统）。

#### 📊 图解
选型推荐:
小型项目:
  Context + useReducer
  (内置,零依赖,够用)

中型项目:
  Zustand
  (轻量~1KB,API简洁,无boilerplate)

大型项目:
  Redux Toolkit (RTK)
  (生态成熟,DevTools强大,中间件丰富)

其他:
  Jotai(原子化) | Recoil(Facebook)
  MobX(响应式) | Valtio(Proxy)
#### 🔧 详解
**Context**：适合主题、语言等低频更新场景，高频更新有性能问题。**Zustand**：基于订阅模式，组件只订阅需要的slice，性能好。**Redux Toolkit**：内置immer（不可变更新）、createSlice减少样板代码、RTK Query处理异步。**Jotai**：原子化状态，从下到上组合。

#### 💻 代码
// Zustand示例
import { create } from "zustand";
const useStore = create((set) => ({
  count: 0,
  increment: () =>
    set((state) => ({ count: state.count + 1 })),
}));
function Counter() {
  const { count, increment } = useStore();
  return {count};
}

// Redux Toolkit示例
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
  },
});
#### ❓ 追问
Redux 的中间件机制？答：compose链式包裹dispatch函数，如redux-thunk处理异步，redux-logger记录日志。

---
## 5. React组件通信方式？

> **难度**: easy | **分类**: React | **ID**: 131

#### 🎯 本质
主要有**props传递**(父→子)、**回调函数**(子→父)、**Context**(跨层级)、**状态管理库**(全局)。

#### 🧒 类比
像公司沟通——上级给下级发指令(props)，下级向上汇报(回调)，全公司公告(Context)。

#### 📊 图解
父→子: props
子→父: 回调函数
跨层级: Context API
全局: Redux/Zustand
#### 🔧 详解
props是最基本的单向数据流。回调函数通过props传递函数。Context适合主题/语言等全局数据。状态管理库适合复杂交互数据。ref也可实现父调用子方法。

#### 💻 代码
function Parent(){
  return {}}/>;
}
function Child({name,onDone}){
  return onDone(name)}>完成;
}
// Context
const ThemeCtx=createContext('light');
function DeepChild(){
  const theme=useContext(ThemeCtx);
}
#### ❓ 追问
useImperativeHandle的作用？答：配合forwardRef暴露指定方法。Context性能问题？答：拆分多个Context或用useMemo。

---
## 6. React.memo和性能优化？

> **难度**: medium | **分类**: React | **ID**: 132

#### 🎯 本质
核心思路是**减少不必要的重渲染**。React.memo浅比较props，useMemo缓存计算值，useCallback缓存函数引用。

#### 🧒 类比
像给快递贴标签——标易碎的包裹不拆箱检查直接放行。

#### 📊 图解
重渲染触发：
1.父组件重渲染→所有子组件重渲染
2.state/props变化
3.Context值变化

工具：React.memo/useMemo/useCallback
#### 🔧 详解
React.memo对props浅比较相同时跳过渲染。useMemo缓存计算结果。useCallback缓存函数。不要过早优化，先测量再优化。React DevTools Profiler定位瓶颈。

#### 💻 代码
const List=React.memo(function List({items,onSelect}){
  return items.map(i=>);
});
function Parent(){
  const items=useMemo(()=>compute(data),[data]);
  const handle=useCallback(id=>setSel(id),[]);
  return ;
}
#### ❓ 追问
memo浅比较不够用怎么办？答：传第二个areEqual函数自定义比较。

---
## 7. Error Boundary错误边界？

> **难度**: medium | **分类**: React | **ID**: 133

#### 🎯 本质
错误边界能**捕获子组件树的JS错误**显示备用UI而非整个应用崩溃。用class组件的componentDidCatch实现。

#### 🧒 类比
像保险丝——某个电器短路只断一路不影响全屋。

#### 📊 图解
捕获范围：
✅ 渲染期间错误
✅ 生命周期方法错误
✅ 子组件树构造函数错误
❌ 事件处理(需try/catch)
❌ 异步代码
#### 🔧 详解
错误边界必须是class组件。getDerivedStateFromError更新state显示备用UI，componentDidCatch记录错误。可嵌套多个实现细粒度容错。

#### 💻 代码
class ErrorBoundary extends React.Component {
  state={hasError:false};
  static getDerivedStateFromError(){return{hasError:true};}
  componentDidCatch(err,info){logError(err,info);}
  render(){
    return this.state.hasError ? 出错了 : this.props.children;
  }
}
#### ❓ 追问
为什么错误边界不支持函数组件？答：React认为错误处理需副作用适合class。

---
## 8. React.lazy和Suspense？

> **难度**: medium | **分类**: React | **ID**: 134

#### 🎯 本质
React.lazy实现**组件懒加载**(代码分割)，配合Suspense显示加载占位符。减少首屏体积。

#### 🧒 类比
lazy像快递按需发货——用到再下单。Suspense像正在加载的提示牌。

#### 📊 图解
const Home=lazy(()=>import('./Home'));
}>
  ...

#### 🔧 详解
React.lazy动态import实现按需加载。Suspense的fallback在加载期间显示。结合路由使用是最佳实践。ErrorBoundary处理加载失败。

#### 💻 代码
import {lazy,Suspense} from 'react';
const Home=lazy(()=>import('./pages/Home'));
function App(){
  return(
    
      }>
        }/>
      
    
  );
}
#### ❓ 追问
Suspense还能用于什么？答：React 18可用于数据获取(实验性)。

---
## 9. React并发模式Concurrent Mode？

> **难度**: hard | **分类**: React | **ID**: 135

#### 🎯 本质
React 18引入**并发渲染**允许同时处理多个渲染任务，可中断低优先级渲染响应高优先级交互。核心是startTransition和useDeferredValue。

#### 🧒 类比
像多任务OS——写文档(低优先级)时来电话(高优先级)先接电话再继续写。

#### 📊 图解
startTransition(()=>{
  setSearchResults(data); // 低优先级可中断
});
const deferred=useDeferredValue(query);
#### 🔧 详解
startTransition标记非紧急更新为过渡可被紧急更新打断。useDeferredValue返回延迟版本的值类似防抖但更智能。useId生成唯一ID用于SSR。

#### 💻 代码
import {startTransition,useDeferredValue} from 'react';
function Search(){
  const [query,setQuery]=useState('');
  const deferred=useDeferredValue(query);
  useEffect(()=>{
    startTransition(()=>setResults(search(deferred)));
  },[deferred]);
  return setQuery(e.target.value)}/>;
}
#### ❓ 追问
什么是tearing？答：并发渲染中组件树不同部分看到不同状态值。useSyncExternalStore解决什么？答：保证外部store值一致。

---
## 10. useRef的用途？

> **难度**: easy | **分类**: React | **ID**: 136

#### 🎯 本质
useRef创建**持久化的可变引用**，修改不触发重渲染。用途：访问DOM、存储不参与渲染的值、保存前一次值。

#### 🧒 类比
像贴在组件上的便利贴——可以随时改写但不会触发重新装修(重渲染)。

#### 📊 图解
useRef用途：
1.访问DOM元素
2.存储可变值(不触发渲染)
3.保存前一次值
4.存储定时器ID
#### 🔧 详解
ref.current可读写，修改不触发渲染。React会把DOM元素赋给ref.current(通过ref回调或useRef+ref属性)。不要在渲染期间读写ref。

#### 💻 代码
const inputRef=useRef(null);
const prevCount=useRef(0);
useEffect(()=>{prevCount.current=count;});
function focus(){inputRef.current.focus();}
return ;
#### ❓ 追问
useRef和useState的区别？答：ref修改不触发渲染，state会。createRef和useRef的区别？答：createRef每次渲染都创建新的。

---
## 11. 高阶组件(HOC)？

> **难度**: medium | **分类**: React | **ID**: 137

#### 🎯 本质
HOC是**接收组件返回新组件的函数**，用于复用组件逻辑。如React Router的withRouter、Redux的connect。

#### 🧒 类比
HOC像给组件穿外套——不改变组件本身但给它添加新能力(路由信息/状态管理)。

#### 📊 图解
function withAuth(Wrapped){
  return function(props){
    if(!isLoggedIn) return ;
    return ;
  };
}
#### 🔧 详解
HOC不修改原组件而是用容器组件包裹。注意：不要在render中使用HOC(每次创建新组件)、复制静态方法、传递refs需forwardRef。现代React推荐用Hooks替代HOC。

#### 💻 代码
function withLogger(Wrapped){
  return function(props){
    useEffect(()=>{console.log('mounted');},[]);
    return ;
  };
}
const EnhancedComponent=withLogger(MyComponent);
#### ❓ 追问
HOC有什么缺点？答：嵌套地狱、命名冲突、难以类型推导。Hooks为什么能替代HOC？答：Hooks在组件内部复用逻辑更直观。

---
## 12. 受控vs非受控组件？

> **难度**: medium | **分类**: React | **ID**: 138

#### 🎯 本质
**受控组件**的值由React state控制(通过value+onChange)。**非受控组件**的值由DOM自己管理(通过ref获取)。

#### 🧒 类比
受控像公司统一管理(所有数据走state)，非受控像员工自治(DOM自己管数据需要时问ref)。

#### 📊 图解
受控: setName(e.target.value)}/>
非受控: 
#### 🔧 详解
受控组件数据流完全由React控制便于验证和转换。非受控组件适合简单场景(文件上传、一次性表单)。defaultValue设置初始值。useFormStatus获取表单提交状态。

#### 💻 代码
// 受控
const [name,setName]=useState('');
setName(e.target.value)}/>

// 非受控
const ref=useRef();

console.log(ref.current.value)}>提交
#### ❓ 追问
什么时候用非受控？答：文件上传、与第三方库集成、简单一次性表单。如何将非受控转受控？答：加value+onChange。

---
## 13. Fragment和Portal？

> **难度**: medium | **分类**: React | **ID**: 139

#### 🎯 本质
**Fragment**允许组件返回多个元素不需要额外DOM节点。**Portal**将子组件渲染到DOM树的其他位置(如弹窗渲染到body)。

#### 🧒 类比
Fragment像隐形包装纸(不产生额外盒子)，Portal像传送门(把组件传送到DOM其他位置)。

#### 📊 图解
Fragment: <> 或 
Portal: ReactDOM.createPortal(child, container)
#### 🔧 详解
Fragment避免不必要的DOM嵌套(如table中td不能用div包裹)。<>不支持key属性需用。Portal创建的元素事件冒泡仍遵循React树而非DOM树。

#### 💻 代码
function Table(){
  return(
    
      
        AB
      
    
  );
}
// Portal弹窗
function Modal({children}){
  return createPortal(
    {children},
    document.body
  );
}
#### ❓ 追问
Portal的事件冒泡特性？答：Portal内的DOM事件会冒泡到React父组件而非DOM父节点。Fragment和Container 的区别？答：Fragment不产生DOM节点。

---
## 14. React SSR和Next.js？

> **难度**: hard | **分类**: React | **ID**: 140

#### 🎯 本质
**SSR(服务端渲染)**在服务器生成HTML发送给客户端，首屏快且SEO友好。**Next.js**是React全栈框架支持SSR/SSG/ISR。

#### 🧒 类比
CSR像在餐厅等厨师现做(SSR已经做好端上来)，Next.js像全自动厨房(多种烹饪方式任选)。

#### 📊 图解
渲染策略：
CSR: 浏览器渲染(默认)
SSR: 服务器实时渲染
SSG: 构建时静态生成
ISR: 增量静态再生成

Next.js App Router:
RSC(React Server Components)
Server Actions
#### 🔧 详解
Next.js App Router默认所有组件是Server Component(不发送JS到客户端)。'use client'标记客户端组件。getServerSideProps→Server Component直接async/await。RSC减少了客户端JS体积。

#### 💻 代码
// Next.js App Router (app/page.tsx)
// 默认是Server Component
export default async function Page(){
  const data=await fetch('https://api.example.com/posts');
  const posts=await data.json();
  return posts.map(p=>{p.title});
}

// Client Component
'use client'
export function Counter(){
  const [count,setCount]=useState(0);
  return setCount(c=>c+1)}>{count};
}
#### ❓ 追问
RSC和SSR的区别？答：RSC组件代码不发送到客户端，SSR全量发送。Next.js中Server Actions是什么？答：服务端函数直接在客户端调用。

---
## 15. key属性的作用？

> **难度**: medium | **分类**: React | **ID**: 141

#### 🎯 本质
key帮助React**识别哪些元素变化**(增/删/移动)，在列表渲染中正确复用DOM节点。

#### 🧒 类比
key像身份证号——帮React精准识别每个列表项，不会张冠李戴。

#### 📊 图解
无key: 按顺序diff(可能错位)
有key: 按key匹配(精准复用)

⚠️ 不要用index做key:
列表增删时index变化导致错乱
#### 🔧 详解
key在同级兄弟中必须唯一。用index做key时列表增删会导致不必要的DOM操作和状态错乱。稳定的key(如item.id)让diff精准。key变化=卸载旧组件创建新组件。

#### 💻 代码
// ❌ 用index
list.map((item,index)=>)
// ✅ 用唯一id
list.map(item=>)
#### ❓ 追问
为什么不能用index做key？答：增删时index变化导致组件错位。key变化会发生什么？答：卸载旧组件创建新组件(重置状态)。

---
## 16. React 18新特性？

> **难度**: medium | **分类**: React | **ID**: 142

#### 🎯 本质
React 18核心：**自动批处理**(所有更新自动合并)、**并发特性**(startTransition/useDeferredValue)、**Suspense增强**、**Strict Mode增强**。

#### 🧒 类比
像操作系统从单任务升级到多任务——自动批处理像合并小任务、并发特性像多任务调度。

#### 📊 图解
React 18新特性：
1.自动批处理(所有更新自动合并)
2.Transition API(startTransition)
3.useDeferredValue/useId
4.Suspense for SSR
5.Strict Mode双调用检测副作用
#### 🔧 详解
自动批处理：Promise/timeout中的多次setState也自动合并(以前只在React事件中合并)。createRoot替代ReactDOM.render。Suspense在SSR中支持流式渲染。useSyncExternalStore订阅外部store。

#### 💻 代码
import {createRoot} from 'react-dom/client';
const root=createRoot(document.getElementById('root'));
root.render();

// 自动批处理
function handleClick(){
  fetch('/api').then(()=>{
    setCount(c=>c+1);  // 以前：两次渲染
    setFlag(f=>!f);     // 现在：合并一次渲染
  });
}
#### ❓ 追问
什么是自动批处理？答：React 18中所有状态更新自动合并为一次渲染。createRoot和render的区别？答：createRoot启用并发特性。

---
## 17. 什么是Props？

> **难度**: easy | **分类**: React | **ID**: 143

#### 🎯 本质
Props是**父组件传递给子组件的只读数据**，类似函数参数。单向数据流：父→子。

#### 🧒 类比
Props像父母给孩子零花钱——给了就不能收回(只读)，孩子不能自己改金额。

#### 📊 图解
// 传递props

// 接收props
function Child({name,age}){...}
// children prop
内容

#### 🔧 详解
Props是只读的不允许子组件修改。解构赋值接收props。children是特殊props传递子元素。默认值用默认参数或defaultProps。展开运算符传递所有props。

#### 💻 代码
function Button({text,onClick,disabled=false}){
  return {text};
}
// 展开props
function Wrapper(props){
  return ;
}
#### ❓ 追问
Props和State的区别？答：Props外部传入只读，State内部管理可变。什么是Prop Drilling？答：多层传递props导致中间组件臃肿，用Context解决。

---
## 18. React Render Props模式？

> **难度**: medium | **分类**: React | **ID**: 144

#### 🎯 本质
Render Props是一种**通过函数props共享组件逻辑**的模式：组件接收一个返回React元素的函数。

#### 🧒 类比
像给相框传入不同的画——相框(组件)负责边框，画(函数)由你决定。

#### 📊 图解
function Mouse({render}){
  const [pos,setPos]=useState({x:0,y:0});
  return render(pos);
}
{x},{y}
}/>
#### 🔧 详解
Render Props和HOC都是复用逻辑的模式。现代React推荐用Hooks替代。children as function是常见写法。

#### 💻 代码
function DataFetcher({url,children}){
  const [data,setData]=useState(null);
  useEffect(()=>{fetch(url).then(r=>r.json()).then(setData);},[url]);
  return children(data);
}
// 使用

  {data=>data ?  : }

#### ❓ 追问
Render Props和Hooks哪个好？答：Hooks更直观简洁，Render Props更灵活。children as function是什么？答：用children prop传函数。

---
