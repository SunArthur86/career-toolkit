# 算法-搜索

> 共 14 题

## 1. DFS回溯法模板？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 91

#### 🎯 本质
DFS**深度优先**沿一条路走到底再回溯(栈)。BFS**广度优先**逐层遍历(队列)。

#### 🧒 类比
DFS像走迷宫一直往前碰壁再回头，BFS像水波纹一圈圈往外扩散。

#### 📊 图解
    1
   / 
  2   3
 / 
4   5
DFS: 1,2,4,5,3
BFS: 1,2,3,4,5
#### 🔧 详解
DFS用栈(递归)先深入再回溯，适合找路径/连通性。BFS用队列先近后远，适合最短路径。都需要visited防重复。时间O(V+E)。

#### 💻 代码
function dfs(g,s,visited=new Set()){
  visited.add(s);
  for(const n of g[s]) if(!visited.has(n)) dfs(g,n,visited);
}
function bfs(g,s){
  const v=new Set([s]),q=[s];
  while(q.length){const n=q.shift();for(const c of g[n]) if(!v.has(c)){v.add(c);q.push(c);}}
}
#### ❓ 追问
什么时候用DFS/BFS？答：找最短路径用BFS，找所有路径用DFS。

---
## 2. DFS深度优先搜索？

> **难度**: easy | **分类**: 算法-搜索 | **ID**: 392

#### 🎯 本质
DFS沿一条路径**深入到底再回溯**。用栈/递归实现。

#### 🧒 类比
DFS像走迷宫——一直往前走碰壁了就退回上一个岔路口。

#### 📊 图解
DFS(node):
  visit(node)
  for child in children:
    DFS(child)
#### 🔧 详解
从起点出发沿一条路走到底，走不通回溯到上一个岔路口。递归实现(隐式栈)或显式栈。适合找所有路径、连通性问题。

#### 💻 代码

```
function dfs(graph,start,visited=new Set()){  visited.add(start);  console.log(start);  for(const neighbor of graph[start]){    if(!visited.has(neighbor)) dfs(graph,neighbor,visited);  }}
```

#### ❓ 追问
DFS的时间复杂度？答：O(V+E)顶点数+边数。

---
## 3. BFS广度优先搜索？

> **难度**: easy | **分类**: 算法-搜索 | **ID**: 393

#### 🎯 本质
BFS**逐层遍历**：先访问距离近的再访问远的。用队列实现。

#### 🧒 类比
BFS像水波纹——从中心一圈一圈向外扩散。

#### 📊 图解
queue=[start]
while queue:
  node=queue.shift()
  for child: queue.push(child)
#### 🔧 详解
用队列实现。先入队的先处理。适合找最短路径(无权图)、层序遍历。保证先找到的是最短路径。

#### 💻 代码

```
function bfs(graph,start){  const visited=new Set([start]);  const queue=[start];  while(queue.length){    const node=queue.shift();    console.log(node);    for(const neighbor of graph[node]){      if(!visited.has(neighbor)){visited.add(neighbor);queue.push(neighbor);}    }  }}
```

#### ❓ 追问
BFS和DFS的区别？答：BFS用队列逐层，DFS用栈/递归深入。找最短路径用BFS。

---
## 4. 二叉搜索树查找？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 394

#### 🎯 本质
BST：**左search(root,key):
  if !root: return null
  if keyroot: search(right)
  else: found
#### 🔧 详解
BST每个节点：左子树所有值<节点值<右子树所有值。查找时比较目标值决定走左或右。插入和查找平均O(logn)。最坏退化为链表O(n)，用AVL/红黑树保证平衡。

#### 💻 代码

```
function searchBST(root,val){  if(!root) return null;  if(val===root.val) return root;  return val<root.val?searchBST(root.left,val):searchBST(root.right,val);}
```

#### ❓ 追问
BST退化为链表怎么办？答：用AVL树或红黑树保证平衡。

---
## 5. 回溯算法？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 395

#### 🎯 本质
回溯：**试所有可能，不满足条件就退回**(撤销选择)。DFS+剪枝。

#### 🧒 类比
回溯像走迷宫标记路线——走不通就擦掉标记退回上一个岔路口。

#### 📊 图解
backtrack(路径,选择列表):
  if 满足条件: 收集结果
  for 选择 in 选择列表:
    做选择
    backtrack(新路径,新选择)
    撤销选择
#### 🔧 详解
递归尝试所有可能的选择。每次做一个选择递归进入下一层。不满足条件就撤销选择回退(回溯)。适合排列/组合/子集/N皇后等问题。

#### 💻 代码

```
function permute(nums){  const result=[];  function backtrack(path,remaining){    if(!remaining.length){result.push([...path]);return;}    for(let i=0;ij!==i));      path.pop();    }  }  backtrack([],nums);  return result;}
```

#### ❓ 追问
回溯和DFS的关系？答：回溯是DFS的一种应用，加了撤销选择和剪枝。

