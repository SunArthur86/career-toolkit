# 算法-树

> 共 15 题

## 1. 二叉树的前中后序遍历？

> **难度**: medium | **分类**: 算法-树 | **ID**: 89

#### 🎯 本质
二叉树遍历是按照特定规则**访问每个节点恰好一次**。前序（根左右）、中序（左根右）、后序（左右根）是DFS深度优先的三种顺序，层序是BFS广度优先。

#### 🧒 类比
把树想象成公司组织架构——前序是老板先发言再听下属汇报，中序是先听左边的汇报再老板发言再右边，后序是先听所有下属汇报最后老板总结。层序是按楼层从上到下、每层从左到右逐个听。

#### 📊 图解
示例树:
       1
      / 
     2   3
    / \   
   4   5   6

前序(根→左→右): 1 2 4 5 3 6
中序(左→根→右): 4 2 5 1 3 6
后序(左→右→根): 4 5 2 6 3 1
层序(BFS):       1 2 3 4 5 6

递归模板:
  function traverse(node) {
    if (!node) return;
    // 前序: 操作放这里
    traverse(node.left);
    // 中序: 操作放这里
    traverse(node.right);
    // 后序: 操作放这里
  }

迭代统一写法(用栈模拟递归):
  栈中存 null 作为标记
  遇到 null 时才真正访问节点
#### 🔧 详解
**递归**最简洁，利用调用栈自动回溯。**迭代**用显式栈模拟递归过程：前序和中序较直观，后序稍复杂（需要标记右子树是否已访问）。Morris遍历可以实现O(1)空间复杂度的中序遍历（利用线索二叉树临时修改指针）。BST的中序遍历结果是有序序列，这是一个重要性质。

#### 💻 代码
// 递归实现
function preorder(root, res = []) {
  if (!root) return res;
  res.push(root.val);
  preorder(root.left, res);
  preorder(root.right, res);
  return res;
}

// 迭代-前序遍历(栈)
function preorderIter(root) {
  if (!root) return [];
  const res = [], stack = [root];
  while (stack.length) {
    const node = stack.pop();
    res.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return res;
}

// 迭代-中序遍历
function inorderIter(root) {
  const res = [], stack = [];
  let curr = root;
  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);
      curr = curr.left;
    }
    curr = stack.pop();
    res.push(curr.val);
    curr = curr.right;
  }
  return res;
}

// 层序遍历(BFS)
function levelOrder(root) {
  if (!root) return [];
  const res = [], queue = [root];
  while (queue.length) {
    const node = queue.shift();
    res.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return res;
}
#### ❓ 追问
如何判断两棵树是否相同？答：递归比较根节点值+左子树+右子树。如何用前序+中序还原二叉树？答：前序第一个元素是根，在中序中找到根的位置，左边是左子树、右边是右子树，递归构建。

---
## 2. AVL树和红黑树的区别？

> **难度**: hard | **分类**: 算法-树 | **ID**: 90

#### 🎯 本质
两者都是**自平衡二叉搜索树**，但平衡标准不同：AVL树要求**严格平衡**（左右子树高度差不超过1），红黑树要求**近似平衡**（最长路径不超过最短路径的2倍）。严格平衡查找更快，近似平衡增删更快。

#### 🧒 类比
AVL像严格的老板——团队工作量稍有失衡就立刻调整（频繁旋转）。红黑树像宽松的老板——只要没有严重失衡就不管（旋转少），所以团队运转（增删）更顺畅。

#### 📊 图解
AVL树:
  平衡因子 = 左子树高 - 右子树高
  要求: |平衡因子| 
#### 🔧 详解
**AVL树**适合查找密集的场景（如数据库索引、内存中的字典），因为更严格平衡意味着树更矮，查找路径更短。**红黑树**适合增删频繁的场景（如标准库的map/set、Linux进程调度CFS），因为增删后最多3次旋转就能恢复平衡。实际工程中红黑树更常用，因为综合性能更好。

#### 💻 代码
// AVL树节点(简化插入)
class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  getHeight(node) {
    return node ? node.height : 0;
  }
  getBalance(node) {
    return node
      ? this.getHeight(node.left) - this.getHeight(node.right)
      : 0;
  }
  rightRotate(y) {
    const x = y.left;
    y.left = x.right;
    x.right = y;
    y.height = 1 + Math.max(
      this.getHeight(y.left), this.getHeight(y.right));
    x.height = 1 + Math.max(
      this.getHeight(x.left), this.getHeight(x.right));
    return x;
  }
  insert(node, val) {
    if (!node) return new AVLNode(val);
    if (val  1 && val  node.right.val) {
      node.right = this.rightRotate(node.right);
      return this.rightRotate(node); // 简化
    }
    return node;
  }
}
#### ❓ 追问
为什么Java的TreeMap用红黑树不用AVL？答：TreeMap需要频繁增删，红黑树增删性能更好（旋转次数少）。B+树和红黑树的区别？答：B+树是多路搜索树（一个节点存多个key），适合磁盘IO（减少IO次数），广泛用于数据库索引；红黑树是二叉树，适合内存操作。

