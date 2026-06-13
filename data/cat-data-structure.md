# 数据结构

> 共 16 题

## 1. 链表和数组的区别？

> **难度**: medium | **分类**: 数据结构 | **ID**: 41

#### 🎯 本质
**数组**在内存中连续存储，通过索引直接访问；**链表**由节点组成，每个节点存数据和指向下一个节点的指针，内存不连续。两者在访问、插入、删除上各有优劣。

#### 🧒 类比
数组像电影院座位——编号连续，知道座位号直接走过去。链表像寻宝游戏——每个线索指向下一个地点，只能按顺序找。

#### 📊 图解
        数组(Array)         链表(LinkedList)
内存    连续一块            分散各处,靠指针连
访问    O(1)按下标直达      O(n)从头遍历
头部插入 O(n)元素后移        O(1)改指针
中间插入 O(n)元素后移        O(1)改指针(已定位时)
删除    O(n)元素前移         O(1)改指针(已定位时)
缓存    友好(空间局部性)     不友好(随机访问)
扩容    可能需要整体搬迁     动态分配,无需搬迁

链表变种:
  单向链表: next指针
  双向链表: prev+next指针
  循环链表: 尾节点指向头
#### 🔧 详解
数组适合**读多写少**的场景（频繁查找、随机访问），链表适合**写多读少**的场景（频繁插入删除）。实际开发中数组更常用（CPU缓存友好）。JS中的Array底层是动态数组（V8引擎），自动扩容。链表在LRU缓存、消息队列、DOM节点关系(NodeList)中有应用。

#### 💻 代码
// 链表节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}
// 创建链表: 1→2→3
const head = new ListNode(1,
  new ListNode(2, new ListNode(3)));

// 反转链表(经典题)
function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