---
## 6. N皇后问题？

> **难度**: hard | **分类**: 算法-搜索 | **ID**: 396

#### 🎯 本质
N皇后：在N×N棋盘放N个皇后**互不攻击**。回溯+剪枝。

#### 🧒 类比
N皇后像安排座位——N个VIP互不对眼(同行同列同对角线)。

#### 📊 图解
回溯:
for col in row:
  if valid(row,col):
    place(row,col)
    backtrack(row+1)
    remove(row,col)
#### 🔧 详解
逐行放置皇后。每行尝试每一列。检查是否和已放置的皇后冲突(同列/同对角线)。冲突则跳过(剪枝)。不冲突则放置并递归下一行。

#### 💻 代码

```
function solveNQueens(n){  const result=[];  const board=Array(n).fill('.').map(()=>Array(n).fill('.'));  function isValid(row,col){    for(let i=0;i=0&&board[i][col-diff]==='Q') return false;      if(col+diffr.join('')));return;}    for(let col=0;col<n;col++){      if(isValid(row,col)){board[row][col]='Q';backtrack(row+1);board[row][col]='.';}    }  }  backtrack(0);return result;}
```

#### ❓ 追问
N皇后时间复杂度？答：O(N!)每行最多N个选择。

---
## 7. 岛屿数量(网格搜索)？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 397

#### 🎯 本质
网格中**连通的1(陆地)算一个岛屿**。BFS/DFS/并查集。

#### 🧒 类比
数岛屿像从卫星图数岛屿——找到一块陆地就探索整座岛然后标记已访问。

#### 📊 图解
for each cell:
  if '1' and not visited:
    dfs/bfs探索连通区域
    count++
#### 🔧 详解
遍历网格。遇到'1'且未访问时，DFS/BFS探索整个连通区域并标记为已访问。岛屿数量加一。

#### 💻 代码

```
function numIslands(grid){  if(!grid.length) return 0;  const m=grid.length,n=grid[0].length;  let count=0;  function dfs(i,j){    if(i=m||j>=n||grid[i][j]!=='1') return;    grid[i][j]='0';    dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);  }  for(let i=0;i<m;i++)for(let j=0;j<n;j++){    if(grid[i][j]==='1'){dfs(i,j);count++;}  }  return count;}
```

#### ❓ 追问
可以用BFS吗？答：可以，把dfs换成queue+bfs遍历效果一样。

---
## 8. 单词搜索(回溯)？

> **难度**: hard | **分类**: 算法-搜索 | **ID**: 398

#### 🎯 本质
在字符网格中**搜索单词**是否存在(上下左右相邻)。回溯+visited标记。

#### 🧒 类比
单词搜索像在字母方块中找词——从一个字母开始，上下左右连成目标单词。

#### 📊 图解
search(i,j,pos):
  if pos==len: found
  if out||visited: return
  visit
  search 4方向
  unvisit
#### 🔧 详解
从每个格子开始尝试匹配单词首字母。匹配后向四个方向递归匹配下一个字母。用visited防止重复使用。不匹配则回溯。

#### 💻 代码

```
function exist(board,word){  const m=board.length,n=board[0].length;  function dfs(i,j,k){    if(k===word.length) return true;    if(i=m||j>=n||board[i][j]!==word[k]) return false;    const temp=board[i][j];board[i][j]='#';    const found=dfs(i+1,j,k+1)||dfs(i-1,j,k+1)||dfs(i,j+1,k+1)||dfs(i,j-1,k+1);    board[i][j]=temp;return found;  }  for(let i=0;i<m;i++)for(let j=0;j<n;j++){if(dfs(i,j,0))return true;}  return false;}
```

#### ❓ 追问
时间复杂度？答：O(m*n*4^L)L是单词长度。

---
## 9. 全排列？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 399

#### 🎯 本质
全排列：**回溯**生成所有排列。每次选一个元素加入路径，选完回退。

#### 🧒 类比
全排列像排队——N个人排成一排有多少种排法。

#### 📊 图解
backtrack(path):
  if len==n: result
  for num in nums:
    if not in path:
      path.push(num)
      backtrack(path)
      path.pop()
#### 🔧 详解
每个位置尝试放一个未使用的数。递归到底就是一个完整排列。回退后尝试其他选择。

#### 💻 代码

```
function permute(nums){  const result=[];  function bt(path,used){    if(path.length===nums.length){result.push([...path]);return;}    for(let i=0;i<nums.length;i++){      if(used[i]) continue;      used[i]=true;path.push(nums[i]);      bt(path,used);      used[i]=false;path.pop();    }  }  bt([],[]);return result;}
```

#### ❓ 追问
全排列时间复杂度？答：O(n*n!)。

---
## 10. 子集生成？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 400

#### 🎯 本质
子集：**回溯**或**位运算**生成所有子集。每个元素选或不选。

#### 🧒 类比
子集像挑菜——每道菜(元素)选或不选，所有组合就是子集。

