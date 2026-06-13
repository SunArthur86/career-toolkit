# 算法-排序

> 共 17 题

## 1. 冒泡排序？

> **难度**: easy | **分类**: 算法-排序 | **ID**: 37

#### 🎯 本质
相邻元素两两比较，每轮把最大值"冒泡"到末尾。

#### 🧒 类比
像水中的气泡——较大的泡泡逐渐上浮到水面。

#### 💻 代码
function bubbleSort(arr) {
const n = arr.length;
for (let i = 0; i  arr[j + 1]) {
[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
swapped = true;
}
}
if (!swapped) break; // 优化：已有序则停止
}
}
#### 📊 复杂度
时间: O(n²) 最优O(n)(已排序)
空间: O(1) 稳定排序
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### ❓ 追问
这个排序的稳定性如何？

---
## 2. 快速排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 38

#### 🎯 本质
选基准(pivot)，小的放左大的放右，**递归排序**左右两部分。平均O(nlogn)。

#### 🧒 类比
像体育课排队——老师选一个同学做标杆，矮的站左边高的站右边。

#### 📊 图解
[3,6,8,10,1,2,1]
pivot=3
[1,2,1]+[3]+[6,8,10]
递归排序左右
#### 🔧 详解
选基准值(首/末/随机/三数取中)。分区：小于pivot放左大于放右。递归排序左右两部分。平均O(nlogn)最坏O(n²)。原地分区不需额外空间。

#### 💻 代码
function quickSort(arr){
  if(arr.length
#### ❓ 追问
快排最坏情况？答：已排序+选首元素→O(n²)。解决？答：随机选pivot或三数取中。

---
## 3. 归并排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 39

#### 🎯 本质
分治法：递归拆成两半，分别排序，再合并两个有序数组。

#### 🧒 类比
像整理扑克牌——把牌堆从中间分成两堆，分别排好序，然后从两堆顶依次取小的放回去。

#### 💻 代码
function mergeSort(arr) {
if (arr.length > 1;
const left = mergeSort(arr.slice(0, mid));
const right = mergeSort(arr.slice(mid));
return merge(left, right);
}
function merge(a, b) {
const res = [];
let i = 0, j = 0;
while (i 
#### 📊 复杂度
时间: O(nlogn) — 最好最坏都是
空间: O(n) — 需要辅助数组
稳定: ✓ — 相等元素不交换
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### ❓ 追问
这个排序的稳定性如何？

---
## 4. 堆排序？

> **难度**: hard | **分类**: 算法-排序 | **ID**: 40

#### 🎯 本质
堆排序利用**最大堆**（Max Heap）数据结构，反复取出堆顶最大元素放到数组末尾，逐步缩小堆的范围，完成原地排序。核心操作是堆化（heapify）。

#### 🧒 类比
像一个公司的晋升制度——每次从所有员工中选出能力最强的放到最高位（堆顶），然后把他调走（放到末尾），再从剩下的人里选，反复操作。

#### 📊 图解
最大堆性质:
  每个节点 >= 其子节点
  根节点 = 最大值

排序过程:
1.建堆:从最后一个非叶节点往前heapify
2.排序:swap(堆顶,末尾)→堆顶下沉→堆大小-1→重复

数组下标关系(0-based):
  parent(i) = (i-1)/2
  left(i)   = 2*i+1
  right(i)  = 2*i+2

时间: O(nlogn) 所有情况
空间: O(1) 原地排序
稳定: ✗ 不稳定排序
#### 🔧 详解
**建堆**时间复杂度是O(n)（不是O(nlogn)，从底向上合并时大部分节点只需少量比较）。每次取堆顶后需对根节点执行**下沉操作**（siftDown），将较小的节点逐步交换到合适位置。堆排序不受数据分布影响，始终O(nlogn)。

#### 💻 代码
function heapSort(arr) {
  const n = arr.length;
  // 建堆:从最后非叶节点开始
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDown(arr, n, i);
  }
  // 排序:逐个取出最大值
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    siftDown(arr, i, 0);
  }
  return arr;
}
function siftDown(arr, size, i) {
  while (true) {
    let max = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l  arr[max]) max = l;
    if (r  arr[max]) max = r;
    if (max === i) break;
    [arr[i], arr[max]] = [arr[max], arr[i]];
    i = max;
  }
}
#### ❓ 追问
堆排序和快排怎么选？答：快排平均更快（缓存友好），但最坏O(n^2)。堆排序保证O(nlogn)且原地，适合内存受限场景。Top-K问题用什么？答：小顶堆，只维护K个最大的元素，O(nlogK)。

---
## 5. 冒泡排序？

> **难度**: easy | **分类**: 算法-排序 | **ID**: 379

#### 🎯 本质
冒泡排序**相邻元素比较交换**，每轮把最大值冒泡到末尾。O(n²)。

#### 🧒 类比
冒泡排序像水中的气泡——大的气泡逐渐往上浮。

#### 📊 图解
for i in range(n):
  for j in range(n-i-1):
    if a[j]>a[j+1]: swap
#### 🔧 详解
每轮遍历比较相邻元素，大值往后换。N轮后有序。可优化：一轮无交换则已有序。

#### 💻 代码
function bubbleSort(arr){
  for(let i=0;iarr[j+1]){[arr[j],arr[j+1]]=[arr[j+1],arr[j]];swapped=true;}
    }
    if(!swapped) break;
  }
  return arr;
}
#### ❓ 追问
冒泡排序的优化？答：加swapped标志，一轮无交换提前退出。

