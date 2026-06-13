# DDIA

> 共 45 题

## 1. OLTP和OLAP的区别？

> **难度**: medium | **分类**: DDIA | **ID**: 501

#### 🎯 本质
OLTP是**在线事务处理**(增删改查)，OLAP是**在线分析处理**(聚合统计)。两者存储和查询优化方向完全不同。

#### 🧒 类比
OLTP像收银台(高频小额交易)，OLAP像财务室(月底汇总分析)。

#### 📊 图解
OLTP: 行存+索引+低延迟
OLAP: 列存+聚合+高吞吐
#### 🔧 详解
OLTP面向终端用户日常操作，强调低延迟、高并发、ACID事务，通常用行存储(B-Tree)。OLAP面向分析师复杂查询，强调扫描吞吐量、聚合性能，通常用列存储。数据仓库是OLAP典型系统。HTAP尝试在同一系统同时支持两者。

#### 💻 代码
-- OLTP: 用户下单
INSERT INTO orders(user_id,amount) VALUES(123,99.9);
SELECT * FROM orders WHERE id=456;

-- OLAP: 月度分析
SELECT DATE_TRUNC('month',created_at), SUM(amount), COUNT(*)
FROM orders GROUP BY 1 ORDER BY 1;
#### ❓ 追问
HTAP是什么？答：混合事务/分析处理，同一系统同时支持OLTP和OLAP(如TiDB)。

---
## 2. 记录系统和派生数据？

> **难度**: medium | **分类**: DDIA | **ID**: 502

#### 🎯 本质
记录系统(System of Record)是**数据的权威来源**，派生数据(Derived Data)是通过转换计算得到的**冗余副本**。

#### 🧒 类比
记录系统像户口本(原始权威数据)，派生数据像身份证(从户口本派生)。

#### 📊 图解
记录系统 → ETL/流 → 派生数据
(权威来源)        (缓存/索引/物化视图)
#### 🔧 详解
记录系统持有数据真实版本，是单一事实来源。派生数据从记录系统转换而来：缓存、搜索索引、物化视图、ML特征。派生数据可丢弃重建。这种分离让系统更清晰，避免循环依赖。

#### 💻 代码
// 记录系统: MySQL
orders: {id, user_id, amount, status}
// 派生数据1: Redis缓存
redis.set('order:456', JSON.stringify(order))
// 派生数据2: ES搜索索引
es.index({index:'orders',body:{id:456,status:'paid'}})
// 派生数据3: 数据仓库
DW: daily_revenue(date, total, count)
#### ❓ 追问
为什么要区分？答：明确数据归属，避免循环依赖，派生数据可随时重建。

---
## 3. 云原生数据系统架构？

> **难度**: medium | **分类**: DDIA | **ID**: 503

#### 🎯 本质
云原生架构利用**对象存储+无服务器计算+托管服务**构建弹性可扩展的数据系统。

#### 🧒 类比
云原生像共享办公——不自己买楼(服务器)，租工位(云服务)按需付费。

#### 📊 图解
自建: 买服务器+运维
云原生: S3+Lambda+RDS
按需付费+弹性伸缩
#### 🔧 详解
传统自建需采购硬件、容量规划、运维团队。云原生用对象存储(S3)替代HDFS，用托管数据库(RDS)替代自建MySQL，用Serverless替代常驻服务。优势：弹性伸缩、按需付费、减少运维。挑战：厂商锁定、网络延迟、成本失控。

#### 💻 代码
// S3数据湖
s3.putObject({Bucket:'data-lake',Key:'events/2026.csv',Body:data});
// Athena查询S3
SELECT user_id, COUNT(*) FROM events
WHERE dt='2026-01-01' GROUP BY user_id;
// Lambda事件触发
exports.handler=async(event)=>{
  await processS3Event(event.Records[0]);
};
#### ❓ 追问
对象存储和HDFS的区别？答：对象存储不支持追加写只能替换，但无限容量且高可用。

---
## 4. 数据系统三大非功能需求？

> **难度**: easy | **分类**: DDIA | **ID**: 504

#### 🎯 本质
可靠性(Reliability)、可扩展性(Scalability)、可维护性(Maintainability)是数据系统的**三大支柱**。

#### 🧒 类比
三大需求像房子的地基(可靠)、空间(可扩展)、装修(可维护)。

#### 📊 图解
可靠性: 故障时仍正常工作
可扩展性: 负载增长时保持性能
可维护性: 方便运维和演进
#### 🔧 详解
可靠性：系统在故障(硬件/软件/人为)下仍正常工作，通过冗余/容错/监控实现。可扩展性：负载增加时保持性能，通过分片/缓存/异步实现。可维护性：易于运维(监控/自动化)、简单(减少复杂度)、可演化(易于修改)。