#### 📊 图解
backtrack(start,path):
  result.push(path)
  for i in [start,n]:
    path.push(nums[i])
    backtrack(i+1,path)
    path.pop()
#### 🔧 详解
每个元素有选/不选两种选择。回溯法：递归时每个位置尝试放入/不放入。位运算法：n个元素用n位二进制表示。

#### 💻 代码

```
function subsets(nums){  const result=[];  function bt(start,path){    result.push([...path]);    for(let i=start;i<nums.length;i++){      path.push(nums[i]);bt(i+1,path);path.pop();    }  }  bt(0,[]);return result;}
```

#### ❓ 追问
子集数量？答：2^n个。

---
## 11. 组合总和？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 401

#### 🎯 本质
在数组中找出**所有和为target的组合**。数字可重复使用。回溯。

#### 🧒 类比
组合总和像凑钱——用不同面值(数组元素)凑出目标金额(target)。

#### 📊 图解
backtrack(start,path,sum):
  if sum==target: collect
  if sum>target: return
  for i in [start,n]:
    path.push(nums[i])
    backtrack(i,path,sum+nums[i])
    path.pop()
#### 🔧 详解
排序后回溯。start参数避免重复组合(如[2,3]和[3,2])。允许重复使用则递归时传i不是i+1。

#### 💻 代码

```
function combinationSum(candidates,target){  const result=[];  function bt(start,path,sum){    if(sum===target){result.push([...path]);return;}    if(sum>target) return;    for(let i=start;i<candidates.length;i++){      path.push(candidates[i]);bt(i,path,sum+candidates[i]);path.pop();    }  }  bt(0,[],0);return result;}
```

#### ❓ 追问
不允许重复使用数字？答：递归时传i+1而非i。

---
## 12. 线性搜索？

> **难度**: easy | **分类**: 算法-搜索 | **ID**: 402

#### 🎯 本质
线性搜索**逐个比较**找目标。O(n)最简单但最慢。

#### 🧒 类比
线性搜索像翻抽屉——一个一个找直到找到。

#### 📊 图解

```
for i in arr: if i==target: return i
```

#### 🔧 详解
从头到尾逐个比较。最简单的搜索。适合无序数据。O(n)时间O(1)空间。

#### 💻 代码

```
function linearSearch(arr,target){  for(let i=0;i<arr.length;i++){if(arr[i]===target) return i;}  return -1;}
```

#### ❓ 追问
什么时候用线性搜索？答：数据量小或无序时。

---
## 13. 图的遍历？

> **难度**: medium | **分类**: 算法-搜索 | **ID**: 403

#### 🎯 本质
图遍历：**DFS(深度优先)和BFS(广度优先)**。用visited集合防重复。

#### 🧒 类比
图遍历像社交网络——DFS沿着一条关系链深挖，BFS一层层扩展朋友圈。

#### 📊 图解
DFS: 递归/栈
BFS: 队列
都需要visited
#### 🔧 详解
图可能有环需要visited集合。DFS用栈(递归)实现适合找路径。BFS用队列实现适合最短路径。邻接表或邻接矩阵存储图。

#### 💻 代码

```
// 邻接表const graph={A:['B','C'],B:['A','D'],C:['A'],D:['B']};// DFSfunction dfs(g,start,visited=new Set()){  visited.add(start);  for(const n of g[start]) if(!visited.has(n)) dfs(g,n,visited);}// BFSfunction bfs(g,start){  const visited=new Set([start]);  const q=[start];  while(q.length){    const node=q.shift();    for(const n of g[node]) if(!visited.has(n)){visited.add(n);q.push(n);}  }}
```

#### ❓ 追问
邻接表和邻接矩阵的区别？答：邻接表省空间O(V+E)，邻接矩阵O(V²)适合稠密图。

---
## 14. A*搜索算法？

> **难度**: hard | **分类**: 算法-搜索 | **ID**: 404

#### 🎯 本质
A*搜索用**启发函数f=g+h**指导搜索方向，高效找最短路径。

#### 🧒 类比
A*像GPS导航——不仅看已走距离(g)还预估到终点的距离(h)选最优路线。

#### 📊 图解
f(n) = g(n) + h(n)
g: 起点到n的实际代价
h: n到终点的估计代价(启发)
#### 🔧 详解
g是从起点到当前的实际代价。h是启发函数(到终点的估计)。f=g+h是总估计代价。h必须a.f-b.f);    const current=open.shift();    if(current===end) return reconstructPath(current);    for(const neighbor of getNeighbors(current,grid)){      const g=current.g+1;      if(g<neighbor.g){        neighbor.g=g;neighbor.h=heuristic(neighbor,end);        neighbor.f=g+neighbor.h;        if(!open.includes(neighbor)) open.push(neighbor);      }    }  }}
```

#### ❓ 追问
启发函数h怎么选？答：曼哈顿距离(格子)/欧几里得距离(连续)。

---