---
## 6. 选择排序？

> **难度**: easy | **分类**: 算法-排序 | **ID**: 380

#### 🎯 本质
选择排序每轮**选出最小值**放到前面。O(n²)不稳定。

#### 🧒 类比
选择排序像排队——每次从人群中选出最矮的排到前面。

#### 📊 图解

```
for i: 找[i,n]最小值→和i交换
```

#### 🔧 详解
每轮在未排序部分找最小值，和当前位置交换。不稳定(交换可能改变相等元素的相对顺序)。

#### 💻 代码
function selectionSort(arr){
  for(let i=0;i
#### ❓ 追问
为什么选择排序不稳定？答：交换可能跳过中间相等的元素。

---
## 7. 插入排序？

> **难度**: easy | **分类**: 算法-排序 | **ID**: 381

#### 🎯 本质
插入排序将元素**插入到已排序部分的正确位置**。O(n²)稳定。

#### 🧒 类比
插入排序像打扑克牌——拿到一张牌插入到手中已排好序的位置。

#### 📊 图解

```
for i: 取arr[i]→向前找位置→插入
```

#### 🔧 详解
将每个元素插入到前面已排序部分的正确位置。对于近乎有序的数组非常快(接近O(n))。

#### 💻 代码
function insertionSort(arr){
  for(let i=1;i=0&&arr[j]>key){arr[j+1]=arr[j];j--;}
    arr[j+1]=key;
  }
  return arr;
}
#### ❓ 追问
插入排序最适合什么场景？答：近乎有序的数组、小规模数据。

---
## 8. 快速排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 382

#### 🎯 本质
快排：**选基准(pivot)→分区(小于/大于pivot)→递归排序分区**。平均O(nlogn)。

#### 🧒 类比
快排像整理书架——选一本书(pivot)，小的放左边大的放右边，再整理两边。

#### 📊 图解
quickSort(arr):
  pivot=arr[0]
  left=[pivot]
  return quickSort(left)+[pivot]+quickSort(right)
#### 🔧 详解
选一个基准值，将数组分为小于和大于基准的两部分。递归排序两部分。平均O(nlogn)最坏O(n²)(已排序+选首元素作基准)。原地分区(partition)不需要额外空间。

#### 💻 代码
function quickSort(arr){
  if(arr.length
#### ❓ 追问
快排最坏情况？答：已排序数组+选首元素作pivot→O(n²)。解决？答：随机选pivot或三数取中。

---
## 9. 归并排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 383

#### 🎯 本质
归并排序：**分治→排序左半→排序右半→合并**。O(nlogn)稳定。

#### 🧒 类比
归并排序像团体赛——先分组比赛(递归)，胜者再比赛(合并)。

#### 📊 图解
mergeSort(arr):
  split→sort left→sort right→merge
#### 🔧 详解
递归将数组一分为二直到单个元素。然后两两合并有序数组。始终O(nlogn)但需要O(n)额外空间。

#### 💻 代码
function mergeSort(arr){
  if(arr.length>1;
  const left=mergeSort(arr.slice(0,mid));
  const right=mergeSort(arr.slice(mid));
  return merge(left,right);
}
function merge(a,b){
  const result=[];let i=0,j=0;
  while(i
#### ❓ 追问
归并排序为什么稳定？答：合并时相等元素左边优先，不改变相对顺序。

---
## 10. 堆排序？

> **难度**: hard | **分类**: 算法-排序 | **ID**: 384

#### 🎯 本质
堆排序利用**最大堆**：建堆→交换堆顶和末尾→下沉调整。O(nlogn)原地。

#### 🧒 类比
堆排序像选拔赛——每次选出最强(堆顶)的放到领奖台(末尾)。

#### 📊 图解
1.建最大堆
2.swap(堆顶,末尾)
3.堆化下沉
4.重复
#### 🔧 详解
先将数组建成最大堆。堆顶是最大值，交换到末尾。对剩余元素重新堆化。重复直到全部有序。

#### 💻 代码
function heapSort(arr){
  const n=arr.length;
  // 建堆
  for(let i=(n>>1)-1;i>=0;i--) heapify(arr,n,i);
  // 排序
  for(let i=n-1;i>0;i--){
    [arr[0],arr[i]]=[arr[i],arr[0]];
    heapify(arr,i,0);
  }
}
function heapify(arr,n,i){
  let largest=i;const l=2*i+1,r=2*i+2;
  if(larr[largest]) largest=l;
  if(rarr[largest]) largest=r;
  if(largest!==i){[arr[i],arr[largest]]=[arr[largest],arr[i]];heapify(arr,n,largest);}
}
#### ❓ 追问
堆排序不稳定。建堆的时间复杂度？答：O(n)从最后一个非叶节点开始。

---
## 11. 排序算法稳定性？

> **难度**: easy | **分类**: 算法-排序 | **ID**: 385

#### 🎯 本质
稳定性：**相等元素排序后保持原来相对顺序**。稳定：冒泡/插入/归并。不稳定：选择/快排/堆排。

#### 🧒 类比
稳定性像排队买票——同样高的人保持原来的前后顺序。

#### 📊 图解
稳定: 冒泡/插入/归并/计数
不稳定: 选择/快排/堆排/希尔
#### 🔧 详解
稳定排序保证相等元素的原始顺序不变。不稳定排序可能改变。实际应用中：对象排序通常需要稳定(先按A排再按B排保持A的顺序)。

#### 💻 代码
// 不稳定示例: 选择排序
[3a, 3b, 1] → [1, 3b, 3a] // 3a和3b交换了
#### ❓ 追问
什么时候需要稳定排序？答：多关键字排序(先按薪资排再按年龄排)。

---
## 12. 计数排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 386

#### 🎯 本质
计数排序**统计每个值出现的次数**然后按顺序输出。O(n+k)稳定。

#### 🧒 类比
计数排序像投票计票——数每个候选人(值)的票数然后宣布结果。

#### 📊 图解

```
count[value]++ → 按count输出
```

#### 🔧 详解
适合值域有限的整数排序。统计每个值出现次数。前缀和计算位置。稳定。但需要O(k)额外空间(k是值域大小)。

#### 💻 代码
function countingSort(arr,max){
  const count=new Array(max+1).fill(0);
  arr.forEach(v=>count[v]++);
  const result=[];let idx=0;
  count.forEach((c,v)=>{for(let i=0;i
#### ❓ 追问
计数排序的局限？答：值域大或非整数不适合。

---
## 13. 桶排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 387

#### 🎯 本质
桶排序将元素**分到不同桶**中，桶内排序后合并。O(n+k)平均。

#### 🧒 类比
桶排序像按成绩分班——先按分数分到不同班(桶)，班内排座次，最后合并。

#### 📊 图解

```
arr → 分桶 → 桶内排序 → 合并
```

#### 🔧 详解
将元素按范围分到桶中。每个桶内用其他排序(如插入排序)。合并所有桶。适合均匀分布的数据。

#### 💻 代码
function bucketSort(arr,bucketSize=5){
  const min=Math.min(...arr),max=Math.max(...arr);
  const bucketCount=Math.floor((max-min)/bucketSize)+1;
  const buckets=Array.from({length:bucketCount},()=>[]);
  arr.forEach(v=>buckets[Math.floor((v-min)/bucketSize)].push(v));
  return buckets.flatMap(b=>insertionSort(b));
}
#### ❓ 追问
桶排序的时间复杂度？答：平均O(n+k)，最坏O(n²)所有元素在一个桶。

---
## 14. 排序算法比较？

> **难度**: hard | **分类**: 算法-排序 | **ID**: 388

#### 🎯 本质
排序选择：**小数据用插入，大数据用快排/归并，整数用计数/基数，需要稳定用归并**。

#### 🧒 类比
选排序算法像选交通工具——短途步行(插入)、中途开车(快排)、长途火车(归并)。

#### 📊 图解
n
#### 🔧 详解
插入排序适合小数据(简单常数小)。快排平均最快(原地+缓存友好)。归并稳定但需要额外空间。V8引擎的Array.sort用TimSort(归并+插入混合)。

#### 💻 代码
// Array.sort内部实现
// V8: TimSort (归并+插入)
// Java: Dual-Pivot QuickSort
// Python: TimSort
[3,1,2].sort((a,b)=>a-b); // [1,2,3]
#### ❓ 追问
TimSort原理？答：找到有序子序列(run)然后归并，小run用插入排序。

---
## 15. 二分查找？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 389

#### 🎯 本质
二分查找在**有序数组**中O(logn)查找目标值。每次排除一半。

#### 🧒 类比
二分查找像翻字典——从中间翻，目标在左就翻左半本，在右就翻右半本。

#### 📊 图解
lo=0, hi=n-1
while(lo>1
  if arr[mid]
#### 🔧 详解
前提：数组有序。每次比较中间值，目标小则搜左半，大则搜右半。O(logn)时间。注意边界条件(lo>1)。

#### 💻 代码
function binarySearch(arr,target){
  let lo=0,hi=arr.length-1;
  while(lo>1);
    if(arr[mid]===target) return mid;
    arr[mid]
#### ❓ 追问
二分查找变体？答：找第一个等于、找最后一个等于、找第一个大于等于。

---
## 16. 希尔排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 390

#### 🎯 本质
希尔排序是**分组插入排序**：按间隔(gap)分组，逐渐缩小gap到1。

#### 🧒 类比
希尔排序像先粗排再精排——先按大间距整理，逐步精细到相邻比较。

#### 📊 图解

```
gap=n/2→gap/2→...→1
```

#### 🔧 详解
按gap分组做插入排序。gap从大到小，最后gap=1就是标准插入排序。但因为前面的分组已基本有序，最后一次插入排序很快。

#### 💻 代码
function shellSort(arr){
  let gap=arr.length>>1;
  while(gap>0){
    for(let i=gap;i=gap&&arr[j-gap]>temp){arr[j]=arr[j-gap];j-=gap;}
      arr[j]=temp;
    }
    gap>>=1;
  }
  return arr;
}
#### ❓ 追问
希尔排序的时间复杂度？答：取决于gap序列，约O(n^1.3)到O(n²)。

---
## 17. 基数排序？

> **难度**: medium | **分类**: 算法-排序 | **ID**: 391

#### 🎯 本质
基数排序按**位数从低到高**排序。O(d*(n+k))稳定。

#### 🧒 类比
基数排序像按数字位数排队——先按个位排队，再按十位，再按百位。

#### 📊 图解

```
按位排序: 个位→十位→百位
```

#### 🔧 详解
从最低位开始排序，每位用稳定排序(通常计数排序)。LSD(最低位优先)适合等长数字。MSD(最高位优先)适合不等长。

#### 💻 代码
function radixSort(arr){
  const max=Math.max(...arr);
  for(let exp=1;max/exp>0;exp*=10)
    countingSortByDigit(arr,exp);
}
function countingSortByDigit(arr,exp){
  const count=new Array(10).fill(0);
  const output=new Array(arr.length);
  arr.forEach(v=>count[Math.floor(v/exp)%10]++);
  for(let i=1;i=0;i--){const d=Math.floor(arr[i]/exp)%10;output[--count[d]]=arr[i];}
  output.forEach((v,i)=>arr[i]=v);
}
#### ❓ 追问
基数排序的局限？答：只适合整数，需要额外O(n)空间。

---
