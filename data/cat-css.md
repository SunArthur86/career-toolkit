# CSS

> 共 11 题

## 1. Flex布局核心属性？

> **难度**: easy | **分类**: CSS | **ID**: 17

#### 🎯 本质
Flexbox 是一种**一维布局模型**，通过主轴和交叉轴控制子元素的排列、对齐和分配空间。核心思想是让容器有能力控制其子项的伸缩行为。

#### 🧒 类比
Flex 像弹簧收纳盒——东西多了自动压缩，少了自动伸展，还可以选择从左到右或从上到下排列。

#### 📊 图解
容器属性(设在父元素上):
display:flex         → 启用flex
flex-direction       → row|column|row-reverse
column-reverse
justify-content      → 主轴对齐(flex-start|center
  |space-between|space-around|space-evenly)
align-items          → 交叉轴对齐(stretch|center
  |flex-start|flex-end)
flex-wrap            → nowrap|wrap|wrap-reverse
gap                  → 间距

项目属性(设在子元素上):
flex: grow shrink basis
  flex:1 → 等分剩余空间
align-self           → 单独交叉轴对齐
order                → 排列顺序(默认0)
#### 🔧 详解
flex:1 等价于 flex: 1 1 0%（可伸缩、均分空间）。flex:auto 等价于 flex: 1 1 auto（按内容分配）。常用技巧：margin-left:auto 可将元素推到最右。gap 属性替代了以往用 margin 模拟间距的方式。

#### 💻 代码
/* 经典布局：导航栏 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
/* 经典布局：居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 等分布局 */
.equal {
  display: flex;
  gap: 12px;
}
.equal > * { flex: 1; }
#### ❓ 追问
Flex 和 Grid 的区别？答：Flex 是一维（一次处理一行或一列），Grid 是二维（同时控制行和列）。

---
## 2. BFC是什么？如何触发？

> **难度**: medium | **分类**: CSS | **ID**: 18

#### 🎯 本质
BFC（Block Formatting Context）即**块级格式化上下文**，是一个独立的渲染区域，内部元素的布局不影响外部元素。BFC内的浮动元素也会被计算高度。

#### 🧒 类比
BFC 像一个透明隔离箱——箱子里的东西怎么摆都不会影响箱子外面，但箱子本身能感知到里面所有东西（包括飘着的气球/浮动元素）。

#### 📊 图解
触发BFC的方式:
1. overflow: hidden | auto | scroll
2. display: flex | grid | inline-block
   | flow-root (推荐)
3. position: absolute | fixed
4. float: left | right
5. 根元素 

BFC特性:
① 内部块级盒子垂直排列
② 同一BFC内相邻margin会重叠
③ BFC区域不会与浮动元素重叠
④ 计算BFC高度时包含浮动元素
#### 🔧 详解
BFC最常用的三个场景：**清除浮动**（父元素设overflow:hidden包含浮动子元素）、**防止margin塌陷**（相邻兄弟margin合并，创建新BFC避免）、**自适应布局**（BFC不与float重叠，实现两栏布局）。推荐用 display:flow-root 专门触发BFC，无副作用。

#### 💻 代码
/* 清除浮动 */
.container {
  display: flow-root; /* 推荐 */
  /* 或 overflow: hidden; */
}
/* 防止margin塌陷 */
.wrapper {
  overflow: hidden; /* 创建新BFC */
}
/* 两栏布局(左固定右自适应) */
.left { float: left; width: 200px; }
.right { overflow: hidden; /* BFC不与float重叠 */ }
#### ❓ 追问
display:flow-root 和 overflow:hidden 的区别？答：flow-root 专门触发BFC无副作用，overflow:hidden 可能裁切溢出内容。

---
## 3. CSS选择器优先级？

> **难度**: medium | **分类**: CSS | **ID**: 19

#### 🎯 本质
CSS优先级（Specificity）决定当多条规则同时作用于同一元素时，哪条规则最终生效。通过一个四位权重值 (a,b,c,d) 来计算和比较。