// 快慢指针找中间节点
function findMid(head) {
  let slow = fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
#### ❓ 追问
如何判断链表有环？答：快慢指针，相遇则有环。如何合并两个有序链表？答：双指针逐个比较，小的先接，O(n+m)。

---
## 2. 哈希表原理？如何解决冲突？

> **难度**: medium | **分类**: 数据结构 | **ID**: 99

#### 🎯 本质
哈希表通过**hash函数将key映射到数组下标**，实现O(1)的平均查找/插入/删除。

#### 🧒 类比
像图书馆的编号系统——每本书有一个编号(hash值)，直接走到对应书架(数组位置)取书。如果两本书编号相同(冲突)，就在书架上放一个多层架子(链表)。

#### 📊 图解
哈希表结构：

  key → hash(key) → index → bucket
  "name" →  hash  →   3   → ["Alice"]
  "age"  →  hash  →   7   → [25]
  "city" →  hash  →   3   → ["Alice","Beijing"]  ← 冲突!

冲突解决方案：

1.链地址法:  bucket存链表
   [0] → null
   [1] → [k1] → [k4] → null
   [2] → [k2] → null

2.开放寻址法:冲突时找下一个空位
   [0] k1
   [1] k4  ← k1冲突,往后找
   [2] k2
#### 🔧 详解
**哈希函数设计**：好的hash函数要均匀分布、计算快。常用取模法：index = hash(key) % capacity。
**三种冲突解决**：
1. **链地址法**：每个桶存链表(或红黑树)。Java HashMap用链表+红黑树(链表长度大于8时转换)。
2. **开放寻址法**：线性探测(+1,+2...)、二次探测(+1,+4,+9...)、双重哈希(两个hash函数)。
3. **再哈希**：换一个hash函数重新计算。
**扩容**：负载因子=元素数/桶数，超过阈值(通常0.75)时扩容2倍并rehash所有元素。
JS中Map/Set底层就是优化过的哈希表，V8引擎用链地址法+红黑树。

#### 💻 代码
// 手写简易HashMap
class HashMap {
  constructor(size = 16) {
    this.buckets = Array(size)
      .fill(null).map(() => []);
    this.size = 0;
  }
  hash(key) {
    let h = 0;
    for (let c of String(key))
      h = (h * 31 + c.charCodeAt(0))
        % this.buckets.length;
    return h;
  }
  set(key, val) {
    const idx = this.hash(key);
    const pair = this.buckets[idx]
      .find(p => p[0] === key);
    if (pair) pair[1] = val;
    else {
      this.buckets[idx].push([key,val]);
      this.size++;
    }
  }
  get(key) {
    return this.buckets[this.hash(key)]
      .find(p => p[0] === key)?.[1];
  }
}
#### ❓ 追问
HashMap和TreeMap的区别？hashCode()和equals()为什么必须一起重写？一致性哈希了解吗？

---
## 3. B树和B+树的区别？为什么数据库用B+树？

> **难度**: hard | **分类**: 数据结构 | **ID**: 100

#### 🎯 本质
B树的所有节点都存储数据；B+树只在**叶子节点存储数据**，内部节点只存索引key，叶子之间用链表串联。

#### 🧒 类比
B树像一本每个章节都附内容的书。B+树像一本**目录和正文分离的书**——目录只告诉你去哪页找，所有实际内容都在正文(叶子节点)，正文按页码串成链。

#### 📊 图解
B树(3阶):        B+树(3阶):
     [30|60]          [30|60]
    /  |           /   |     
 [10,20] [40,50] [70,80]

B+树叶子链表:
[10,20] -> [30,40,50] -> [60,70,80]
范围查询只需找到起点,沿链表遍历
#### 🔧 详解
**B+树三大优势**：
1. 树更矮IO更少：内部节点不存数据，同样磁盘页放更多key。
2. 范围查询极快：叶子链表串联，顺序遍历。
3. 查询性能稳定：所有数据在叶子层。
MySQL InnoDB使用B+树，聚簇索引叶子存完整行数据。

#### 💻 代码
class BPlusNode {
  constructor(isLeaf) {
    this.keys = [];
    this.children = [];
    this.next = null;
    this.isLeaf = isLeaf;
  }
}
// 范围查询
function rangeSearch(root, start, end) {
  let node = root;
  while (!node.isLeaf) node = node.children[0];
  const result = [];
  while (node) {
    for (let k of node.keys) {
      if (k > end) return result;
      if (k >= start) result.push(k);
    }
    node = node.next;
  }
  return result;
}
#### ❓ 追问
B+树索引什么情况下失效？聚簇索引和非聚簇索引的区别？

---
## 4. 数组的时间复杂度？

> **难度**: easy | **分类**: 数据结构 | **ID**: 238

#### 🎯 本质
数组是**连续内存**的线性结构。随机访问O(1)，插入/删除O(n)需移动元素。

#### 🧒 类比
数组像一排连座电影院——按号找座位O(1)，但中间加座要挪人O(n)。

#### 📊 图解
操作复杂度:
访问: O(1)  ← 连续内存+索引
查找: O(n) / O(logn)有序二分
尾部插入: O(1)
头部插入: O(n)
中间插入: O(n)
删除: O(n)
#### 🔧 详解
数组在内存中连续存储，通过索引直接计算地址。push/pop尾部操作O(1)。unshift/shift头部操作O(n)要移动所有元素。splice中间操作O(n)。JS数组是动态数组(自动扩容)。

#### 💻 代码
// JS数组操作
const arr=[1,2,3];
arr.push(4);       // [1,2,3,4] O(1)
arr.pop();         // [1,2,3] O(1)
arr.unshift(0);    // [0,1,2,3] O(n)
arr.shift();       // [1,2,3] O(n)
arr.splice(1,0,9); // [1,9,2,3] O(n)
arr[2];            // 2 O(1)
#### ❓ 追问
为什么JS数组push比unshift快？答：push在尾部直接添加，unshift要移动所有元素。

---
## 5. 链表及翻转？

> **难度**: medium | **分类**: 数据结构 | **ID**: 239

#### 🎯 本质
链表是**非连续内存**的线性结构，每个节点存储值和指向下一个节点的指针。插入/删除O(1)，查找O(n)。

#### 🧒 类比
链表像寻宝游戏——每个线索(节点)告诉你下一个在哪，但找第N个要从头找。

#### 📊 图解
单向链表:
head → [v|next] → [v|next] → null

操作:
插入/删除: O(1)(已知位置)
查找: O(n)
访问第N个: O(n)
#### 🔧 详解
链表不需要连续内存，插入删除只需修改指针。但无法随机访问。单向链表只有next指针。双向链表有prev和next。翻转链表是经典面试题(迭代和递归两种)。

#### 💻 代码
// 链表翻转(迭代)
function reverseList(head){
  let prev=null, curr=head;
  while(curr){
    const next=curr.next;
    curr.next=prev;
    prev=curr;
    curr=next;
  }
  return prev;
}
// 递归
function reverse(head){
  if(!head||!head.next) return head;
  const p=reverse(head.next);
  head.next.next=head;
  head.next=null;
  return p;
}
#### ❓ 追问
如何检测链表环？答：快慢指针，相遇则有环。如何找链表中点？答：快慢指针，快到尾慢到中点。

---
## 6. 栈和队列？

> **难度**: medium | **分类**: 数据结构 | **ID**: 240

#### 🎯 本质
**栈**是后进先出(LIFO)。**队列**是先进先出(FIFO)。都是操作受限的线性结构。

#### 🧒 类比
栈像叠盘子(后放先取)，队列像排队(先来先服务)。

#### 📊 图解
栈(Stack) LIFO:
  push → ← pop
  应用: 函数调用/撤销/括号匹配

队列(Queue) FIFO:
  push → ... → shift
  应用: BFS/任务队列/消息队列
#### 🔧 详解
栈用于函数调用栈、表达式求值、括号匹配、浏览器前进后退。队列用于BFS遍历、任务调度、消息队列。双端队列(deque)两端都可以进出。优先队列用堆实现。

#### 💻 代码
// 栈实现
const stack=[];
stack.push(1);stack.push(2);
stack.pop(); // 2

// 队列实现
const queue=[];
queue.push(1);queue.push(2);
queue.shift(); // 1

// 用栈实现队列
class MyQueue {
  in=[]; out=[];
  push(x){this.in.push(x);}
  pop(){
    if(!this.out.length){
      while(this.in.length) this.out.push(this.in.pop());
    }
    return this.out.pop();
  }
}
#### ❓ 追问
如何用两个栈实现队列？答：输入栈push，输出栈pop(空时从输入栈倒过来)。优先队列的实现？答：最小堆/最大堆。

---
## 7. 哈希表？

> **难度**: medium | **分类**: 数据结构 | **ID**: 241

#### 🎯 本质
哈希表通过**哈希函数映射键到数组索引**实现O(1)平均查找。冲突用链地址法/开放寻址法解决。

#### 🧒 类比
哈希表像图书馆编号系统——给每本书一个编号(哈希)，直接去对应书架取。

#### 📊 图解
哈希表结构:
key → hash函数 → 索引 → bucket

冲突解决:
1.链地址法: bucket存链表
2.开放寻址: 找下一个空位
3.再哈希: 换个哈希函数
#### 🔧 详解
哈希函数将键映射到有限索引空间。好的哈希函数分布均匀减少冲突。链地址法每个桶存链表(或树)。开放寻址法冲突时线性探测/二次探测/双重哈希。负载因子=元素数/桶数，超过阈值扩容。

#### 💻 代码
// JS对象即哈希表
const map={};
map['key']='value';
map['key']; // O(1)

// Map
const m=new Map();
m.set('key','value');
m.get('key'); // O(1)

// 简易哈希表
class HashTable {
  table=new Array(127);
  hash(key){
    let h=0;
    for(const c of key) h+=c.charCodeAt(0);
    return h%this.table.length;
  }
  set(k,v){
    const i=this.hash(k);
    this.table[i]=this.table[i]||[];
    this.table[i].push([k,v]);
  }
}
#### ❓ 追问
Map和Object的区别？答：Map有序、任意键类型、有size属性。什么是完美哈希？答：无冲突的哈希函数。

---
## 8. 树的遍历？

> **难度**: hard | **分类**: 数据结构 | **ID**: 242

#### 🎯 本质
树遍历有**DFS(前/中/后序)**和**BFS(层序)**。前序根→左→右，中序左→根→右，后序左→右→根。

#### 🧒 类比
遍历像参观公司大楼——前序先看老板再看部门，中序先看左部门再看老板，层序逐层参观。

#### 📊 图解
DFS遍历:
前序: 根→左→右
中序: 左→根→右
后序: 左→右→根

BFS遍历:
层序: 逐层从左到右

递归 vs 迭代(栈/队列)
#### 🔧 详解
前序用于复制树、序列化。中序对BST得到有序序列。后序用于删除树(先删子节点)、计算目录大小。层序用队列BFS。迭代实现：前/中/后序用栈，层序用队列。Morris遍历O(1)空间。

#### 💻 代码
// 递归遍历
function inorder(root,res=[]){
  if(!root) return res;
  inorder(root.left,res);
  res.push(root.val);
  inorder(root.right,res);
  return res;
}
// 迭代中序
function inorderIter(root){
  const stack=[],res=[];
  let curr=root;
  while(curr||stack.length){
    while(curr){stack.push(curr);curr=curr.left;}
    curr=stack.pop();
    res.push(curr.val);
    curr=curr.right;
  }
  return res;
}
#### ❓ 追问
什么是Morris遍历？答：O(1)空间复杂度的中序遍历，利用线索二叉树思想。BST的中序遍历特点？答：得到升序序列。

---
## 9. 二叉搜索树(BST)？

> **难度**: medium | **分类**: 数据结构 | **ID**: 243

#### 🎯 本质
BST是**有序二叉树**：左子树BST性质:
  左子树所有值 
#### 🔧 详解
BST的核心是二分查找思想。查找时比较目标与当前节点决定走左还是右。插入按大小找到空位。删除分三种：叶节点直接删、一个子节点用子节点替代、两个子节点用后继(或前驱)替代。平衡BST(AVL/红黑树)保证O(logn)。

#### 💻 代码
// BST实现
class BSTNode {
  constructor(val){this.val=val;this.left=this.right=null;}
}
class BST {
  root=null;
  insert(val){
    const node=new BSTNode(val);
    if(!this.root){this.root=node;return;}
    let curr=this.root;
    while(true){
      if(val
#### ❓ 追问
AVL树和红黑树的区别？答：AVL严格平衡(高度差≤1)，红黑树近似平衡(操作更快)。

---
## 10. 堆和优先队列？

> **难度**: hard | **分类**: 数据结构 | **ID**: 244

#### 🎯 本质
堆是完全二叉树：**最大堆**根最大、**最小堆**根最小。用数组表示(父子索引关系)。优先队列用堆实现。

#### 🧒 类比
堆像企业层级——CEO(堆顶)最大/最小，下属可以不如老板但子树各自合规。

#### 📊 图解
数组表示:
  i的父: (i-1)>>1
  i的左子: 2i+1
  i的右子: 2i+2

操作:
  插入: 尾部加入→上浮 O(logn)
  取堆顶: 尾部替换→下沉 O(logn)
  建堆: O(n)(从底向上)
#### 🔧 详解
堆是完全二叉树用数组存储不需要指针。插入在末尾添加然后上浮(sift up)。删除堆顶用末尾元素替换然后下沉(sift down)。建堆可以从底向上O(n)(不是O(nlogn))。JS没有内置堆需要自己实现或用库。

#### 💻 代码
// 最小堆
class MinHeap {
  heap=[];
  push(val){
    this.heap.push(val);
    this._siftUp(this.heap.length-1);
  }
  pop(){
    const top=this.heap[0];
    const last=this.heap.pop();
    if(this.heap.length){
      this.heap[0]=last;
      this._siftDown(0);
    }
    return top;
  }
  _siftUp(i){
    while(i>0){
      const p=(i-1)>>1;
      if(this.heap[p]
#### ❓ 追问
建堆为什么是O(n)不是O(nlogn)？答：大部分节点在底层不需要移动很远。TopK问题怎么解？答：维护大小为K的最小堆。

---
## 11. 图的基础和遍历？

> **难度**: medium | **分类**: 数据结构 | **ID**: 245

#### 🎯 本质
图由**顶点和边**组成。存储：邻接矩阵/邻接表。遍历：DFS(深度优先)/BFS(广度优先)。

#### 🧒 类比
图像社交网络——每个人(顶点)通过关系(边)连接，可以用深度(DFS)或广度(BFS)方式探索。

#### 📊 图解
存储:
邻接矩阵: A[i][j]=1/0 (空间O(V²))
邻接表: map{v:[neighbors]} (空间O(V+E))

DFS: 栈/递归
BFS: 队列

有向 vs 无向
有权 vs 无权
#### 🔧 详解
邻接矩阵适合稠密图(空间O(V²))。邻接表适合稀疏图(空间O(V+E))。DFS用栈(或递归)深入探索，适合路径/连通性。BFS用队列逐层扩展，适合最短路径(无权图)。有向图需考虑入度/出度。

#### 💻 代码
// 邻接表 + BFS
function bfs(graph,start){
  const visited=new Set([start]);
  const queue=[start];
  const result=[];
  while(queue.length){
    const node=queue.shift();
    result.push(node);
    for(const neighbor of graph[node]){
      if(!visited.has(neighbor)){
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return result;
}
#### ❓ 追问
如何检测图中的环？答：DFS+回溯或拓扑排序(有向图)。Dijkstra算法？答：单源最短路径(非负权)。

---
## 12. Set和Map数据结构？

> **难度**: easy | **分类**: 数据结构 | **ID**: 246

#### 🎯 本质
**Set**存储唯一值的集合。**Map**存储键值对。ES6引入，查找O(1)。

#### 🧒 类比
Set像去重收纳盒，Map像贴了标签的抽屉柜——标签(key)对应抽屉(value)。

#### 📊 图解
Set: 唯一值集合
  add/delete/has O(1)
  自动去重

Map: 键值对
  set/get/delete/has O(1)
  任意类型作键
  保持插入顺序
#### 🔧 详解
Set用于去重、成员检测。Map用于需要非字符串键的场景。WeakSet/WeakSet是弱引用版本不影响GC。Map和Object的区别：Map有序、可迭代、任意键类型、有size属性。

#### 💻 代码
// Set去重
const unique=[...new Set([1,2,2,3,3])]; // [1,2,3]
// 交集
const intersect=new Set([...a].filter(x=>b.has(x)));

// Map
const m=new Map();
m.set({id:1},'user1'); // 对象作键
m.set(NaN,'not a number'); // NaN作键
m.get(m.keys().next().value); // user1

// WeakMap(弱引用)
const wm=new WeakMap();
let obj={a:1};
wm.set(obj,'data');
obj=null; // 可被GC回收
#### ❓ 追问
WeakMap的用途？答：关联私有数据到对象、缓存计算结果。Map和Object的性能差异？答：频繁增删Map更快。

---
## 13. Trie前缀树？

> **难度**: medium | **分类**: 数据结构 | **ID**: 247

#### 🎯 本质
Trie是**字符串前缀匹配**的高效树结构。每个节点代表一个字符，从根到叶的路径组成字符串。

#### 🧒 类比
Trie像字典目录——按字母逐级查找，快速找到所有以某前缀开头的词。

#### 📊 图解
结构:
       root
      / | \
     a  b  c
    /|   |  \
   p p   y   a
  /  |   |   |
 p   t   e   t

查找: O(m) m=字符串长度
空间: O(总字符数)
#### 🔧 详解
Trie查找/插入时间与字符串长度有关与总词数无关。根节点不存字符。每个节点有children映射和isEnd标记。应用：自动补全、拼写检查、IP路由表。空间优化：压缩Trie(Radix Tree)合并单分支。

#### 💻 代码
// Trie实现
class TrieNode {
  children={};
  isEnd=false;
}
class Trie {
  root=new TrieNode();
  insert(word){
    let node=this.root;
    for(const c of word){
      if(!node.children[c]) node.children[c]=new TrieNode();
      node=node.children[c];
    }
    node.isEnd=true;
  }
  search(word){
    let node=this._traverse(word);
    return !!node?.isEnd;
  }
  startsWith(prefix){return !!this._traverse(prefix);}
  _traverse(s){
    let node=this.root;
    for(const c of s){
      if(!node.children[c]) return null;
      node=node.children[c];
    }
    return node;
  }
}
#### ❓ 追问
Trie和哈希表查字符串的对比？答：Trie支持前缀搜索，哈希表只支持精确匹配。

---
## 14. LRU缓存？

> **难度**: medium | **分类**: 数据结构 | **ID**: 248

#### 🎯 本质
LRU(最近最少使用)缓存淘汰**最久未被访问**的元素。用**Map(有序)**或**哈希表+双向链表**实现。

#### 🧒 类比
LRU像冰箱——空间有限先吃快过期的(最久没用的)。

#### 📊 图解
实现:
  get(key): O(1) 访问并移到最前
  put(key,val): O(1) 添加/更新
  容量满: 删除最久未用(尾部)

数据结构:
  Map(保持插入顺序) 或
  哈希表 + 双向链表
#### 🔧 详解
Map保持插入顺序，访问后删除再添加就移到最新位置。容量满时删除第一个(最老的)。双向链表实现：新数据插头部，满时删尾部，访问时移到头部。O(1)查找用Map，O(1)调整顺序用链表。

#### 💻 代码
// Map实现LRU
class LRUCache {
  constructor(capacity){this.cap=capacity;this.cache=new Map();}
  get(key){
    if(!this.cache.has(key)) return -1;
    const val=this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key,val);
    return val;
  }
  put(key,val){
    if(this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key,val);
    if(this.cache.size>this.cap){
      const oldest=this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
  }
}
#### ❓ 追问
为什么用双向链表不用单向？答：删除节点需要O(1)修改前驱指针。LFU和LRU的区别？答：LFU按访问频率淘汰，LRU按访问时间。

---
## 15. 并查集(Union-Find)？

> **难度**: hard | **分类**: 数据结构 | **ID**: 249

#### 🎯 本质
并查集处理**不相交集合的合并和查询**。路径压缩+按秩合并实现近乎O(1)操作。

#### 🧒 类比
并查集像社交圈子——查找两个人是否同一圈子(查询)，合并两个圈子(合并)。

#### 📊 图解
操作:
  find(x): 查找x的根(代表)
  union(x,y): 合并x和y所在集合

优化:
  路径压缩: find时扁平化
  按秩合并: 矮树挂高树下

均摊: O(α(n))≈O(1)
#### 🔧 详解
每个元素有一个parent指针指向父节点，根节点的parent指向自己。find递归向上找根。路径压缩在find时将路径上所有节点直接连到根。按秩合并将较矮的树挂在较高的树下。两者结合均摊复杂度接近常数。应用：连通性检测、最小生成树(Kruskal)。

#### 💻 代码
// 并查集实现
class UnionFind {
  parent; rank;
  constructor(n){
    this.parent=Array.from({length:n},(_,i)=>i);
    this.rank=new Array(n).fill(0);
  }
  find(x){
    if(this.parent[x]!==x)
      this.parent[x]=this.find(this.parent[x]); // 路径压缩
    return this.parent[x];
  }
  union(x,y){
    const px=this.find(x), py=this.find(y);
    if(px===py) return;
    if(this.rank[px]this.rank[py]) this.parent[py]=px;
    else {this.parent[py]=px; this.rank[px]++;}
  }
}
#### ❓ 追问
α(n)是什么？答：反阿克曼函数增长极慢n<10^600时α(n)<5。

---
## 16. 布隆过滤器？

> **难度**: medium | **分类**: 数据结构 | **ID**: 250

#### 🎯 本质
布隆过滤器是**空间高效的概率数据结构**，判断元素**可能存在或一定不存在**。有假阳性无假阴性。

#### 🧒 类比
布隆过滤器像粗略检查——说'有'可能看走眼(假阳性)，说'没有'一定没有。

#### 📊 图解
结构: 位数组 + 多个哈希函数

插入: 元素→多个哈希→对应位置1
查询: 所有哈希位都是1→可能存在
      任一位为0→一定不存在

假阳性率: 可控(调参数)
#### 🔧 详解
用k个哈希函数将元素映射到位数组的k个位置。所有位置都是1说明可能存在(可能被其他元素置1)。任一位置是0说明一定不存在。增加位数组大小和哈希函数数量降低假阳性率。不能删除(Counting Bloom Filter可以)。

#### 💻 代码
// 布隆过滤器
class BloomFilter {
  constructor(size=1000, numHashes=3){
    this.bits=new Array(size).fill(false);
    this.size=size;
    this.numHashes=numHashes;
  }
  _hashes(str){
    const hashes=[];
    for(let i=0;ithis.bits[i]=true);}
  mightContain(str){return this._hashes(str).every(i=>this.bits[i]);}
}
#### ❓ 追问
什么时候用布隆过滤器？答：缓存穿透防护、爬虫URL去重、垃圾邮件过滤。

---
