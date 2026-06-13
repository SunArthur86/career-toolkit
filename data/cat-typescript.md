# TypeScript

> 共 17 题

## 1. type和interface的区别？

> **难度**: easy | **分类**: TypeScript | **ID**: 13

#### 🎯 本质
**interface** 描述对象的形状，支持声明合并和扩展。**type** 是类型别名，功能更强大，支持联合类型、交叉类型、基本类型别名等。90%场景两者可互换。

#### 🧒 类比
interface 像填表模板（标准格式，可以追加新字段），type 像自定义便利贴（想怎么贴就怎么贴，更灵活）。

#### 📊 图解
interface User {
  name: string;
  age: number;
}
interface User {          // 声明合并 ✅
  email: string;
}

type ID = string | number;  // 联合类型 ✅
type Point = [number, number]; // 元组 ✅
type Fn = () => void;       // 函数类型 ✅
#### 🔧 详解
**interface独有**：声明合并（同名的interface自动合并属性，第三方库扩展用）、extends继承。**type独有**：联合/交叉类型、映射类型、条件类型、基本类型别名。**选型建议**：公共API/库用interface（方便扩展），内部工具类型用type（更灵活）。

#### 💻 代码
// interface 扩展
interface Animal { name: string; }
interface Dog extends Animal {
  breed: string;
}

// type 交叉
type Animal = { name: string; };
type Dog = Animal & { breed: string; };

// type 联合(接口做不到)
type Status = "active" | "inactive";
type Result = Success | Error;
#### ❓ 追问
什么是声明合并？实际应用场景？答：Third-party library 扩展，如扩展 Window 接口添加自定义属性。

---
## 2. 什么是泛型？

> **难度**: medium | **分类**: TypeScript | **ID**: 14

#### 🎯 本质
泛型是**类型的参数化**——定义时不指定具体类型，使用时再确定。让函数、接口、类支持多种类型，同时保持类型安全。类似函数参数是值的占位符，泛型是类型的占位符。

#### 🧒 类比
泛型像自动售货机——机器（函数）不关心卖什么饮料（类型），你放可乐就出可乐，放雪碧就出雪碧，但不会变成别的。

#### 📊 图解
function identity(arg: T): T {
  return arg;
}
identity("hello");  // T=string
identity(42);       // T=number
identity("auto");            // 自动推导T=string

// 泛型约束
interface HasLength {
  length: number;
}
function logLen(arg: T): T {
  console.log(arg.length);
  return arg;
}
#### 🔧 详解
泛型用 **&lt;T&gt;** 声明类型参数，可以有一个或多个（如 &lt;T, U&gt;）。**泛型约束**（extends）限制类型范围。**常用场景**：API请求函数、工具函数、React组件Props。Builtin工具类型（Partial、Pick等）都基于泛型实现。

#### 💻 代码
// 泛型函数
function first(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);    // number
first(["a", "b"]);   // string

// 泛型接口
interface ApiResponse {
  code: number;
  data: T;
  message: string;
}
const res: ApiResponse = await fetchUser();

// 多泛型参数
function swap(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}
#### ❓ 追问
什么是泛型推导？何时需要手动标注？答：TS根据参数自动推导，推导不出时手动标注，如空数组 const arr: T[] = []。

---
## 3. Partial、Pick、Omit、Record？

> **难度**: medium | **分类**: TypeScript | **ID**: 15

#### 🎯 本质
这四个是 TypeScript 内置的**工具类型（Utility Types）**，基于泛型和映射类型实现，用于从已有类型快速派生新类型。

#### 🧒 类比
Partial 像表格所有字段变成选填，Pick 像只撕下表格的几列，Omit 像涂掉某几列，Record 像批量印刷相同格式的表格。

#### 📊 图解
interface User {
  name: string;
  age: number;
  email: string;
}

Partial     → {name?:string; age?:number; email?:string}
Pick  → {name:string; age:number}
Omit  → {name:string; age:number}
Record → {a:User; b:User}
#### 🔧 详解
**Partial&lt;T&gt;**：所有属性变为可选（用 keyof + ? 实现）。**Pick&lt;T, K&gt;**：只保留指定属性。**Omit&lt;T, K&gt;**：排除指定属性（等价于 Pick&lt;T, Exclude&lt;keyof T, K&gt;&gt;）。**Record&lt;K, V&gt;**：构造键为K、值为V的对象类型。还有 Required、Readonly、Exclude、Extract 等。

#### 💻 代码
interface User {
  name: string;
  age: number;
  email: string;
}