---
## 3. 二叉树遍历？

> **难度**: easy | **分类**: 算法-树 | **ID**: 418

#### 🎯 本质
三种遍历：**前序(根左右)、中序(左根右)、后序(左右根)**。DFS递归或栈迭代。

#### 🧒 类比
遍历像参观展览——前序先看根再看分支，中序先看左展品再看根，后序最后看根。

#### 📊 图解
前序: 根→左→右
中序: 左→根→右
后序: 左→右→根
层序: BFS逐层
#### 🔧 详解
前序用于复制树。中序用于BST得到有序序列。后序用于删除树(先删子节点)。层序(BFS)用于按层处理。

#### 💻 代码

```
function preorder(root,res=[]){  if(!root) return res;  res.push(root.val);  preorder(root.left,res);  preorder(root.right,res);  return res;}function inorder(root,res=[]){  if(!root) return res;  inorder(root.left,res);  res.push(root.val);  inorder(root.right,res);  return res;}
```

#### ❓ 追问
迭代版中序遍历？答：用栈模拟递归，先一路向左压栈，弹出访问再走右。

---
## 4. 二叉树的最大深度？

> **难度**: medium | **分类**: 算法-树 | **ID**: 419

#### 🎯 本质
递归：maxDepth=max(左深度,右深度)+1。BFS：记录层数。

#### 🧒 类比
求深度像量楼高——左边量一下右边量一下取高的加一层。

#### 📊 图解
maxDepth(root):
  if !root: return 0
  return max(maxDepth(left),maxDepth(right))+1
#### 🔧 详解
递归求左右子树深度取最大值+1。也可以用BFS层序遍历记录层数。时间O(n)空间O(h)。

#### 💻 代码

```
function maxDepth(root){  if(!root) return 0;  return 1+Math.max(maxDepth(root.left),maxDepth(root.right));}
```

#### ❓ 追问
最小深度怎么求？答：注意单分支情况(一边为空要取另一边)。

---
## 5. 翻转二叉树？

> **难度**: medium | **分类**: 算法-树 | **ID**: 420

#### 🎯 本质
翻转：递归**交换每个节点的左右子树**。

#### 🧒 类比
翻转二叉树像照镜子——左右互换。

#### 📊 图解
invert(root):
  swap(left,right)
  invert(left)
  invert(right)
#### 🔧 详解
对每个节点交换左右子树。递归或BFS都可以。著名的Homebrew作者Google面试题。

#### 💻 代码

```
function invertTree(root){  if(!root) return null;  [root.left,root.right]=[root.right,root.left];  invertTree(root.left);  invertTree(root.right);  return root;}
```

#### ❓ 追问
可以迭代吗？答：可以，用队列BFS每层交换。

---
## 6. 验证BST？

> **难度**: medium | **分类**: 算法-树 | **ID**: 421

#### 🎯 本质
验证BST：**中序遍历有序**，或递归验证范围(min,max)。

#### 🧒 类比
验证BST像检查排序——左边的必须比根小，右边的必须比根大。

#### 📊 图解
isValid(node,min,max):
  if !node: true
  if node.val=max: false
  return isValid(left,min,val) && isValid(right,val,max)
#### 🔧 详解
方法一：中序遍历检查是否严格递增。方法二：递归传递范围(min,max)验证每个节点在范围内。

#### 💻 代码

```
function isValidBST(root){  function validate(node,min,max){    if(!node) return true;    if(node.val=max) return false;    return validate(node.left,min,node.val)&&validate(node.right,node.val,max);  }  return validate(root,-Infinity,Infinity);}
```

#### ❓ 追问
为什么用<=而不是<?答：BST要求严格大于/小于，相等不合法。

---
## 7. 二叉树的最近公共祖先？

> **难度**: hard | **分类**: 算法-树 | **ID**: 422

#### 🎯 本质
LCA：**递归**在左右子树中找p和q。左右都找到则当前节点是LCA。