#### 🧒 类比
优先级像军衔——将军（!important）>司令（内联）>师长（ID）>营长（class）>士兵（元素）。同级比数量，数量相同比书写顺序（后来者居上）。

#### 📊 图解
优先级从高到低:
!important         → 无限大(终极武器)
内联 style=""      → (1,0,0,0)
#id选择器          → (0,1,0,0)
.class/:伪类/[属性] → (0,0,1,0)
元素/::伪元素      → (0,0,0,1)
通配符*            → (0,0,0,0)不计入

比较规则:
从左到右逐位比较,大的优先
同优先级:后写的覆盖先写的
#### 🔧 详解
注意：**伪类**（:hover、:nth-child）和**属性选择器**（[type=text]）与class同级。**伪元素**（::before、::after）与元素同级。:not() 本身不计优先级，但括号内的选择器计入。相同优先级下，后声明的覆盖先声明的（层叠规则）。

#### 💻 代码
/* 优先级计算示例 */
#nav .list li        → (0,1,1,1)
.menu .item.active   → (0,0,3,0)
div ul li::after     → (0,0,0,4)

/* 实际案例 */
#btn { color: red; }        /* (0,1,0,0) 赢 */
.btn.btn-primary { color: blue; } /* (0,0,2,0) 输 */

/* 特殊：:not 的优先级 */
div:not(.active) { color: red; }
/* 优先级 = (0,0,1,1), :not不计,.active计入 */
#### ❓ 追问
如何覆盖 !important？答：只有另一个 !important 且优先级更高/书写更后才能覆盖。应尽量避免使用 !important。

---
## 4. 居中方案有哪些？

> **难度**: easy | **分类**: CSS | **ID**: 20

#### 🎯 本质
CSS居中是布局中最常见的需求，分为**水平居中**、**垂直居中**和**水平垂直居中**。现代方案（Flex/Grid）一行代码搞定，传统方案需要组合多个属性。

#### 🧒 类比
居中像把画挂在墙的正中间——新房子（Flex）有定位器一下就挂好，老房子（传统方案）需要量尺寸打钉子。

#### 📊 图解
水平垂直居中方案:
1. Flex(推荐)
   display:flex;
   justify-content:center;
   align-items:center;

2. Grid(最简洁)
   display:grid;
   place-items:center;

3. 绝对定位+transform
   position:absolute;
   top:50%;left:50%;
   transform:translate(-50%,-50%);

4. 绝对定位+margin:auto
   position:absolute;
   inset:0;  /* top/right/bottom/left:0 */
   margin:auto;
   (需设置宽高)
#### 🔧 详解
Flex方案最通用，兼容性好。Grid方案最简洁（place-items:center 一行搞定）。transform方案适合已知尺寸的弹窗，基于百分比+自身偏移。inset:0 + margin:auto 方案需要元素有明确的宽高。行内元素用 text-align:center + line-height 也可实现单行文本居中。

#### 💻 代码
/* 方案1: Flex */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
/* 方案2: Grid */
.grid-center {
  display: grid;
  place-items: center;
  height: 100vh;
}
/* 方案3: 绝对定位 */
.abs-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
#### ❓ 追问
如何居中一个不定宽高的浮动元素？答：外层加Flex容器或用JS动态计算offset。

---
## 5. 盒模型标准模式与怪异模式？

> **难度**: easy | **分类**: CSS | **ID**: 112

#### 🎯 本质
**标准盒模型**width只含content，**怪异盒模型(IE)**width包含content+padding+border。通过box-sizing切换。

#### 🧒 类比
标准模式像买机票票价行李额单独算，怪异模式像打车报价包含所有费用。

#### 📊 图解
标准(content-box): width=content
  实际=content+padding+border+margin
怪异(border-box): width=content+padding+border
  实际=width+margin

推荐: *,*::before,*::after { box-sizing:border-box }
#### 🔧 详解
现代开发几乎都用border-box更直观。CSS Reset通常会设置全局border-box。标准模式下width:100px+padding:20px实际140px容易溢出。