#### 💻 代码
// 可靠性: 重试+熔断
async function reliableFetch(url){
  for(let i=0;i
#### ❓ 追问
三者哪个最重要？答：取决于阶段。早期可扩展性，成熟期可靠性，长期可维护性。

---
## 5. 延迟百分位数(P50/P95/P99)？

> **难度**: medium | **分类**: DDIA | **ID**: 505

#### 🎯 本质
百分位数(如**P50/P95/P99**)比平均值更能反映用户体验。尾部延迟影响最敏感的用户。

#### 🧒 类比
百分位数像班级排名——P99意味着99%的同学比你差，只看平均分掩盖极端值。

#### 📊 图解
P50: 50%请求在此时间内
P95: 95%请求在此时间内
P99: 99%请求在此时间内
#### 🔧 详解
平均值容易被长尾请求拉高。P50(中位数)反映典型体验。P95/P99反映尾部延迟。亚马逊发现P99延迟每增100ms销售额降1%。SLA通常用P99承诺。头部延迟由慢请求决定(GC/磁盘争用/排队)。

#### 💻 代码
function percentiles(latencies){
  const s=[...latencies].sort((a,b)=>a-b);
  const p=n=>s[Math.floor(n/100*s.length)];
  return {p50:p(50),p95:p(95),p99:p(99),
    avg:s.reduce((a,b)=>a+b)/s.length};
}
#### ❓ 追问
为什么不用平均值？答：平均值掩盖尾部延迟，一个10秒请求会让100个100ms请求平均值翻倍。

---
## 6. Shared-Nothing架构？

> **难度**: medium | **分类**: DDIA | **ID**: 506

#### 🎯 本质
Shared-Nothing架构中**每个节点独立拥有CPU/内存/磁盘**，通过消息传递协调。是水平扩展的基础。

#### 🧒 类比
Shared-Nothing像独立工作室——各有工具，通过电话(消息)协作。

#### 📊 图解
Shared-Memory: 多CPU共享内存
Shared-Disk: 独立CPU共享磁盘
Shared-Nothing: 独立一切(水平扩展)
#### 🔧 详解
Shared-Memory(单机)：多CPU共享内存，受限于单机容量。Shared-Disk(Oracle RAC)：独立CPU/内存但共享磁盘，磁盘成瓶颈。Shared-Nothing(分布式)：每节点独占CPU+内存+磁盘，通过消息传递协调。无单点瓶颈但增加分布式复杂性。

#### 💻 代码
// Shared-Nothing: 数据分片
const shards={
  s1:{host:'node1',range:'user 1-1000'},
  s2:{host:'node2',range:'user 1001-2000'},
  s3:{host:'node3',range:'user 2001-3000'}
};
function getShard(uid){
  return shards['s'+(uid%3+1)];
}
#### ❓ 追问
Shared-Nothing的挑战？答：跨节点JOIN慢、分布式事务复杂、运维复杂度增加。

---
## 7. 微服务的数据挑战？

> **难度**: medium | **分类**: DDIA | **ID**: 507

#### 🎯 本质
微服务每个服务**独立数据库**带来数据一致性、跨服务查询、分布式事务等挑战。

#### 🧒 类比
微服务数据像各家各户自管冰箱——想吃别家的菜得去请求，不能直接开别人冰箱。

#### 📊 图解
单体: 共享数据库
微服务: 每服务独立DB
挑战: 一致性/跨查/事务
#### 🔧 详解
微服务原则：每个服务有自己的数据库(不共享)。好处：独立部署、独立扩展、技术异构。挑战：(1)数据一致性：不能跨服务事务，需Saga模式。(2)跨服务查询：不能JOIN，需API组合或CQRS。(3)数据冗余：服务间需同步数据。

#### 💻 代码
// Saga模式
async function createOrder(items){
  const order=await orderSvc.create(items);
  try{
    await inventorySvc.reserve(items);
    await paymentSvc.charge(order.total);
  }catch(e){
    await inventorySvc.release(items);
    await orderSvc.cancel(order.id);
  }
}
#### ❓ 追问
Saga的两种模式？答：编排式(中心协调器)和协同式(事件驱动)。

---
## 8. Timeline的推拉模式设计？

> **难度**: hard | **分类**: DDIA | **ID**: 508

#### 🎯 本质
Timeline是经典的**写扩散(Fan-out on write)vs读聚合(Fan-out on read)**问题。

#### 🧒 类比
Timeline像发朋友圈——发的时候推到所有好友信箱(推)，或好友刷新时来拉取(拉)。

#### 📊 图解
推模式: 发帖→写入N个粉丝信箱
拉模式: 刷新→查询M个关注人帖子
混合: 大V拉+普通推
#### 🔧 详解
推模式：发帖时写入所有粉丝信箱(写放大)，适合粉丝少的场景。拉模式：刷新时查询所有关注人最新帖子(读放大)，适合关注多的场景。Twitter混合方案：普通用户推模式，大V(百万粉)拉模式。首页Timeline缓存在Redis。

#### 💻 代码
async function postTweet(uid,content){
  const tid=await db.insert('tweets',{uid,content});
  const followers=await db.getFollowers(uid);
  const pipe=redis.pipeline();
  followers.forEach(f=>{
    pipe.lpush('timeline:'+f,tid);
    pipe.ltrim('timeline:'+f,0,999);
  });
  await pipe.exec();
}
#### ❓ 追问
如何处理热点用户？答：大V用拉模式，普通用户用推模式。

---
## 9. Serverless数据栈和DataFusion？

> **难度**: medium | **分类**: DDIA | **ID**: 509

#### 🎯 本质
现代数据栈用**DataFusion+对象存储+SQL引擎**构建无服务器分析平台，按查询付费。

#### 🧒 类比
Serverless数据栈像共享厨房——自带食材(S3)，用公共厨具(DataFusion)做菜，按用时付费。

#### 📊 图解
传统: 固定集群+预分配资源
Serverless: 按查询付费+自动扩缩
#### 🔧 详解
DataFusion是Apache Arrow生态的SQL查询引擎(Rust编写)。支持DataFrame API和SQL。直接查询S3/Parquet文件。无需预分配集群。按扫描数据量付费。与Spark相比更轻量、启动更快、适合中小规模分析。

#### 💻 代码
// DataFusion/Athena查询
SELECT date_trunc('hour',ts) as hour,
  count(*) as requests,
  avg(latency_ms) as avg_lat
FROM 's3://logs/2026/*.parquet'
WHERE status >= 500
GROUP BY 1 ORDER BY avg_lat DESC
LIMIT 10;
#### ❓ 追问
DataFusion和Spark的区别？答：DataFusion更轻量(Rust+Arrow)、启动快，Spark适合大规模集群。

---
## 10. 可维护性的三个层面？

> **难度**: medium | **分类**: DDIA | **ID**: 510

#### 🎯 本质
可维护性分为**可运维性**(运维友好)、**简单性**(降低复杂度)、**可演化性**(易于修改)。

#### 🧒 类比
可维护性像养车——好修(可运维)、结构简单(简单性)、方便改装(可演化)。

#### 📊 图解
可运维: 监控+自动化+文档
简单性: 抽象+消除意外复杂度
可演化: 灵活架构+解耦
#### 🔧 详解
可运维性：良好监控/告警、自动化部署、优雅升级/降级、文档完善。简单性：用好的抽象消除意外复杂度(accidental complexity)。可演化性：系统容易适应需求变化，通过解耦/模块化/向后兼容实现。

#### 💻 代码
// 可运维: 健康检查
app.get('/health',(req,res)=>{
  res.json({status:'ok',uptime:process.uptime()});
});
// 简单性: 好的抽象
class Pipeline {
  source(s){this._s=s;return this;}
  transform(fn){this._t=fn;return this;}
  sink(d){this._d=d;return this;}
}
#### ❓ 追问
意外复杂度是什么？答：非问题固有的复杂度，是实现方式引入的(如过度设计)。

---
## 11. 关系模型vs文档模型？

> **难度**: medium | **分类**: DDIA | **ID**: 511

#### 🎯 本质
关系模型用**表+行+外键**组织数据，文档模型用**JSON嵌套**天然表示层次结构。

#### 🧒 类比
关系模型像多个Excel表格通过ID关联，文档模型像一个文件夹里嵌套子文件夹。

#### 📊 图解
关系: users表 + orders表 (JOIN)
文档: {user, orders:[...]} (嵌套)
#### 🔧 详解
关系模型：数据规范化到多表，通过外键JOIN关联。优势：强一致性、灵活查询、多对多自然表达。文档模型：数据嵌套在单个文档中。优势：一次读取获取全部数据、模式灵活、适合一对多。选择取决于数据关系：一对多用文档，多对多用关系。

#### 💻 代码
// 关系模型
SELECT u.name, o.amount
FROM users u JOIN orders o ON u.id=o.user_id;

// 文档模型(MongoDB)
db.users.findOne({id:123});
// {id:123, name:'Tom', orders:[{amount:99},{amount:50}]}
#### ❓ 追问
什么场景用文档模型更好？答：数据结构层次深、一对多主导、读多写少、不需要复杂JOIN。

---
## 12. Event Sourcing和CQRS？

> **难度**: hard | **分类**: DDIA | **ID**: 512

#### 🎯 本质
Event Sourcing用**不可变事件序列**替代可变状态，CQRS将**读写模型分离**各自优化。

#### 🧒 类比
Event Sourcing像银行流水(只记交易不直接改余额)，CQRS像图书馆(借阅台和还书台分开)。

#### 📊 图解
Event Sourcing:
  事件追加 → 重放得到当前状态
CQRS:
  写模型(规范化) → 事件 → 读模型(反规范化)
#### 🔧 详解
Event Sourcing：所有状态变更以事件形式持久化(append-only)。当前状态通过重放事件计算。好处：完整审计日志、时间旅行、天然事件驱动。CQRS：命令(写)和查询(读)使用不同的数据模型。写侧用规范化关系表保证一致性，读侧用反规范化视图优化查询。两者常配合使用。

#### 💻 代码
// Event Sourcing
class EventStore {
  append(streamId, event) {
    db.query('INSERT INTO events(stream_id,type,data) VALUES(?,?,?)',
      [streamId, event.type, JSON.stringify(event.data)]);
  }
  load(streamId) {
    return db.query('SELECT * FROM events WHERE stream_id=? ORDER BY seq', streamId);
  }
}
// 重放得到当前状态
const events = store.load('order-123');
const state = events.reduce(applyEvent, initialState);
#### ❓ 追问
Event Sourcing的缺点？答：事件模式演化困难、重放代价大、最终一致性延迟。

---
## 13. 图数据库(Neo4j)？

> **难度**: medium | **分类**: DDIA | **ID**: 513

#### 🎯 本质
图数据库用**节点+边+属性**表示多对多关系，遍历关系不需要JOIN。

#### 🧒 类比
图数据库像社交网络——每个人是节点，好友关系是边，直接沿边查找比查表快得多。

#### 📊 图解
节点: (Person {name:'Tom'})
边:   -[:KNOWS {since:2020}]->
查询: 沿边遍历，无需JOIN
#### 🔧 详解
图数据库(Neo4j/Neptune)将数据建模为节点(实体)和边(关系)。每条边有类型和属性。优势：多跳遍历性能恒定(不随数据量指数增长)、自然表达多对多、路径查询直观。适合社交网络、知识图谱、欺诈检测、推荐系统。

#### 💻 代码
// Neo4j Cypher查询
// 查找Tom的朋友的朋友(二度关系)
MATCH (me:Person {name:'Tom'})-[:KNOWS]->(friend)-[:KNOWS]->(fof)
WHERE NOT (me)-[:KNOWS]->(fof)
RETURN DISTINCT fof.name, COUNT(friend) AS mutualFriends
ORDER BY mutualFriends DESC LIMIT 10;
#### ❓ 追问
图数据库和关系数据库的区别？答：关系库用JOIN遍历关系(多跳性能差)，图库沿边遍历(多跳性能恒定)。

---
## 14. GraphQL vs REST？

> **难度**: medium | **分类**: DDIA | **ID**: 514

#### 🎯 本质
GraphQL是**查询语言**让客户端精确指定需要的数据，REST是**资源导向**的固定端点API。

#### 🧒 类比
GraphQL像自助餐(自选菜品组合)，REST像套餐(固定搭配)。

#### 📊 图解
REST: GET /users/123 → 返回全部字段
GraphQL: query { user(id:123) { name email } } → 只返回指定字段
#### 🔧 详解
REST：每个资源一个URL，返回固定结构。问题：过度获取(返回不需要的字段)或不足获取(需要多次请求)。GraphQL：单端点，客户端指定查询结构。优势：精确获取、减少请求次数、强类型Schema。挑战：N+1查询、缓存复杂、学习曲线。

#### 💻 代码
// GraphQL查询
query GetUserWithOrders {
  user(id: 123) {
    name
    email
    orders(last: 5) {
      amount
      status
      items { name price }
    }
  }
}
// 等效REST需要多次请求:
// GET /users/123
// GET /users/123/orders?limit=5
// GET /orders/456/items
#### ❓ 追问
GraphQL的N+1问题怎么解决？答：DataLoader批量加载+缓存。

---
## 15. 星型模式和雪花模式？

> **难度**: medium | **分类**: DDIA | **ID**: 515

#### 🎯 本质
星型模式是**一个事实表+多个维度表**的直接结构，雪花模式是**维度表进一步规范化**的层次结构。

#### 🧒 类比
星型像太阳系(中心太阳直连行星)，雪花像家谱(祖宗→父→子层层展开)。

#### 📊 图解
星型: 事实表 → 维度表(直接连接)
雪花: 事实表 → 维度表 → 子维度表(多层)
#### 🔧 详解
星型模式：中心事实表(销售记录)直接连接多个维度表(时间/产品/客户/店铺)。查询简单(一次JOIN)，但维度表有数据冗余。雪花模式：维度表进一步规范化拆分(产品→品牌→类别)。减少冗余但查询需多次JOIN。实践中星型模式更常见(查询性能优先)。

#### 💻 代码
-- 星型模式
CREATE TABLE fact_sales (
  date_key INT, product_key INT, store_key INT, amount DECIMAL
);
CREATE TABLE dim_date (date_key INT, year INT, month INT);
CREATE TABLE dim_product (product_key INT, name VARCHAR, brand VARCHAR);

-- 查询: 月度销售额
SELECT d.month, SUM(s.amount)
FROM fact_sales s JOIN dim_date d ON s.date_key=d.date_key
GROUP BY d.month;
#### ❓ 追问
为什么星型比雪花更常用？答：OLAP场景查询性能优先，星型JOIN少、查询简单。

---
## 16. LSM-Tree vs B-Tree？

> **难度**: hard | **分类**: DDIA | **ID**: 516

#### 🎯 本质
LSM-Tree**追加写入+后台合并**(写优化)，B-Tree**原地更新+平衡树**(读优化)。

#### 🧒 类比
LSM-Tree像日记本(往后写不擦改)，B-Tree像字典(按字母顺序插入，满了就分页)。

#### 📊 图解
LSM-Tree: 写→MemTable→SSTable→后台合并
B-Tree: 写→找到叶子节点→原地更新→可能分裂
#### 🔧 详解
LSM-Tree：写入先到内存(MemTable)，满了刷盘为SSTable，后台Compaction合并排序。写吞吐量高(顺序写)、空间利用率高。但读需要查多层(MemTable+SSTables)，Compaction影响性能。用于：LevelDB/RocksDB/Cassandra/HBase。B-Tree：有序平衡树，每个节点一页(通常4KB)。原地更新，读延迟稳定可预测。用于：MySQL/PostgreSQL/Oracle。

#### 💻 代码
// LSM-Tree写入流程
class LSMTree {
  constructor() { this.memtable = new Map(); }
  put(key, value) {
    this.memtable.set(key, value);
    if (this.memtable.size > THRESHOLD) {
      this.flushToSSTable();
    }
  }
  get(key) {
    if (this.memtable.has(key)) return this.memtable.get(key);
    // 查SSTables(从新到旧)
    for (const sst of this.sstables) {
      const val = sst.get(key);
      if (val !== null) return val;
    }
    return null;
  }
}
#### ❓ 追问
LSM-Tree的写放大问题？答：同一数据被多次重写(MemTable→SSTable→Compaction)。

---
## 17. 列存储为什么适合OLAP？

> **难度**: medium | **分类**: DDIA | **ID**: 517

#### 🎯 本质
列存储将**同一列的数据连续存放**，查询只需读取相关列，大幅减少I/O。

#### 🧒 类比
行存像每人一个档案袋(取名字要翻所有袋)，列存像按字段分抽屉(取名字直接开名字抽屉)。

#### 📊 图解
行存: [id,name,age][id,name,age]...
列存: [id,id,id][name,name,name][age,age,age]
查询SELECT name: 只读name列
#### 🔧 详解
行存储每行连续存放，查询单行快(OLTP)。列存储每列连续存放，查询某列只需读该列数据。OLAP典型查询只涉及少数列但大量行(如SUM(amount) WHERE date>...)。列存储优势：(1)减少I/O(只读需要的列)；(2)同类数据压缩率高(运行长度编码/字典编码)；(3)向量化执行(SIMD指令)。

#### 💻 代码
-- Parquet列存文件结构
-- Row Group 0:
--   Column Chunk: id   [1,2,3,4,5] (压缩)
--   Column Chunk: name ['Tom','Jerry','Alice','Bob','Eve'] (字典编码)
--   Column Chunk: age  [25,30,28,22,35] (delta编码)

-- 查询只需读age列
SELECT AVG(age) FROM users WHERE age > 25;
-- 行存: 读取所有列的数据
-- 列存: 只读取age列 → I/O减少60-80%
#### ❓ 追问
列存储为什么不适合OLTP？答：单行写入需更新所有列文件，随机写性能差。

---
## 18. 向量化执行引擎？

> **难度**: medium | **分类**: DDIA | **ID**: 518

#### 🎯 本质
向量化执行**一次处理一批数据**(而非一行)，利用CPU缓存线和SIMD指令提升吞吐。

#### 🧒 类比
向量化像流水线(一次处理一箱产品)，标量执行像手工(一个一个做)。

#### 📊 图解
标量: for(row) process(row)
向量化: for(batch) process_vector(batch)
  → CPU缓存友好 + SIMD并行
#### 🔧 详解
传统火山模型(Volcano)：每行数据通过next()逐行传递，每次调用虚函数开销大。向量化执行：将数据组织为列式向量(batch)，一次处理一批(如1024行)。好处：(1)减少虚函数调用(2)CPU缓存友好(数据连续)(3)可使用SIMD指令并行计算。ClickHouse/DuckDB/Arrow都使用向量化。

#### 💻 代码
// 标量执行(火山模型)
for (const row of table.scan()) {  // 逐行
  if (filter(row)) {
    result.push(project(row));
  }
}

// 向量化执行
const batch = table.scanBatch(1024);  // 一次1024行
const mask = filterVector(batch.age, '>', 25);  // SIMD
const projected = projectVector(batch, mask);
result.push(...projected);
#### ❓ 追问
SIMD是什么？答：单指令多数据，一条CPU指令同时处理多个数据(如同时比较4个int)。

---
## 19. 全文搜索引擎倒排索引？

> **难度**: medium | **分类**: DDIA | **ID**: 519

#### 🎯 本质
倒排索引是**词到文档列表**的映射，是全文搜索的核心数据结构。

#### 🧒 类比
倒排索引像书后的关键词索引——查'数据库'这个词，索引告诉你出现在第几页。

#### 📊 图解
正排: doc1→[数据库,系统,设计]
倒排: 数据库→[doc1,doc3,doc5]
      系统→[doc1,doc2]
#### 🔧 详解
正排索引：文档→词列表(用于知道文档包含什么词)。倒排索引：词→文档列表(用于找到包含某词的文档)。搜索引擎(Elasticsearch/Solr)用倒排索引实现全文搜索。构建过程：分词→去停用词→建立词到文档的映射。查询：分词→查倒排索引→合并结果(TF-IDF/BM25排序)。

#### 💻 代码
// 倒排索引结构
const invertedIndex = {
  '数据库': [{docId:1, pos:[0,5]}, {docId:3, pos:[2]}],
  '系统':   [{docId:1, pos:[1]}, {docId:2, pos:[0,3]}],
  '设计':   [{docId:1, pos:[2]}, {docId:4, pos:[1]}]
};

// 搜索'数据库系统'
function search(query) {
  const terms = tokenize(query);  // ['数据库','系统']
  const postings = terms.map(t => invertedIndex[t]);
  return intersect(postings);  // AND: 取交集
}
#### ❓ 追问
BM25是什么？答：基于词频和文档长度的相关性排序算法，是TF-IDF的改进。

---
## 20. 向量嵌入和相似度搜索？

> **难度**: hard | **分类**: DDIA | **ID**: 520

#### 🎯 本质
向量搜索用**高维向量表示**数据，通过**近似最近邻(ANN)**算法快速查找相似项。

#### 🧒 类比
向量搜索像'以图搜图'——把图片变成一串数字(向量)，找数字串最接近的图片。

#### 📊 图解
文本/图片 → Embedding模型 → 向量 [0.1,0.3,...]
查询向量 → ANN索引(HNSW/IVF) → Top-K相似结果
#### 🔧 详解
将文本/图片/音频通过模型(如OpenAI text-embedding)转换为高维向量(如1536维)。相似度用余弦相似度或欧氏距离衡量。暴力搜索O(n)太慢，用ANN近似算法：(1)HNSW(分层导航小世界图)：构建多层图，查询时从上层粗搜到下层精搜。(2)IVF(倒排文件)：聚类后只搜最近的几个聚类。用于RAG、推荐、以图搜图。

#### 💻 代码
// 向量搜索示例
const embeddings = [
  {id:1, vec:[0.1, 0.3, 0.5]},  // '数据库系统'
  {id:2, vec:[0.2, 0.1, 0.8]},  // '机器学习'
  {id:3, vec:[0.15,0.25,0.55]}, // '数据仓库' ← 最相似
];

function cosineSimilarity(a, b) {
  return a.reduce((s,v,i) => s + v*b[i], 0) /
    (Math.sqrt(a.reduce((s,v)=>s+v*v,0)) * Math.sqrt(b.reduce((s,v)=>s+v*v,0)));
}

const query = [0.12, 0.28, 0.52]; // '数据系统'
const results = embeddings
  .map(e => ({...e, score: cosineSimilarity(query, e.vec)}))
  .sort((a,b) => b.score - a.score).slice(0, 3);
#### ❓ 追问
HNSW的时间复杂度？答：查询O(log n)，远优于暴力O(n)，但内存占用较大。

---
## 21. 两阶段提交(2PC)？

> **难度**: hard | **分类**: DDIA | **ID**: 521

#### 🎯 本质
2PC是**原子提交协议**：协调者先问所有参与者能不能提交(Prepare)，都同意才真正提交(Commit)。

#### 🧒 类比
2PC像班级投票——班长(协调者)问每个同学(参与者)同意吗，全票通过才执行，一人反对就取消。

#### 📊 图解
阶段1 Prepare: 协调者→参与者(能提交吗?)
阶段2 Commit:  协调者→参与者(提交/中止)
关键: 参与者Prepare后必须锁住资源
#### 🔧 详解
两阶段提交保证分布式事务的原子性。阶段一(Prepare)：协调者发送Prepare，参与者执行操作但未提交，回复Yes/No。阶段二(Commit/Abort)：所有Yes则Commit，任一No则Abort。问题：协调者是单点故障、参与者Prepare后阻塞等待、性能开销大。用于：XA事务、数据库跨节点事务。

#### 💻 代码
// 2PC伪代码
async function twoPhaseCommit(txn) {
  // Phase 1: Prepare
  const votes = await Promise.all(
    participants.map(p => p.prepare(txn))
  );
  if (votes.every(v => v === 'YES')) {
    // Phase 2: Commit
    await Promise.all(participants.map(p => p.commit(txn)));
    return 'COMMITTED';
  } else {
    await Promise.all(participants.map(p => p.abort(txn)));
    return 'ABORTED';
  }
}
#### ❓ 追问
2PC的最大问题？答：协调者故障时参与者永久阻塞(持有锁)，需要3PC或超时机制缓解。

---
## 22. Saga分布式事务模式？

> **难度**: medium | **分类**: DDIA | **ID**: 522

#### 🎯 本质
Saga将长事务拆分为**多个本地事务**，每个步骤有对应的**补偿操作**，失败时反向补偿。

#### 🧒 类比
Saga像网购——下单→扣款→发货→确认，如果发货失败就退款+取消订单(反向补偿)。

#### 📊 图解
Saga: T1→T2→T3→T4(正向执行)
失败: C3←C2←C1(反向补偿)
每个Ti都有补偿操作Ci
#### 🔧 详解
Saga模式将分布式事务分解为一系列本地事务。每个本地事务完成后发送事件触发下一个。如果某步失败，执行之前步骤的补偿操作(回滚)。两种协调方式：(1)编排式(Choreography)：服务通过事件驱动，无中心协调。(2)编排式(Orchestration)：中心协调器控制流程。Saga牺牲隔离性(无全局锁)，采用最终一致性。

#### 💻 代码
// Saga编排式实现
const saga = new SagaOrchestrator();
saga
  .addStep('createOrder',   orderService.create,    orderService.cancel)
  .addStep('reserveStock',  stockService.reserve,   stockService.release)
  .addStep('chargePayment', paymentService.charge,  paymentService.refund)
  .addStep('shipOrder',     shippingService.ship,   shippingService.cancel);

try {
  await saga.execute(orderData);
} catch (err) {
  // 自动执行补偿操作
  console.log('Saga compensated:', err);
}
#### ❓ 追问
Saga的隔离性问题？答：Saga没有全局隔离，中间状态对外可见，需用语义锁或对策处理脏读。

---
## 23. 分布式系统中的时钟问题？

> **难度**: medium | **分类**: DDIA | **ID**: 523

#### 🎯 本质
分布式系统中**物理时钟不可靠**(时钟偏移/闰秒)，需要**逻辑时钟**(Lamport时间戳/向量时钟)定序。

#### 🧒 类比
时钟像不同步的手表——你说12:00我12:05，谁先发生？用递增计数器(逻辑时钟)代替看表。

#### 📊 图解
物理时钟: NTP同步→仍有偏差(ms级)
Lamport时钟: 事件计数器→偏序
向量时钟: 每节点维护计数器→检测并发
#### 🔧 详解
物理时钟问题：不同机器的时钟有偏差(即使NTP同步也有ms级误差)。闰秒导致跳变。无法用时间戳精确判断事件先后。Lamport时间戳：每个节点维护计数器，发送消息时附带计数器，接收方取max+1。保证因果关系：A→B则L(A)// Lamport时钟
class LamportClock {
  constructor() { this.time = 0; }
  tick() { return ++this.time; }
  send() { return ++this.time; }
  receive(remoteTime) {
    this.time = Math.max(this.time, remoteTime) + 1;
    return this.time;
  }
}

// 向量时钟
class VectorClock {
  constructor(nodeId, peers) {
    this.id = nodeId;
    this.clock = {};
    peers.forEach(p => this.clock[p] = 0);
  }
  tick() { this.clock[this.id]++; }
  merge(other) {
    for (const k in other)
      this.clock[k] = Math.max(this.clock[k]||0, other[k]);
    this.clock[this.id]++;
  }
}
#### ❓ 追问
向量时钟如何检测冲突？答：如果两个事件的向量时钟互不包含(A有B没有的更大值)，则是并发(冲突)。

---
## 24. Raft共识算法？

> **难度**: hard | **分类**: DDIA | **ID**: 524

#### 🎯 本质
Raft通过**领导者选举+日志复制**实现分布式共识，保证**多数节点存活**时系统可用。

#### 🧒 类比
Raft像选举班长——先投票选出领导者(Leader)，然后所有决定都由Leader通知同学们(Follower)。

#### 📊 图解
角色: Leader/Follower/Candidate
选举: 超时→竞选→获多数票→Leader
日志: Client→Leader→复制到多数→提交
#### 🔧 详解
Raft分为两个子问题：(1)领导者选举：Follower超时未收到心跳变为Candidate，发起投票，获多数票成为Leader。(2)日志复制：客户端请求发到Leader，Leader写入日志并复制到Follower，多数确认后提交。安全性：所有已提交的日志不会丢失。Leader故障时新Leader包含所有已提交日志(通过选举限制保证)。

#### 💻 代码
// Raft状态机(简化)
class RaftNode {
  constructor(id, peers) {
    this.id = id;
    this.state = 'follower';  // follower/candidate/leader
    this.term = 0;
    this.votedFor = null;
    this.log = [];
  }
  
  startElection() {
    this.state = 'candidate';
    this.term++;
    this.votedFor = this.id;
    // 向其他节点请求投票
    const votes = this.requestVotes();
    if (votes > this.peers.length / 2) {
      this.state = 'leader';
      this.sendHeartbeats();
    }
  }
  
  appendEntry(entry) {
    this.log.push({term: this.term, ...entry});
    // 复制到多数节点后提交
    this.replicateLog();
  }
}
#### ❓ 追问
Raft和Paxos的区别？答：Raft更易理解和实现，Paxos更理论化。Raft保证强Leader(日志只从Leader流向Follower)。

---
## 25. 分区容错(CP vs AP)？

> **难度**: medium | **分类**: DDIA | **ID**: 525

#### 🎯 本质
CAP定理：网络分区时只能在**一致性(C)**和**可用性(A)**中二选一。实际系统是** shades of trade-off**。

#### 🧒 类比
CAP像鱼和熊掌——网络断了(P)，要么所有节点返回一致数据(C但不可用)，要么立即响应(A但可能不一致)。

#### 📊 图解
CP: 分区时拒绝写→保证一致(ZooKeeper)
AP: 分区时继续服务→ eventual consistency(Dynamo)
实际: 多数系统在C和A间灵活切换
#### 🔧 详解
CAP定理：网络分区不可避免，分区时C(一致性)和A(可用性)不可兼得。CP系统：分区时拒绝部分请求保证一致性。AP系统：分区时继续服务但可能返回旧数据。注意：CAP只是极端情况(网络分区)下的选择。日常运行中多数系统同时提供CA。BASE理论：Basically Available + Soft state + Eventually consistent。

#### 💻 代码
// CP系统: 分区时拒绝写
if (partitionDetected && !isLeader) {
  return {status: 503, error: 'partition - reads only'};
}

// AP系统: 分区时继续服务(可能返回旧数据)
function read(key) {
  // 即使分区也返回本地数据
  return localCache.get(key) || db.get(key);
}

// 最终一致性: 后台同步
setInterval(async () => {
  if (!isPartitioned()) {
    await syncWithPeers(); // 合并冲突数据
  }
}, 5000);
#### ❓ 追问
什么是最终一致性？答：系统保证如果没有新更新，最终所有副本会收敛到相同值(但时间不确定)。

---
## 26. MapReduce批处理模型？

> **难度**: medium | **分类**: DDIA | **ID**: 526

#### 🎯 本质
MapReduce是**分而治之**的批处理模型：Map阶段并行处理数据块，Reduce阶段聚合结果。

#### 🧒 类比
MapReduce像分工数钱——10个人各数一捆(Map)，最后汇总(Reduce)。

#### 📊 图解

```
Input → Split → Map(并行) → Shuffle(按key分组) → Reduce(聚合) → Output
```

#### 🔧 详解
MapReduce将大数据任务分解为Map和Reduce两阶段。Map：处理输入分片，输出key-value对。Shuffle：按key重新分布到Reduce节点。Reduce：对相同key的values聚合。优势：自动并行化、容错(失败重试)、可处理TB级数据。用于Hadoop生态系统。局限性：每次MapReduce读写磁盘，迭代任务性能差(用Spark替代)。

#### 💻 代码
// MapReduce: WordCount
// Map阶段
function map(doc) {
  for (const word of doc.split(' ')) {
    emit(word, 1);  // 输出 (word, 1)
  }
}
// Reduce阶段
function reduce(word, counts) {
  return counts.reduce((a, b) => a + b, 0);  // 求和
}
// 执行流程:
// Map: [('hello',1),('world',1),('hello',1)]
// Shuffle: {'hello':[1,1], 'world':[1]}
// Reduce: {'hello':2, 'world':1}
#### ❓ 追问
MapReduce和Spark的区别？答：Spark用内存迭代(比磁盘快100x)、支持流处理和机器学习。

---
## 27. 流处理vs批处理？

> **难度**: medium | **分类**: DDIA | **ID**: 527

#### 🎯 本质
批处理处理**有界数据集**(定期跑)，流处理处理**无界数据流**(持续实时处理)。

#### 🧒 类比
批处理像每天收盘对账(等齐了再算)，流处理像实时收银(来一笔处理一笔)。

#### 📊 图解
批处理: 定时→全量→高吞吐→延迟高(小时级)
流处理: 实时→增量→低延迟(秒/毫秒)
Lambda: 批+流并行
#### 🔧 详解
批处理(Spark Batch/MapReduce)：处理固定时间窗口的数据。高吞吐但延迟高(小时级)。适合报表/BI。流处理(Flink/Kafka Streams)：持续处理事件流。低延迟(秒/毫秒)。适合实时监控/推荐。Lambda架构：批处理层(准确)和服务层(快速)并行，合并结果。Kappa架构：统一用流处理，通过重放历史数据达到批处理效果。

#### 💻 代码
// 批处理(Spark)
const dailyStats = spark
  .read.parquet('s3://events/2026-01-15/')
  .groupBy('user_id')
  .agg(sum('amount'), count('*'));

// 流处理(Flink)
const stream = env
  .addSource(new KafkaSource('events'))
  .keyBy('user_id')
  .window(TumblingEventTimeWindows.of(5, 'MINUTES'))
  .aggregate(new SumAgg());
#### ❓ 追问
Lambda和Kappa架构的区别？答：Lambda有两套代码(批+流)，Kappa只用流处理(简化但流引擎需支持重放)。

---
## 28. Kafka的消息传递模型？

> **难度**: medium | **分类**: DDIA | **ID**: 528

#### 🎯 本质
Kafka是**分布式提交日志**：生产者追加消息到分区，消费者按offset消费，消息持久化且有序。

#### 🧒 类比
Kafka像公共黑板——每个人(生产者)往上贴通知，读者(消费者)按顺序阅读自己关心的分区。

#### 📊 图解
Producer → Topic(Partition 0,1,2) → Consumer Group
  追加写(有序)    持久化日志     按offset消费
#### 🔧 详解
Kafka核心概念：Topic(消息分类)、Partition(并行单元，内有序)、Consumer Group(组内消费者各消费不同分区)。消息以append-only日志存储，通过offset标记消费位置。优势：高吞吐(顺序磁盘写)、持久化(可回溯)、解耦生产者和消费者。用于：事件流、日志收集、数据管道、流处理基础设施。

#### 💻 代码
// 生产者
await producer.send({
  topic: 'orders',
  messages: [{key:'order-123', value: JSON.stringify({amount:99})}]
});

// 消费者
const consumer = kafka.consumer({groupId: 'order-processor'});
await consumer.subscribe({topic: 'orders'});
await consumer.run({
  eachMessage: async ({message}) => {
    const order = JSON.parse(message.value.toString());
    await processOrder(order);
  }
});
#### ❓ 追问
Kafka如何保证 Exactly-Once？答：幂等生产者+事务API+消费者端事务隔离。

---
## 29. 流处理中的窗口类型？

> **难度**: hard | **分类**: DDIA | **ID**: 529

#### 🎯 本质
窗口将**无界流切分为有界块**：滚动窗口(固定大小)、滑动窗口(有重叠)、会话窗口(活动间隔)。

#### 🧒 类比
窗口像分蛋糕——滚动窗口切等分，滑动窗口切了可以重叠，会话窗口按活动间隙切。

#### 📊 图解
滚动: [|---5min---][|---5min---|]
滑动: [|---5min---|]
       [|---5min---|] (每1min滑动)
会话: [---活动---]  gap  [---活动---]
#### 🔧 详解
滚动窗口(Tumbling)：固定大小，不重叠。如每5分钟统计一次。滑动窗口(Sliding)：固定大小，按步长滑动。如每1分钟统计过去5分钟(有重叠)。会话窗口(Session)：按活动间隔划分，用户活跃时窗口扩展，不活跃超时后关闭。适合用户行为分析。水位线(Watermark)：处理乱序事件，允许迟到数据在窗口关闭后一段时间内仍被计入。

#### 💻 代码
// Flink窗口示例
stream
  // 滚动窗口: 每5分钟
  .window(TumblingEventTimeWindows.of(Time.minutes(5)))
  
  // 滑动窗口: 每1分钟统计过去5分钟
  .window(SlidingEventTimeWindows.of(Time.minutes(5), Time.minutes(1)))
  
  // 会话窗口: 30秒无活动则关闭
  .window(EventTimeSessionWindows.withGap(Time.seconds(30)))
  
  .aggregate(new CountAgg());
#### ❓ 追问
迟到数据怎么处理？答：Watermark机制允许设置最大延迟，超时的数据可收集到侧输出另处理。

---
## 30. Exactly-Once语义？

> **难度**: medium | **分类**: DDIA | **ID**: 530

#### 🎯 本质
Exactly-Once保证消息**恰好被处理一次**——不丢失也不重复。是三种消息语义中最难实现的。

#### 🧒 类比
Exactly-Once像快递签收——必须签一次且只签一次(不能丢件也不能重复签收)。

#### 📊 图解
At-Most-Once: 发了就不管(可能丢)
At-Least-Once: 重试保证不丢(可能重复)
Exactly-Once: 不丢不重复(最难)
#### 🔧 详解
三种消息语义：(1)At-Most-Once：发送后不重试，可能丢失。最简单但不可靠。(2)At-Least-Once：发送后等待确认，超时重试，保证不丢失但可能重复。需要消费端幂等。(3)Exactly-Once：不丢失不重复。实现方式：幂等生产者(Kafka)、事务(跨分区原子写入)、消费端去重(唯一ID+去重表)。Flink通过checkpoint+两阶段提交实现端到端Exactly-Once。

#### 💻 代码
// 幂等消费(去重表)
async function processExactlyOnce(msg) {
  const txId = msg.headers['transaction-id'];
  // 检查是否已处理
  const exists = await db.query(
    'SELECT 1 FROM processed_txns WHERE tx_id=$1', [txId]
  );
  if (exists) return 'ALREADY_PROCESSED';
  
  // 原子处理+记录
  await db.transaction(async (t) => {
    await processMessage(t, msg);
    await t.query('INSERT INTO processed_txns(tx_id) VALUES($1)', [txId]);
  });
}
#### ❓ 追问
幂等性是什么？答：同一操作执行一次和多次效果相同。如UPDATE SET balance=100(幂等) vs balance+=100(非幂等)。

---
## 31. 数据集成和ETL？

> **难度**: medium | **分类**: DDIA | **ID**: 531

#### 🎯 本质
数据集成是将**不同来源的数据统一**到一起，ETL(Extract-Transform-Load)是经典的集成流程。

#### 🧒 类比
ETL像搬家打包——从旧家搬出(Extract)、整理分类(Transform)、放进新家(Load)。

#### 📊 图解
Extract: 从源系统抽取
Transform: 清洗/转换/标准化
Load: 写入目标(数据仓库)
#### 🔧 详解
ETL三个步骤：Extract(从MySQL/API/文件抽取)、Transform(清洗/格式化/聚合/JOIN)、Load(写入数据仓库)。现代趋势是ELT：先Load到数据湖，再Transform(利用数仓的计算能力)。工具：Apache Airflow调度、dbt做Transform、Fivetran做Extract。数据集成挑战：Schema演化、数据质量、实时vs批量。

#### 💻 代码
-- ELT示例(现代方式)
-- 1. Load: 原始数据导入
INSERT INTO raw_events SELECT * FROM external_table;

-- 2. Transform: 在数仓中转换
CREATE TABLE dim_users AS
SELECT user_id, UPPER(TRIM(name)) as name,
  COALESCE(email,'unknown') as email
FROM raw_events WHERE user_id IS NOT NULL;
#### ❓ 追问
ETL和ELT的区别？答：ETL先转换再加载，ELT先加载再转换(利用数仓算力更高效)。

---
## 32. Change Data Capture(CDC)？

> **难度**: hard | **分类**: DDIA | **ID**: 532

#### 🎯 本质
CDC是**捕获数据库变更事件**(INSERT/UPDATE/DELETE)并实时同步到下游的技术。

#### 🧒 类比
CDC像快递追踪——数据库每次变动都自动通知下游(像快递状态变更推送)。

#### 📊 图解

```
源DB -> Binlog/WAL -> CDC工具 -> Kafka -> 下游
```

#### 🔧 详解
CDC通过读取数据库的预写日志(WAL/MySQL Binlog)捕获所有行级变更。优势：低延迟(毫秒级)、对源库无侵入、保留变更顺序。Debezium是最流行的开源CDC工具。用途：数据同步(DB到数仓)、缓存更新(DB到Redis)、事件驱动架构。对比定时ETL：CDC是实时的，ETL是批量的。

#### 💻 代码
// Debezium配置
{
  "name": "mysql-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.server.name": "dbserver1",
    "database.include.list": "inventory"
  }
}
// 变更事件: {op:"c",after:{id:1,name:"Tom"}}
#### ❓ 追问
CDC和触发器的区别？答：CDC读日志(无侵入)，触发器在事务内执行(影响性能)。

---
## 33. 数据湖(Data Lake)？

> **难度**: medium | **分类**: DDIA | **ID**: 533

#### 🎯 本质
数据湖以**原始格式**(Parquet/JSON/CSV)存储海量数据，读时才定义Schema(Schema-on-Read)。

#### 🧒 类比
数据湖像大仓库——什么都能往里扔(原始数据)，用的时候再分类整理(读时Schema)。

#### 📊 图解
数据仓库: 写时Schema(结构化)
数据湖: 读时Schema(原始+灵活)
湖仓一体: 两者合并
#### 🔧 详解
数据湖用对象存储(S3/OSS)存储原始数据。Schema-on-Read：写入时不验证格式，查询时才解析。优势：灵活、低成本、适合ML。问题：无治理则变成数据沼泽。湖仓一体(Lakehouse)：在数据湖上增加ACID事务支持和表格式(Iceberg/Delta Lake/Hudi)。

#### 💻 代码
-- 数据湖查询(Trino/Athena)
SELECT user_id, COUNT(*) as events
FROM s3://data-lake/events/year=2026/*.parquet
WHERE event_type = 'purchase'
GROUP BY user_id;

-- Delta Lake事务
CREATE TABLE events USING DELTA
LOCATION 's3://lake/delta/events';
#### ❓ 追问
数据湖变成数据沼泽怎么办？答：数据目录+元数据管理+数据质量监控+访问控制。

---
## 34. Apache Iceberg/Delta Lake表格式？

> **难度**: medium | **分类**: DDIA | **ID**: 534

#### 🎯 本质
湖仓一体的三种表格式用**元数据层+事务日志**在对象存储上实现ACID和Time Travel。

#### 🧒 类比
表格式像图书馆目录卡——书本在架上不变，目录卡记录每本书的版本和位置。

#### 📊 图解
Parquet文件(不可变)
+ 元数据清单(Manifest)
+ 事务日志(Snapshot)
= ACID + Time Travel
#### 🔧 详解
三种主流表格式：(1)Apache Iceberg：开放表格式，支持Schema演化、隐藏分区。Netflix开源。(2)Delta Lake：Databricks推出，Spark深度集成。(3)Apache Hudi：Uber开源，支持增量Upsert。共同特点：在Parquet上加元数据层实现ACID、MVCC、Schema演化、Time Travel。

#### 💻 代码
-- Delta Lake Time Travel
SELECT * FROM events VERSION AS OF 5;
SELECT * FROM events TIMESTAMP AS OF '2026-01-15';

-- Iceberg Schema演化
ALTER TABLE events ADD COLUMN new_field STRING;
ALTER TABLE events DROP COLUMN old_field;
-- 无需重写数据文件!
#### ❓ 追问
三种格式怎么选？答：Spark生态选Delta Lake，多引擎选Iceberg，增量Upsert选Hudi。

---
## 35. 数据质量和数据治理？

> **难度**: medium | **分类**: DDIA | **ID**: 535

#### 🎯 本质
数据质量是确保数据**准确/完整/一致/及时**，数据治理是**管理数据资产**的流程和工具。

#### 🧒 类比
数据质量像食品安全(不能有坏食材)，数据治理像食品安全法规(制度保证)。

#### 📊 图解
数据质量: 准确性/完整性/一致性/及时性
数据治理: 元数据/血缘/权限/生命周期
#### 🔧 详解
数据质量维度：准确性、完整性、一致性、及时性、唯一性。数据治理：元数据管理、数据血缘追踪、访问控制、生命周期管理。工具：Great Expectations(质量检查)、dbt(测试+文档)、DataHub(数据目录)。

#### 💻 代码
# Great Expectations
import great_expectations as gx
df = gx.read_csv('users.csv')
df.expect_column_values_to_not_be_null('email')
df.expect_column_values_to_be_between('age', 0, 150)
df.expect_column_values_to_be_unique('user_id')
result = df.validate()
print(f'Pass: {result.statistics["success_percent"]}%')
#### ❓ 追问
数据血缘是什么？答：追踪数据从源头到最终使用的完整链路。

---
## 36. 分布式系统中的脑裂问题？

> **难度**: hard | **分类**: DDIA | **ID**: 536

#### 🎯 本质
脑裂是网络分区导致**出现两个领导者**，各自接受写入造成数据不一致。

#### 🧒 类比
脑裂像球队没了教练，两个人都自称队长各发指令，队员不知道听谁的。

#### 📊 图解
节点A---网络断---节点B
A选自己为Leader    B也选自己为Leader
→ 两组数据不一致!
#### 🔧 详解
脑裂(Split-Brain)：网络分区后两个节点都认为自己是Leader，各自接受写入。解决方案：(1)Quorum(多数票)：需要N/2+1节点同意才能成为Leader，保证最多一个Leader。(2)Fencing Token：Leader获得递增token，旧Leader的请求因token过旧被拒绝。(3)Witness节点：第三方见证者参与投票。

#### 💻 代码
// Fencing Token防脑裂
class LeaderElection {
  async becomeLeader() {
    this.fencingToken = await zk.createSequential(
      '/leaders/lock-', EPHEMERAL_SEQUENTIAL
    );
  }
  write(data) {
    // 每次写入附带fencing token
    return rpc('write', {
      token: this.fencingToken,
      data
    });
  }
}
// 存储节点检查token
if (request.token 
#### ❓ 追问
ZooKeeper如何防脑裂？答：用ZAB协议保证只有获得多数票的节点才能成为Leader。

---
## 37. Fencing Token机制？

> **难度**: medium | **分类**: DDIA | **ID**: 537

#### 🎯 本质
Fencing Token是**单调递增的令牌**，用于区分新旧Leader，旧Leader的请求被自动拒绝。

#### 🧒 类比
Fencing Token像新官上任的印章——旧印章自动作废，拿旧印章来办事的被拒绝。

#### 📊 图解
旧Leader(token=3) → 网络故障
新Leader(token=4) → 写入成功
旧Leader(token=3) → 被拒绝(stale)
#### 🔧 详解
当网络分区导致旧Leader不知道自己已失效，Fencing Token提供安全的降级机制。原理：每次Leader选举产生递增token，所有写请求附带token，存储节点只接受比当前token更大的请求。即使旧Leader暂时不知道自己失势，其请求也会被安全拒绝。

#### 💻 代码
// Fencing实现
let currentToken = 0;

function handleWrite(request) {
  if (request.fencingToken 
#### ❓ 追问
Fencing Token和Lease的区别？答：Lease(租约)有时效性过期自动失效，Fencing Token需要主动比较。

---
## 38. 数据复制策略？

> **难度**: medium | **分类**: DDIA | **ID**: 538

#### 🎯 本质
数据复制通过**多副本**提高可用性和读性能。策略包括**单领导者/多领导者/无领导者**。

#### 🧒 类比
数据复制像文件复印——单领导(一个人管原件分发)、多领导(多个分店各有原件)、无领导(谁有谁说了算)。

#### 📊 图解
单Leader: 所有写→Leader→复制到Follower
多Leader: 各机房各有Leader→相互同步
无Leader(Cassandra): 写任意N个节点
#### 🔧 详解
单领导者(Single-Leader)：所有写请求经过Leader，Follower异步/同步复制。简单但Leader是瓶颈(MySQL/PostgreSQL)。多领导者(Multi-Leader)：每个数据中心有自己的Leader，跨DC异步同步。适合多地域部署但冲突解决复杂。无领导者(Leaderless/Quorum)：任意节点可接受写入，用W+R>N保证一致性(Cassandra/Dynamo)。

#### 💻 代码
// Quorum读写(Cassandra)
const N = 3;  // 总副本数
const W = 2;  // 写入确认数
const R = 2;  // 读取数

async function quorumWrite(key, value) {
  const nodes = getReplicas(key, N);
  const acks = await Promise.all(
    nodes.map(n => n.write(key, value, timestamp))
  );
  if (acks.filter(Boolean).length >= W) return 'OK';
  throw new Error('write quorum not met');
}

async function quorumRead(key) {
  const nodes = getReplicas(key, N);
  const values = await Promise.all(nodes.map(n => n.read(key)));
  // W+R>N保证至少一个最新值
  return values.sort((a,b) => b.ts - a.ts)[0];
}
#### ❓ 追问
W+R>N的含义？答：写入W个+读取R个副本，如果W+R>N则读取一定能看到至少一个最新写入。

---
## 39. 一致性模型(线性/顺序/因果)？

> **难度**: hard | **分类**: DDIA | **ID**: 539

#### 🎯 本质
一致性模型定义了**并发操作的可观察顺序**：线性一致性最强(实时顺序)，因果最弱但可实现。

#### 🧒 类比
一致性像排队规则——线性(绝对严格先来后到)、顺序(按某个固定顺序)、因果(只保证因果关系的顺序)。

#### 📊 图解
线性: 所有操作按真实时间全局排序(最强)
顺序: 所有节点看到相同顺序(无实时保证)
因果: 有因果关系的操作有序(最实用)
#### 🔧 详解
线性一致性(Linearizable)：操作看起来在某个时间点原子完成，所有节点同一时刻看到同一值。代价高(需要同步)。顺序一致性(Sequentially Consistent)：所有节点看到相同的操作顺序，但不一定是实时顺序。因果一致性(Causal Consistency)：有因果关系的操作保序(A→B则所有节点先看到A再看到B)，无因果关系的并发操作可以乱序。实践中因果一致性是最佳平衡点。

#### 💻 代码
// 因果一致性实现
// 用向量时钟跟踪因果关系
class CausalStore {
  constructor() { this.data = {}; this.clock = {}; }
  
  write(key, value, context) {
    // 合并上下文中的向量时钟
    this.mergeClock(context.clock);
    this.clock[this.nodeId]++;
    this.data[key] = { value, clock: {...this.clock} };
  }
  
  read(key, context) {
    const item = this.data[key];
    // 检查因果依赖是否满足
    if (this.isCausallyReady(item.clock, context.clock)) {
      return item.value;
    }
    return null; // 还没准备好
  }
}
#### ❓ 追问
为什么不用线性一致性？答：性能代价太高(Google Spanner用TrueTime实现，需要原子钟)。因果一致性99%场景够用且性能好。

---
## 40. Parquet文件格式？

> **难度**: medium | **分类**: DDIA | **ID**: 540

#### 🎯 本质
Parquet是**列式存储格式**，支持高效压缩和谓词下推，是数据湖的事实标准。

#### 🧒 类比
Parquet像按科目分类的档案柜——数学卷放一抽屉、语文卷放一抽屉，查数学成绩只开一个抽屉。

#### 📊 图解
行存(Row): [id,name,age][id,name,age]
Parquet(Column): [id...][name...][age...]
  + 统计信息(min/max) → 跳过不相关行组
#### 🔧 详解
Parquet核心特性：(1)列式存储：同列数据连续存放，查询少数列时I/O少。(2)类型编码：每列独立压缩(字典编码/运行长度/Delta)。(3)行组(Row Group)：数据分块，每块独立可并行处理。(4)谓词下推：利用每行组的min/max统计信息跳过不相关数据块。(5)嵌套结构支持：用Dremel编码支持复杂Schema。

#### 💻 代码
// Parquet文件结构
// Row Group 0 (10000行)
//   Column Chunk: id   [1..10000]    min=1,max=10000
//   Column Chunk: name ['Alice'...]  (字典编码)
//   Column Chunk: age  [25...]       min=18,max=65
// Row Group 1 (10000行)
//   Column Chunk: id   [10001..20000]
//   ...

// 读取时谓词下推
SELECT name FROM users WHERE age > 50;
// Row Group 0: max=65 > 50 → 需要读取
// Row Group 1: max=40 
#### ❓ 追问
Parquet和ORC的区别？答：都是列存格式。Parquet跨平台更通用(Spark/Flink/Trino)，ORC是Hive生态优化更好。

---
## 41. 分布式系统的故障检测？

> **难度**: hard | **分类**: DDIA | **ID**: 541

#### 🎯 本质
故障检测是判断节点**是真故障还是网络慢**。用**心跳+超时+Phi Accrual**检测器。

#### 🧒 类比
故障检测像点名——没答到可能是走神了(网络慢)，也可能是真缺课(故障)。多点几次名确认。

#### 📊 图解
心跳超时: N秒没心跳→标记故障(简单但不准确)
Phi Accrual: 计算故障概率→连续累积(更精准)
SWIM: 随机探测+谣言传播(去中心化)
#### 🔧 详解
心跳超时：简单但不可靠(网络波动误报)。Phi Accrual检测器(Cassandra/ZooKeeper使用)：基于历史心跳间隔的统计学方法，输出故障概率(0-1)而非二元判断。可调灵敏度。SWIM协议：每个节点随机探测另一个节点，探测失败则请第三方确认，信息通过gossip传播。优势：无中心化、负载均衡。

#### 💻 代码
// Phi Accrual故障检测器
class PhiAccrualDetector {
  constructor() {
    this.intervals = [];  // 最近N次心跳间隔
    this.maxSamples = 100;
  }
  
  heartbeat() {
    const now = Date.now();
    if (this.lastHeartbeat) {
      this.intervals.push(now - this.lastHeartbeat);
      if (this.intervals.length > this.maxSamples)
        this.intervals.shift();
    }
    this.lastHeartbeat = now;
  }
  
  phi() {
    const mean = avg(this.intervals);
    const std = stddev(this.intervals);
    const elapsed = Date.now() - this.lastHeartbeat;
    // 正态分布CDF计算故障概率
    const y = (elapsed - mean) / std;
    return -Math.log(normalCDF(-y));
    // phi > 8.0 通常认为故障
  }
}
#### ❓ 追问
Phi值多大认为故障？答：通常阈值设8.0，值越大越确定故障。可根据场景调整灵敏度。

---
## 42. 数据分区(Sharding)策略？

> **难度**: medium | **分类**: DDIA | **ID**: 542

#### 🎯 本质
数据分区将**大数据集分散到多个节点**。策略包括**范围分区/哈希分区/一致性哈希**。

#### 🧒 类比
分区像分班——按姓的首字母分(范围)、按学号取模分(哈希)、按圆环位置分(一致性哈希)。

#### 📊 图解
范围: A-M→节点1, N-Z→节点2 (范围查询好)
哈希: hash(key)%N (分布均匀但范围查询差)
一致性哈希: 环形空间(增减节点只影响邻居)
#### 🔧 详解
范围分区：按key的范围分(如A-M, N-Z)。范围查询高效，但可能数据倾斜(热门前缀集中)。哈希分区：hash(key)%N确定节点。分布均匀但范围查询需要扫描所有节点。一致性哈希(Consistent Hashing)：将key和节点映射到环形空间，顺时针找最近的节点。增减节点只影响相邻节点，最小化数据迁移。用于Dynamo/Cassandra/Ring。

#### 💻 代码
// 一致性哈希
class ConsistentHash {
  constructor(nodes) {
    this.ring = new Map();
    nodes.forEach(n => {
      // 每个节点映射多个虚拟节点
      for (let i = 0; i =h的节点
    const idx = this.sortedKeys.findIndex(k => k >= h);
    const nodeIdx = idx >= 0 ? idx : 0;
    return this.ring.get(this.sortedKeys[nodeIdx]);
  }
}
#### ❓ 追问
虚拟节点的作用？答：让小节点承载少量虚拟节点、大节点承载更多，实现负载均衡。

---
## 43. 物化视图 vs 虚拟视图？

> **难度**: medium | **分类**: DDIA | **ID**: 543

#### 🎯 本质
物化视图**预计算并存储结果**(空间换时间)，虚拟视图**查询时动态计算**(省空间但慢)。

#### 🧒 类比
物化视图像提前做好的摘抄本(快但占空间)，虚拟视图像临时翻书查(慢但不占额外空间)。

#### 📊 图解
虚拟视图: SELECT时动态计算(无存储)
物化视图: 预计算+存储(需刷新)
  查询快但数据可能过时
#### 🔧 详解
虚拟视图(View)：存储SQL定义，查询时动态执行。不占额外空间但每次查询都要计算。物化视图(Materialized View)：预先执行查询并存储结果。查询快但需要刷新策略：(1)同步刷新(写入时更新，影响写性能)；(2)定时刷新(周期性重建，有延迟窗口)；(3)增量刷新(只更新变化的部分)。用于预聚合、多维度报表、数据仓库。

#### 💻 代码
-- 物化视图示例
CREATE MATERIALIZED VIEW daily_sales AS
SELECT 
  DATE(created_at) as day,
  product_id,
  SUM(amount) as total,
  COUNT(*) as orders
FROM orders
GROUP BY 1, 2;

-- 查询物化视图(毫秒级)
SELECT * FROM daily_sales WHERE day = '2026-01-15';

-- 刷新策略
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;
#### ❓ 追问
物化视图的增量刷新？答：只重新计算变化的数据(如通过时间戳过滤)，比全量刷新快很多。

---
## 44. 拜占庭容错(BFT)？

> **难度**: hard | **分类**: DDIA | **ID**: 544

#### 🎯 本质
拜占庭容错处理**节点可能撒谎**(恶意/故障发送矛盾信息)的场景，需要**3f+1**个节点容忍f个叛徒。

#### 🧒 类比
拜占庭像战争——可能有叛徒(恶意节点)发假情报，将军们需要在不信任的环境中达成一致。

#### 📊 图解
普通容错: 节点可能宕机(但不撒谎)
拜占庭容错: 节点可能撒谎(发送矛盾信息)
PBFT: 需要3f+1节点容忍f个叛徒
#### 🔧 详解
普通分布式共识(Paxos/Raft)假设节点是'fail-stop'——故障就停机，不会恶意行为。拜占庭故障：节点可能发送矛盾信息(软件bug/硬件错误/恶意攻击)。PBFT(Practical BFT)：需要3f+1个节点才能容忍f个拜占庭节点。三阶段协议：Pre-prepare→Prepare→Commit。区块链(工作量证明)是另一种BFT方案。实际中大多数系统不考虑拜占庭故障(成本太高)。

#### 💻 代码
// PBFT简化流程
class PBFTNode {
  onRequest(request) {
    // Phase 1: Leader广播Pre-prepare
    this.broadcast({type:'pre-prepare', view:this.view, seq:this.nextSeq()});
  }
  onPrePrepare(msg) {
    // Phase 2: 验证并广播Prepare
    if (this.verify(msg)) {
      this.broadcast({type:'prepare', view:msg.view, seq:msg.seq});
    }
  }
  onPrepare(msg) {
    // Phase 3: 收集2f个Prepare后广播Commit
    if (this.prepareCount(msg) >= 2 * this.faulty) {
      this.broadcast({type:'commit', view:msg.view, seq:msg.seq});
    }
  }
  onCommit(msg) {
    // 收集2f+1个Commit后执行
    if (this.commitCount(msg) >= 2 * this.faulty + 1) {
      this.execute(msg);
    }
  }
}
#### ❓ 追问
为什么大多数系统不考虑拜占庭？答：3f+1的冗余成本太高，且内部系统可以用其他手段(监控/审计)防止恶意。

---
## 45. DDIA第二版新增了哪些内容？

> **难度**: medium | **分类**: DDIA | **ID**: 545

#### 🎯 本质
DDIA第二版新增了**云原生架构、Serverless数据栈、向量嵌入、湖仓一体、DataFusion**等现代主题。

#### 🧒 类比
DDIA第二版像教材更新——旧知识(分布式基础)不变，新加了AI时代的热门话题(向量搜索/云原生)。

#### 📊 图解
第一版: 分布式基础(存储/复制/事务/共识)
第二版: +云原生+Serverless+向量+湖仓一体
       +DataFusion+数据质量+现代SQL引擎
#### 🔧 详解
DDIA第二版(Martin Kleppmann + Chris Riccomini)主要新增：(1)云原生架构和Serverless数据栈。(2)向量嵌入和相似度搜索(HNSW)。(3)湖仓一体(Iceberg/Delta Lake/Hudi)。(4)DataFusion和Arrow生态。(5)DataFusion/现代SQL引擎。(6)数据质量和治理实践。(7)事件溯源和CQRS深入。(8)GraphQL和现代API设计。核心思想不变：深入理解底层原理才能做好架构权衡。

#### 💻 代码
// DDIA第二版核心知识点
const ddia2Topics = [
  'Cloud-Native Data Systems',
  'Serverless + DataFusion + Arrow',
  'Vector Embeddings + ANN Search',
  'Lakehouse (Iceberg/Delta/Hudi)',
  'Event Sourcing + CQRS',
  'GraphQL + Modern APIs',
  'Data Quality + Governance',
  'CDC + Real-time Integration'
];
// 面试建议：理解第一版核心(复制/事务/共识)
// + 掌握第二版新主题(向量/湖仓/Serverless)
#### ❓ 追问
DDIA第一版和第二版的区别？答：第一版聚焦分布式基础理论，第二版增加了云原生/AI时代的新技术和实践。

---