// 更新函数：只传需要更新的字段
function updateUser(user: User, data: Partial) {
  return { ...user, ...data };
}
updateUser(user, { age: 25 }); // 只改age

// API响应：只要部分字段
type UserPreview = Pick;

// 表单：排除id
type UserForm = Omit;

// 字典映射
const userMap: Record = {};
#### ❓ 追问
如何手写 Partial？答：type MyPartial&lt;T&gt; = { [K in keyof T]?: T[K] }。

---
## 4. 协变和逆变？

> **难度**: hard | **分类**: TypeScript | **ID**: 16

#### 🎯 本质
**协变（Covariance）**：子类型关系保持同方向——Dog是Animal的子类型，则 Array&lt;Dog&gt; 也是 Array&lt;Animal&gt; 的子类型。**逆变（Contravariance）**：子类型关系反转——函数参数类型在strictFunctionTypes下反向。

#### 🧒 类比
协变像俄罗斯套娃——小套娃能放进大套娃（Dog装进Animal容器）。逆变像退货规则——商店接受Animal退货，那当然也接受Dog退货（函数参数反过来）。

#### 📊 图解
Dog extends Animal (子类型关系)

协变(同方向):
  Array extends Array ✅
  ReturnType: Dog→Animal 保持方向

逆变(反方向):
  (arg: Animal) => void
    extends (arg: Dog) => void ✅
  参数类型反向!

双变(默认):
  函数参数默认双向接受(不安全)
  开启strictFunctionTypes→逆变
#### 🔧 详解
TS中**属性/返回值**默认协变（合理）。**函数参数**默认双变（宽松，但不安全），开启strictFunctionTypes后变为逆变（安全）。理解协变/逆变有助于设计类型安全的泛型和函数重载。

#### 💻 代码
class Animal { name = "animal"; }
class Dog extends Animal { breed = "dog"; }

// 协变：子类型数组可赋给父类型数组
const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs; // ✅ 协变

// 逆变：函数参数反过来
type AnimalFn = (a: Animal) => void;
type DogFn = (d: Dog) => void;
// strictFunctionTypes下:
// AnimalFn extends DogFn ✅ (逆变)
// 因为能处理Animal的函数当然能处理Dog
#### ❓ 追问
TS的strictFunctionTypes什么时候需要开启？答：项目初始化就应开启，避免函数参数类型的不安全赋值。

---
## 5. TypeScript中interface和type的区别？

> **难度**: easy | **分类**: TypeScript | **ID**: 160

#### 🎯 本质
interface声明**对象形状**，type创建**类型别名**。interface可声明合并，type更灵活(联合/交叉/映射)。

#### 🧒 类比
interface像正式合同(可追加条款)，type像一次性声明(不能改但功能更多)。

#### 📊 图解
interface: 可声明合并、extends
  interface A {x:number}
  interface A {y:string} // 合并
type: 联合/交叉/映射/条件
  type A={x:number}&{y:string}
#### 🔧 详解
interface用extends继承，可以用implements让class实现。interface同名自动合并(declaration merging)。type支持联合类型、条件类型、映射类型等高级特性。两者大部分场景可互换。

#### 💻 代码
interface User {
  name:string;
  age:number;
}
interface User {  // 声明合并
  email:string;
}
type Status='active'|'inactive';
type Result=T extends string ? string : number;
#### ❓ 追问
什么时候用interface？答：定义对象形状、class implements。什么时候用type？答：联合类型、条件类型、工具类型。

---
## 6. TypeScript泛型？

> **难度**: medium | **分类**: TypeScript | **ID**: 161

#### 🎯 本质
泛型是**类型的参数化**——写代码时不指定具体类型，使用时再确定。实现类型安全的复用。

#### 🧒 类比
泛型像快递箱——箱子的形状固定但能装任何东西，贴标签(类型参数)标明装的是什么。

#### 📊 图解
function fn(arg:T):T
T是类型参数(占位符)

约束: T extends SomeType
默认: T=DefaultType

常用: T,K,V,U
#### 🔧 详解
泛型函数/类/接口用声明类型参数。extends约束类型范围。keyof获取键的联合类型。infer在条件类型中推断类型。多个类型参数用逗号分隔。

#### 💻 代码
function identity(arg:T):T{return arg;}
identity('hello');
identity(42); // 自动推导

// 约束
function getProp(obj:T,key:K):T[K]{
  return obj[key];
}
getProp({name:'Tom',age:25},'name'); // string
#### ❓ 追问
什么是泛型约束？答：T extends X限制T必须满足X。keyof的作用？答：获取对象类型所有键的联合类型。

---
## 7. TypeScript条件类型和infer？