#### 💻 代码
html { box-sizing: border-box; }
*, *::before, *::after {
  box-sizing: inherit;
}
.btn {
  box-sizing: border-box;
  width: 200px;
  padding: 10px 20px;
  border: 2px solid;
  /* 实际宽度始终200px */
}
#### ❓ 追问
box-sizing:inherit有什么用？答：让子元素继承父元素设置。

---
## 6. CSS Grid核心属性？

> **难度**: medium | **分类**: CSS | **ID**: 113

#### 🎯 本质
CSS Grid是**二维布局系统**，同时控制行和列。适合复杂页面布局如仪表盘。

#### 🧒 类比
Grid像围棋棋盘——横竖都有线，元素放在格子或跨越多个格子中。

#### 📊 图解
容器属性：
grid-template-columns: 200px 1fr 1fr
grid-template-rows: auto 1fr auto
gap: 16px
grid-template-areas:
  "header header header"
  "sidebar main aside"
#### 🔧 详解
Grid核心：网格容器、网格线、网格轨道、网格区域。fr单位按比例分配空间。repeat()简化重复定义。minmax()设置范围。auto-fill/auto-fit自动填充。

#### 💻 代码
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "nav nav"
    "sidebar main"
    "footer footer";
  gap: 16px;
  height: 100vh;
}
/* 响应式grid */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
#### ❓ 追问
Grid和Flex如何选择？答：一维用Flex，二维用Grid。fr和%的区别？答：fr按剩余空间分配，%基于容器总宽。

---
## 7. CSS动画性能优化？

> **难度**: medium | **分类**: CSS | **ID**: 114

#### 🎯 本质
动画应优先使用**transform和opacity**，它们由GPU合成层处理不触发回流重绘。避免动画width/height/top/left。

#### 🧒 类比
好的动画像滑冰(只平移旋转GPU加速)，差的像踩泥巴(每步改变地面形状触发回流)。

#### 📊 图解
GPU加速属性：
transform/opacity/filter ✅
will-change ✅

触发回流的属性(避免动画)：
width/height/margin/top/left ❌
#### 🔧 详解
合成层优化：transform/opacity自动提升为合成层。will-change提前告知。contain属性限制影响范围。content-visibility:auto跳过屏幕外渲染。避免过多合成层(内存开销)。