#### 🧒 类比
LCA像找最近共同祖先——在族谱中两个人最近的共同长辈。

#### 📊 图解
LCA(root,p,q):
  if !root||root==p||root==q: return root
  left=LCA(left,p,q)
  right=LCA(right,p,q)
  if left&&right: return root
  return left||right
#### 🔧 详解
递归在左右子树中搜索。如果左右子树各找到一个说明当前节点就是LCA。如果只有一边找到则LCA在那一侧。

#### 💻 代码

```
function lowestCommonAncestor(root,p,q){  if(!root||root===p||root===q) return root;  const left=lowestCommonAncestor(root.left,p,q);  const right=lowestCommonAncestor(root.right,p,q);  if(left&&right) return root;  return left||right;}
```

#### ❓ 追问
BST的LCA可以优化？答：BST可以利用大小关系只搜一边O(h)。

---
## 8. 二叉树层序遍历？

> **难度**: medium | **分类**: 算法-树 | **ID**: 423

#### 🎯 本质
层序遍历：**BFS+队列**，按层收集节点。

#### 🧒 类比
层序遍历像从上到下逐层拍照——先拍第一层，再拍第二层...

#### 📊 图解
queue=[root]
while queue:
  level=queue.length个节点
  for each: collect, push children
#### 🔧 详解
用队列BFS。每轮处理当前层的所有节点，同时收集下一层的节点。可以用level变量或双层循环控制。

#### 💻 代码

```
function levelOrder(root){  if(!root) return [];  const result=[],queue=[root];  while(queue.length){    const level=[],size=queue.length;    for(let i=0;i<size;i++){      const node=queue.shift();      level.push(node.val);      if(node.left) queue.push(node.left);      if(node.right) queue.push(node.right);    }    result.push(level);  }  return result;}
```

#### ❓ 追问
如何之字形层序遍历？答：偶数层reverse(level)。

---
## 9. 路径总和？

> **难度**: medium | **分类**: 算法-树 | **ID**: 424

#### 🎯 本质
判断二叉树中是否有**根到叶路径和等于target**。DFS递归。

#### 🧒 类比
路径总和像从根走到叶——一路上数字加起来是否等于目标值。

#### 📊 图解
hasPathSum(root,sum):
  if !root: false
  if leaf&&val==sum: true
  return hasPathSum(left,sum-val)||hasPathSum(right,sum-val)
#### 🔧 详解
递归减去当前节点值。到叶子节点时判断剩余值是否等于叶子值。

#### 💻 代码

```
function hasPathSum(root,sum){  if(!root) return false;  if(!root.left&&!root.right) return sum===root.val;  return hasPathSum(root.left,sum-root.val)||hasPathSum(root.right,sum-root.val);}
```

#### ❓ 追问
所有路径怎么收集？答：递归时传递path数组。

---
## 10. 从前序和中序构造二叉树？

> **难度**: hard | **分类**: 算法-树 | **ID**: 425

#### 🎯 本质
前序**确定根**，中序**确定左右子树范围**。递归构建。

#### 🧒 类比
前序+中序构造像拼图——前序告诉你第一个是谁(根)，中序告诉你左右分别是什么。

#### 📊 图解
preorder: [根][左][右]
inorder:  [左][根][右]
1.前序首元素=根
2.中序找根位置分左右
3.递归
#### 🔧 详解
前序第一个元素是根。在中序中找到根的位置，左边是左子树右边是右子树。递归构建左右子树。

#### 💻 代码

```
function buildTree(preorder,inorder){  if(!preorder.length) return null;  const rootVal=preorder[0];  const rootIdx=inorder.indexOf(rootVal);  return {    val:rootVal,    left:buildTree(preorder.slice(1,rootIdx+1),inorder.slice(0,rootIdx)),    right:buildTree(preorder.slice(rootIdx+1),inorder.slice(rootIdx+1))  };}
```

#### ❓ 追问
中序+后序可以构造吗？答：可以，后序最后一个是根。前序+后序呢？答：不能确定唯一(没有中序无法分左右)。

---
## 11. 二叉树的直径？

> **难度**: medium | **分类**: 算法-树 | **ID**: 426

#### 🎯 本质
直径=**任意两节点间最长路径**。DFS求每个节点的左右深度之和取最大。

#### 🧒 类比
直径像量树的展开宽度——经过某个节点的最远两个叶子之间的距离。