> **难度**: medium | **分类**: TypeScript | **ID**: 162

#### 🎯 本质
条件类型根据**类型关系判断**选择不同类型，类似三目运算符。infer在条件类型中**推断子类型**。

#### 🧒 类比
条件类型像类型世界的if-else，infer像从类型中'提取'出你想要的部分。

#### 📊 图解
条件类型:
type A=X extends Y ? Z : W

infer(类型推断):
type R=T extends (...args:infer A)=>infer R ? R : never

分发: 裸类型参数自动分发
#### 🔧 详解
条件类型配合infer可以提取函数返回值、Promise解包值、数组元素类型等。分发条件类型对联合类型每个成员分别判断。内置工具类型ReturnType/Parameters等都用infer实现。

#### 💻 代码
type IsString=T extends string ? 'yes' : 'no';
type A=IsString; // 'yes'
type B=IsString; // 'no'

// infer提取返回值
type MyReturn=T extends (...args:any[])=>infer R ? R : never;
type Fn=()=>string;
type R=MyReturn; // string
#### ❓ 追问
什么是分发条件类型？答：裸类型参数会对联合类型每个成员分别判断。如何避免分发？答：用[T]包裹。

---
## 8. TypeScript联合类型和交叉类型？

> **难度**: easy | **分类**: TypeScript | **ID**: 163

#### 🎯 本质
**联合类型**(|)表示取多种类型之一。**交叉类型**(&)表示同时满足多种类型。

#### 🧒 类比
联合像自助餐选一样(|),交叉像套餐全都要(&)。

#### 📊 图解
联合: A | B (A或B)
交叉: A & B (A且B)

字面量: 'a'|'b'|'c'
可辨识联合: type + 字面量
#### 🔧 详解
联合类型通过类型收窄(typeof/instanceof/in/字面量)确定具体类型。交叉类型合并多个类型的属性。可辨识联合(discriminated union)用共有字面量属性区分类型。

#### 💻 代码
type ID=string|number;
function print(id:ID){
  if(typeof id==='string') console.log(id.toUpperCase());
  else console.log(id.toFixed(2));
}
type Admin=User&{role:'admin';permissions:string[]};
#### ❓ 追问
什么是类型收窄？答：通过条件判断缩小联合类型的范围。可辨识联合是什么？答：用共有字面量属性区分联合类型成员。

---
## 9. TypeScript枚举enum？

> **难度**: medium | **分类**: TypeScript | **ID**: 164

#### 🎯 本质
枚举定义**一组命名常量**。数字枚举可反向映射，字符串枚举不可。const enum编译时内联。

#### 🧒 类比
枚举像下拉菜单——列出所有可选值，避免输入错误。

#### 📊 图解
数字枚举(默认): 
enum Dir{Up,Down,Left,Right}
// Up=0, Down=1...

字符串枚举:
enum Color{Red='RED'}

const enum: 编译时内联
反向映射: 数字枚举双向
#### 🔧 详解
数字枚举从0自增，也可手动赋值。字符串枚举必须初始化。const enum编译时被替换为常量值(无运行时代码)。反向映射：Dir[0]得到'Up'(仅数字枚举)。很多项目用union type替代enum。

#### 💻 代码
enum Direction {
  Up='UP', Down='DOWN'
}
function move(dir:Direction){}
move(Direction.Up);

// 替代方案
type Dir='up'|'down'|'left'|'right';
#### ❓ 追问
const enum的好处？答：编译时内联无运行时代码。为什么有人用union type替代enum？答：更轻量，tree-shake友好。

---
## 10. TypeScript装饰器？

> **难度**: medium | **分类**: TypeScript | **ID**: 165

#### 🎯 本质
装饰器是**修饰类/方法/属性/参数**的特殊函数。Stage 3装饰器已标准化成为官方规范。

#### 🧒 类比
装饰器像给照片加滤镜——不改变原图(类)但添加额外效果(日志/验证/缓存)。

#### 📊 图解
类装饰器: (constructor) => void
方法装饰器: (target, key, descriptor)
属性装饰器: (target, key)

Stage 3(2023):
更简单的API
#### 🔧 详解
Stage 3装饰器使用decorator函数签名。旧版装饰器是实验性特性(tsconfig experimentalDecorators)。类装饰器可以替换构造函数。方法装饰器可以修改方法行为。常见于NestJS等框架。

#### 💻 代码
// Stage 3 装饰器
function logged(origFn,ctx){
  return function(...args){
    console.log('calling',ctx.name);
    return origFn.call(this,...args);
  };
}
class Calculator {
  @logged
  add(a:number,b:number){return a+b;}
}
#### ❓ 追问
装饰器和装饰器工厂的区别？答：工厂返回装饰器函数。装饰器的应用顺序？答：从下到上(方法)，从外到内(类)。