#### 💻 代码
.animate {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.animate:hover {
  transform: translateY(-10px);
  opacity: 0.8;
}
/* 避免 */
.bad { transition: height 0.3s; /* ❌ */ }
#### ❓ 追问
rAF和CSS动画的区别？答：rAF是JS手动控制帧，CSS动画浏览器自动优化。will-change什么时候用？答：动画前设置，结束移除。

---
## 8. CSS Houdini是什么？

> **难度**: hard | **分类**: CSS | **ID**: 115

#### 🎯 本质
CSS Houdini是一组**底层浏览器API**，让开发者能扩展CSS能力——自定义属性解析、绘制逻辑、布局算法。

#### 🧒 类比
像给CSS开了后门——以前CSS能做什么由浏览器决定，现在你可以自己教CSS新技能。

#### 📊 图解
Houdini API集合：
1.Properties & Values→自定义属性类型
2.Paint API→自定义绘制
3.Layout API→自定义布局
4.Animation Worklet→自定义动画
5.Typed OM→类型化CSS值
#### 🔧 详解
Properties & Values API注册自定义属性的类型和初始值，CSS变量就有类型约束和动画能力。Paint API用Canvas2D自定义绘制。Animation Worklet在独立线程运行动画逻辑。

#### 💻 代码
@property --hue {
  syntax: "";
  initial-value: 0;
  inherits: false;
}
.rainbow {
  background: hsl(var(--hue), 80%, 60%);
  transition: --hue 1s;
}
.rainbow:hover { --hue: 360; }
#### ❓ 追问
Houdini兼容性？答：Chrome/Edge领先，Safari部分，Firefox有限。Paint Worklet原理？答：独立线程运行Canvas2D绘制。

---
## 9. CSS变量(自定义属性)？

> **难度**: medium | **分类**: CSS | **ID**: 116

#### 🎯 本质
CSS变量用--name定义，var(--name)引用。支持继承、回退值、JS动态修改。

#### 🧒 类比
CSS变量像全局配置文件——改一处所有引用它的地方自动更新。

#### 📊 图解
定义和使用：
:root {
  --primary: #0066ff;
  --radius: 8px;
}
.btn {
  background: var(--primary);
  border-radius: var(--radius);
}
#### 🔧 详解
CSS变量在声明元素的子树中继承。:root中定义全局可用。var()第二个参数是回退值。JS可通过setProperty动态修改。是实现主题切换的基础。

#### 💻 代码
:root {
  --primary: #0066ff;
  --bg: #ffffff;
  --text: #333333;
}
[data-theme='dark'] {
  --primary: #4d94ff;
  --bg: #1a1a1a;
  --text: #e0e0e0;
}
body {
  background: var(--bg);
  color: var(--text);
}
// JS切换
document.documentElement.dataset.theme = 'dark';
#### ❓ 追问
CSS变量和SCSS变量的区别？答：CSS变量运行时动态，SCSS变量编译时静态。var()的回退值机制？答：var(--x, default)，--x未定义时用default。

---
## 10. CSS Modules和CSS-in-JS？

> **难度**: medium | **分类**: CSS | **ID**: 117

#### 🎯 本质
**CSS Modules**通过构建工具生成唯一类名实现样式隔离。**CSS-in-JS**在JS中写CSS(如styled-components)，运行时生成样式。

#### 🧒 类比
CSS Modules像给每个人发唯一工牌(避免重名冲突)，CSS-in-JS像随身携带定制工具(样式和组件绑定)。

#### 📊 图解
CSS Modules:
import styles from './Button.module.css'
→ 编译后类名变成 .Button_abc123

CSS-in-JS:
const Btn = styled.button`
  color: ${props => props.color};
`
#### 🔧 详解
CSS Modules构建时生成hash类名，零运行时开销。CSS-in-JS运行时动态生成样式，灵活但有性能开销。现代趋势：Tailwind(原子化CSS)、Vanilla Extract(类型安全零运行时CSS-in-JS)。

#### 💻 代码
/* Button.module.css */
.btn { padding: 8px 16px; }
.primary { background: blue; }

// Component
import s from './Button.module.css';
function Button() {
  return Click;
}

// styled-components
const Button = styled.button`
  background: ${p => p.primary ? 'blue' : 'gray'};
`;
#### ❓ 追问
Tailwind的优缺点？答：原子化快速开发，但HTML臃肿。CSS Modules零运行时但不够灵活。

---
## 11. 响应式设计方案？

> **难度**: easy | **分类**: CSS | **ID**: 118

#### 🎯 本质
响应式设计让页面**适配不同屏幕尺寸**。核心：媒体查询、弹性布局、相对单位、视口单位。

#### 🧒 类比
像变色龙——根据环境自动调整外观，在手机和电脑上都好看。

#### 📊 图解
方案：
1.媒体查询 @media (max-width: 768px)
2.弹性布局 flex/grid + 百分比
3.视口单位 vw/vh
4.rem/em相对单位
5.响应式图片 srcset
6.container queries(新)
#### 🔧 详解
移动优先(Mobile First)：先写小屏样式，用min-width渐进增强。桌面优先：先写大屏，用max-width渐进缩小。现代CSS Container Query允许组件级响应式(基于容器而非视口)。

#### 💻 代码
/* 移动优先 */
.container { padding: 16px; }
@media (min-width: 768px) {
  .container { padding: 24px; max-width: 720px; }
}
@media (min-width: 1024px) {
  .container { max-width: 960px; }
}
/* Container Query */
.card-container { container-type: inline-size; }
@container (min-width: 400px) {
  .card { display: flex; }
}
#### ❓ 追问
Container Query和Media Query的区别？答：Container基于父容器宽度，Media基于视口。rem和em的区别？答：rem基于根字号，em基于父元素字号。

---