#### 📊 图解
diameter=max(leftDepth+rightDepth)
全局max
#### 🔧 详解
对每个节点计算左子树深度+右子树深度(经过该节点的路径长度)。全局取最大值就是直径。

#### 💻 代码

```
function diameterOfBinaryTree(root){  let max=0;  function depth(node){    if(!node) return 0;    const left=depth(node.left),right=depth(node.right);    max=Math.max(max,left+right);    return 1+Math.max(left,right);  }  depth(root);  return max;}
```

#### ❓ 追问
时间复杂度？答：O(n)每个节点访问一次。

---
## 12. 对称二叉树？

> **难度**: easy | **分类**: 算法-树 | **ID**: 427

#### 🎯 本质
对称：**左子树和右子树互为镜像**。递归比较left.left==right.right。

#### 🧒 类比
对称二叉树像照镜子——左边的镜子是右边的。

#### 📊 图解
isSymmetric(left,right):
  if !left&&!right: true
  if !left||!right: false
  if left.val!=right.val: false
  return isSym(l.left,r.right)&&isSym(l.right,r.left)
#### 🔧 详解
递归同时遍历左子树和右子树。左的左和右的右比较，左的右和右的左比较。

#### 💻 代码

```
function isSymmetric(root){  if(!root) return true;  function isMirror(l,r){    if(!l&&!r) return true;    if(!l||!r) return false;    return l.val===r.val&&isMirror(l.left,r.right)&&isMirror(l.right,r.left);  }  return isMirror(root.left,root.right);}
```

#### ❓ 追问
可以迭代吗？答：可以，用队列两两比较。

---
## 13. 二叉树中的最大路径和？

> **难度**: hard | **分类**: 算法-树 | **ID**: 428

#### 🎯 本质
最大路径和：**任意节点到任意节点**的最大路径和。DFS。

#### 🧒 类比
最大路径和像找最佳路线——可以经过任何节点，找收益最大的路径。

#### 📊 图解
gain(node)=max(node.val, node.val+max(left,right))
ans=max(ans, node.val+left+right)
#### 🔧 详解
对每个节点计算：以该节点为根的最大贡献(选左或右或都不选)。同时计算经过该节点的完整路径(左+根+右)。全局取最大。

#### 💻 代码

```
function maxPathSum(root){  let max=-Infinity;  function gain(node){    if(!node) return 0;    const left=Math.max(0,gain(node.left));    const right=Math.max(0,gain(node.right));    max=Math.max(max,node.val+left+right);    return node.val+Math.max(left,right);  }  gain(root);return max;}
```

#### ❓ 追问
为什么贡献取max(0,gain)？答：负贡献不如不选。

---
## 14. 合并二叉树？

> **难度**: medium | **分类**: 算法-树 | **ID**: 429

#### 🎯 本质
两个二叉树**对应位置值相加**合并。同时遍历。

#### 🧒 类比
合并二叉树像合并两层楼——相同位置加起来。

#### 📊 图解
merge(t1,t2):
  if !t1: return t2
  if !t2: return t1
  t1.val+=t2.val
  t1.left=merge(t1.left,t2.left)
  t1.right=merge(t1.right,t2.right)
#### 🔧 详解
同时遍历两棵树。对应位置都有节点则值相加。只有一棵有则直接用那棵的节点。可以新建树也可以在原树上修改。

#### 💻 代码

```
function mergeTrees(t1,t2){  if(!t1) return t2;  if(!t2) return t1;  t1.val+=t2.val;  t1.left=mergeTrees(t1.left,t2.left);  t1.right=mergeTrees(t1.right,t2.right);  return t1;}
```

#### ❓ 追问
可以迭代吗？答：可以，用两个队列同时BFS。

---
## 15. 二叉搜索树的第K小元素？

> **难度**: medium | **分类**: 算法-树 | **ID**: 430

#### 🎯 本质
BST中序遍历是**有序序列**，第K个就是第K小。

#### 🧒 类比
BST找第K小像翻有序字典——中序遍历就是按字母顺序翻到第K个。

#### 📊 图解

```
inorder traversal → 第K个
```

#### 🔧 详解
BST的中序遍历按升序排列。遍历到第K个返回即可。优化：提前终止不需完整遍历。

#### 💻 代码

```
function kthSmallest(root,k){  const stack=[];  let node=root;  while(node||stack.length){    while(node){stack.push(node);node=node.left;}    node=stack.pop();    if(--k===0) return node.val;    node=node.right;  }}
```

#### ❓ 追问
如果频繁查找？答：在每个节点记录左子树大小可以在O(h)找到。

---