---
## 11. TypeScript映射类型和工具类型？

> **难度**: hard | **分类**: TypeScript | **ID**: 166

#### 🎯 本质
映射类型通过**遍历键来变换类型**。TypeScript内置工具类型(Partial/Required/Pick/Omit等)都是映射类型的实现。

#### 🧒 类比
映射类型像批量加工——对类型的每个属性统一加工(可选/只读/过滤)。

#### 📊 图解
映射类型基础:
type M={[K in keyof T]:T[K]}

修饰符: +?/-?/+readonly/-readonly

内置工具:
Partial Required Readonly
Pick Omit Record
Exclude Extract
#### 🔧 详解
Partial将所有属性变可选，Required反之。Pick选取部分属性，Omit排除部分属性。Record构造键值对类型。Readonly将所有属性变只读。自定义映射类型可以结合条件类型和模板字面量类型。

#### 💻 代码
type MyPartial={[K in keyof T]?:T[K]};
type MyPick={[P in K]:T[P]};
type MyOmit=Pick>;

// 使用
interface User{name:string;age:number;email:string;}
type UserPreview=Pick;
type UserUpdate=Partial;
#### ❓ 追问
Record和Map的区别？答：Record是纯类型(Map是运行时)。如何实现深度Partial？答：递归映射类型。

---
## 12. TypeScript模块系统？

> **难度**: medium | **分类**: TypeScript | **ID**: 167

#### 🎯 本质
TypeScript模块通过**import/export**组织代码。支持ESM、CJS、AMD等模块格式。通过module编译选项控制输出。

#### 🧒 类比
模块像独立房间——每个房间有自己的物品(export)，需要从别的房间拿东西(import)。

#### 📊 图解
模块类型:
ESM: import/export
CJS: require/module.exports

tsconfig:
module: 'esnext'|'commonjs'|'amd'
moduleResolution: 'node'|'bundler'|'nodenext'
#### 🔧 详解
export导出变量/函数/类/接口/类型。export default默认导出。import type仅导入类型(编译后移除)。namespace是旧式组织方式(不推荐新项目使用)。ambient declaration(.d.ts)声明外部类型。

#### 💻 代码
// ESM
export interface User{name:string;}
export function greet(u:User){return 'Hello '+u.name;}
// 导入
import {User,greet} from './user';
import type {User} from './user'; // 仅类型
import * as user from './user'; // 命名空间导入
#### ❓ 追问
import type的作用？答：仅导入类型编译后移除不影响运行时。什么是barrel export？答：index.ts统一导出简化导入路径。

---
## 13. TypeScript中any、unknown、never的区别？

> **难度**: easy | **分类**: TypeScript | **ID**: 168

#### 🎯 本质
**any**放弃类型检查。**unknown**是类型安全的any(使用前必须收窄)。**never**表示不可能存在的类型。

#### 🧒 类比
any像驾照免检章(随便开)，unknown像需要验证的临时驾照(先检查再开)，never像'此地不可到达'的路标。

#### 📊 图解
any: 完全放弃检查(不推荐)
unknown: 安全的any(使用前收窄)
never: 不可能的类型(函数抛异常/死循环)
void: 无返回值(undefined)
#### 🔧 详解
any关闭了类型检查，等于回到JavaScript。unknown是类型安全版本的any，必须先通过类型检查才能使用。never是所有类型的子类型但没有值。void表示函数不返回有意义的值。

#### 💻 代码
function fail(msg:string):never{throw new Error(msg);}
function parse(input:unknown):string{
  if(typeof input==='string') return input;
  throw new Error('not string');
}
// never用于穷尽检查
type Shape='circle'|'square';
function area(s:Shape){
  switch(s){
    case 'circle': return Math.PI;
    case 'square': return 1;
    default: const _exhaustive:s; // 编译错误如果遗漏
  }
}
#### ❓ 追问
什么时候用unknown？答：不确定类型但想保持类型安全。never的用途？答：穷尽检查、不可能的分支。

---
## 14. TypeScript类型体操常见技巧？

> **难度**: hard | **分类**: TypeScript | **ID**: 169

#### 🎯 本质
类型体操通过**递归类型、模板字面量类型、映射类型+条件类型组合**实现复杂类型变换。

#### 🧒 类比
类型体操像魔方——用基本操作(条件/映射/递归)组合出复杂的类型变换。

#### 📊 图解
常见技巧:
1.递归类型(深层变换)
2.模板字面量类型(字符串操作)
3.元组映射(数组变换)
4.函数重载(多态)
5.协变/逆变(子类型关系)
#### 🔧 详解
递归类型实现深度Readonly/Partial。模板字面量类型操作字符串(如CamelCase)。利用数组长度实现加法。infer递归提取嵌套类型。as断言重映射键。

#### 💻 代码
// 深度Readonly
type DeepReadonly={
  readonly [K in keyof T]:T[K] extends object
    ? DeepReadonly : T[K]
};
// CamelCase
type CamelCase=
  S extends `${infer H}_${infer T}`
    ? `${H}${Capitalize>}` : S;
// 元组转联合
type TupleToUnion=T[number];
#### ❓ 追问
什么是协变和逆变？答：协变子类型方向一致，逆变相反。as const的作用？答：将值类型收窄为字面量类型。

---
## 15. TypeScript函数重载？

> **难度**: medium | **分类**: TypeScript | **ID**: 170

#### 🎯 本质
函数重载提供**多个类型签名**给同一个函数，根据参数类型/数量返回不同类型。编译时类型检查，运行时需自己判断。

#### 🧒 类比
函数重载像餐厅菜单——同一个菜名(函数)可能有不同规格(参数组合)，每种规格对应的分量(返回值)不同。

#### 📊 图解
重载签名(多个) + 实现签名(1个)

function fn(x:string):string;
function fn(x:number):number;
function fn(x:any):any{
  // 运行时实现
}
#### 🔧 详解
重载签名写在前面，实现签名在最后。实现签名不是公开API的一部分。调用时只能使用重载签名的类型。TypeScript 4.2支持按位置解构重载。

#### 💻 代码
function parse(input:string):number;
function parse(input:number):string;
function parse(input:string|number):string|number{
  if(typeof input==='string') return input.length;
  return String(input);
}
const a=parse('hello'); // number
const b=parse(42); // string
#### ❓ 追问
实现签名能被外部调用吗？答：不能，只用于内部实现。重载和泛型的选择？答：能用泛型解决的不用重载。

---
## 16. TypeScript的typeof和keyof？

> **难度**: medium | **分类**: TypeScript | **ID**: 171

#### 🎯 本质
**typeof**在类型上下文中获取变量/表达式的类型。**keyof**获取对象类型所有键的联合类型。

#### 🧒 类比
typeof像X光机(看透变量的类型)，keyof像查看对象的钥匙串(列出所有可用的键)。

#### 📊 图解
typeof:
const x='hello';
type T=typeof x; // string literal

keyof:
type K=keyof {a:1;b:2}; // 'a'|'b'
#### 🔧 详解
typeof用于从运行时值提取类型。const断言(as const)让typeof获取字面量类型。keyof常用于泛型约束(限制参数为对象的键)。ReturnType获取函数返回值类型。

#### 💻 代码
const user={name:'Tom',age:25} as const;
type User=typeof user;
// {readonly name:'Tom';readonly age:25}

function get(obj:T,key:K):T[K]{
  return obj[key];
}
get(user,'name'); // 'Tom'
#### ❓ 追问
typeof和instanceof的区别？答：typeof是类型操作符，instanceof是运行时检查。ReturnType的用法？答：ReturnType获取函数返回值类型。

---
## 17. TypeScript中as断言？

> **难度**: easy | **分类**: TypeScript | **ID**: 172

#### 🎯 本质
**类型断言(as)**告诉编译器'我知道这个值的类型'，覆盖自动推导。非空断言(!.)排除null/undefined。

#### 🧒 类比
as像对TypeScript说'相信我'——我知道这是什么类型。!像说'我确定它不是null'。

#### 📊 图解
类型断言:
value as TargetType
value // JSX中不能用

非空断言:
value!.prop // 排除null/undefined

⚠️ 断言不改变运行时值
#### 🔧 详解
类型断言只在编译时起作用，不会影响运行时行为。不能断言为不相关的类型(除非经过unknown中转)。satisfies运算符检查类型但不改变推导类型。非空断言有风险，尽量用类型收窄替代。

#### 💻 代码
const input=document.getElementById('input') as HTMLInputElement;
input.value; // 有类型提示

// 非空断言
function process(name:string|null){
  console.log(name!.toUpperCase()); // 危险！
}
// 更好的方式
if(name!==null) console.log(name.toUpperCase());

// satisfies
const obj={a:1,b:'hello'} satisfies Record;
#### ❓ 追问
as和satisfies的区别？答：as改变推导类型，satisfies只验证不改变。什么时候用unknown中转？答：断言为不相关类型时。

---
