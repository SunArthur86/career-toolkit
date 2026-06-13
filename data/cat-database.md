# 数据库

> 共 15 题

## 1. SQL和NoSQL的区别？

> **难度**: medium | **分类**: 数据库 | **ID**: 47

#### 🎯 本质
SQL是关系型数据库（结构化表格），NoSQL是非关系型（灵活数据模型）。

#### 🧒 类比
SQL像Excel表格（固定列，严格格式）；NoSQL像便利贴墙（随便贴什么内容）。

#### 📊 对比
         SQL(MySQL)       NoSQL(MongoDB)
数据模型  二维表格         文档/键值/图
Schema   严格预定义        灵活动态
事务      ACID强一致        最终一致(BASE)
扩展     垂直扩展(加配置)   水平扩展(加机器)
查询     SQL标准语法        各自API

选型:结构化数据+事务→SQL | 灵活schema+高并发→NoSQL
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

#### ❓ 追问
在什么场景下选择哪种方案？

---
## 2. MySQL索引类型？

> **难度**: easy | **分类**: 数据库 | **ID**: 72

#### 🎯本质
索引是数据库用于**加速数据检索**的数据结构，类似于书的目录——通过目录可以快速定位到具体内容，避免逐页翻找（全表扫描）。

#### 🧒类比
没有索引像在电话簿里按名字找人（从头翻到尾），有索引像先查目录找页码直接翻过去。

#### 📊图解
MySQL索引类型:
① 主键索引(Primary Key)
  唯一+不为null,每表只有一个
  InnoDB中就是聚簇索引

② 唯一索引(Unique)
  值唯一,允许null
  用于手机号、邮箱等

③ 普通索引(Index)
  无约束,纯粹加速查询
  最灵活

④ 组合索引(Composite)
  多列组合,遵循最左前缀原则
  INDEX(a,b,c) → 可匹配a,ab,abc
  但不能匹配b,c或bc

⑤ 全文索引(Fulltext)
  文本搜索(MATCH AGAINST)
  适合长文本搜索

底层结构:
  B+Tree: 范围查询友好(MySQL默认)
  Hash: 等值查询O(1),不支持范围
  Memory引擎默认用Hash
#### 🔧详解
**最左前缀原则**：组合索引(a,b,c)相当于创建了(a)、(a,b)、(a,b,c)三个索引，查询条件必须从最左列开始。**聚簇索引**：数据和索引存在一起，主键就是聚簇索引。**覆盖索引**：查询的所有列都在索引中，无需回表查数据。

#### 💻代码
-- 创建索引
CREATE INDEX idx_name ON users(name);
CREATE UNIQUE INDEX idx_email ON users(email);
CREATE INDEX idx_composite ON orders(user_id, created_at);

-- 查看执行计划(是否用了索引)
EXPLAIN SELECT * FROM users
  WHERE name = "Tom";
-- type: ref(用了索引) vs ALL(全表扫描)

-- 覆盖索引(不需要回表)
SELECT user_id, created_at FROM orders
  WHERE user_id = 1;
-- 如果有INDEX(user_id, created_at)
-- 索引包含了所有查询列

-- 索引失效的场景
SELECT * FROM users
  WHERE LEFT(name, 1) = "T";  -- 函数导致失效
SELECT * FROM users
  WHERE name LIKE "%Tom%";    -- 前缀%失效
SELECT * FROM users
  WHERE age + 1 = 20;         -- 计算导致失效
#### ❓追问
什么是最左前缀原则？答：组合索引从左到右依次匹配，跳过左边的列会导致后面的列无法使用索引。什么是覆盖索引？答：查询所需的所有列都在索引树中，不需要回表查主键数据，性能最优。

---
## 3. 事务的ACID特性？

> **难度**: medium | **分类**: 数据库 | **ID**: 73

#### 🎯本质
ACID是数据库事务的**四个核心特性**，保证即使在系统故障或并发访问的情况下，数据库操作也能**可靠、一致**地执行。

#### 🧒类比
ACID像银行的转账规则——原子性：转出和转入要么都完成要么都取消；一致性：钱的总数不变；隔离性：两个人同时转账互不影响；持久性：转完账后记录永久保存。

#### 📊图解
A - Atomicity(原子性)
  事务是不可分割的最小执行单位
  要么全部成功,要么全部回滚
  实现: undo log(回滚日志)

C - Consistency(一致性)
  事务前后数据满足完整性约束
  如外键、唯一约束、余额>=0
  实现: 由A+I+D共同保证

I - Isolation(隔离性)
  并发事务之间互不干扰
  四个隔离级别(从低到高):
  读未提交→脏读(能读未提交数据)
  读已提交→不可重复读(两次读不同)
  可重复读→幻读(MySQL默认,RR)
  串行化→性能最差但最安全

D - Durability(持久性)
  提交后数据永久保存
  即使系统崩溃也不丢失
  实现: redo log(重做日志)
#### 🔧详解
**MySQL默认隔离级别**是可重复读(RR)，通过MVCC（多版本并发控制）实现。InnoDB通过**undo log**实现原子性（回滚用），**redo log**实现持久性（崩溃恢复用），**MVCC+锁**实现隔离性。一致性是目标，由其他三个特性共同保证。

#### 💻代码
-- 事务基本操作
START TRANSACTION;
UPDATE accounts SET balance = balance - 100
  WHERE id = 1;  -- 转出
UPDATE accounts SET balance = balance + 100
  WHERE id = 2;  -- 转入
-- 如果出错:
ROLLBACK;
-- 如果正常:
COMMIT;

-- 设置隔离级别
SET TRANSACTION ISOLATION LEVEL
  READ COMMITTED;

-- Spring中声明式事务(@Transactional)
@Transactional(isolation = Isolation.READ_COMMITTED)
public void transfer(int from, int to, int amount) {
  accountDao.debit(from, amount);
  accountDao.credit(to, amount);
}

-- 查看当前隔离级别
SELECT @@transaction_isolation;
#### ❓追问
MySQL的RR级别如何解决幻读？答：通过Next-Key Lock（行锁+间隙锁），锁住记录及其间隙防止插入。什么是MVCC？答：每行数据有隐藏的版本号，读取时根据事务ID选择可见版本，实现无锁读。

---
## 4. Redis常用数据结构？

> **难度**: medium | **分类**: 数据库 | **ID**: 74

#### 🎯本质
Redis是**基于内存的键值数据库**，提供丰富的数据结构，读写速度极快（单线程+IO多路复用）。五种基本数据结构覆盖了缓存、队列、排行榜等常见场景。

#### 🧒类比
Redis像一个超级快的快递柜——每个格子（key）可以放不同形状的包裹（String/Hash/List/Set/ZSet），取放都是毫秒级。

#### 📊图解
五种基本数据结构:
① String: 最基础,可存字符串/数字/JSON
   应用: 缓存、计数器、分布式锁
   SET key value / GET key / INCR key

② Hash: 字段-值映射(像小对象)
   应用: 存用户信息、商品详情
   HSET user:1 name Tom / HGET user:1 name

③ List: 有序可重复列表(双向链表)
   应用: 消息队列、最新列表、栈/队列
   LPUSH key value / LRANGE key 0 -1

④ Set: 无序不重复集合
   应用: 去重、标签、共同关注(交集)
   SADD key member / SINTER key1 key2

⑤ ZSet(有序集合): 带分数的Set
   应用: 排行榜、延迟队列、热搜
   ZADD key score member / ZRANK key member

三大缓存问题:
  缓存穿透:查不存在的数据→布隆过滤器
  缓存击穿:热点key过期→互斥锁/永不过期
  缓存雪崩:大量key同时过期→随机过期时间
#### 🔧详解
Redis单线程为什么快？**纯内存操作**（纳秒级）+**IO多路复用**（epoll）+**避免上下文切换**。Redis 6.0引入多线程IO处理网络读写，但命令执行仍是单线程。**持久化**：RDB（快照）+ AOF（追加日志），生产环境通常两者都开。

#### 💻代码
// String: 缓存+计数器
await redis.set("user:1", JSON.stringify(user));
await redis.get("user:1");
await redis.incr("page:views"); // 原子自增

// Hash: 存对象
await redis.hset("user:1", "name", "Tom");
await redis.hset("user:1", "age", "25");
await redis.hgetall("user:1");

// ZSet: 排行榜
await redis.zadd("rank", 100, "Tom");
await redis.zadd("rank", 200, "Jerry");
await redis.zrevrange("rank", 0, 9, "WITHSCORES");

// 分布式锁
const lock = await redis.set("lock:order",
  "1", "NX", "EX", 30); // 不存在才设,30秒过期
if (lock) {
  // 执行业务
  await redis.del("lock:order"); // 释放锁
}
#### ❓追问
Redis和Memcached的区别？答：Redis支持更多数据结构、持久化、主从复制。Memcached只支持简单KV、纯内存。Redis集群方案？答：主从复制+哨兵(Sentinel)实现高可用，Cluster实现分片。布隆过滤器原理？答：位数组+多个哈希函数，判断元素是否存在，有误判率但不会漏判。

---
## 5. MySQL索引原理？

> **难度**: medium | **分类**: 数据库 | **ID**: 300

#### 🎯 本质
MySQL InnoDB用**B+树**作为索引结构。聚簇索引(主键)存储行数据，二级索引存储主键值。

#### 🧒 类比
B+树索引像图书馆目录——按字母排序(有序)快速定位书的位置。

#### 📊 图解
B+树特点:
1.非叶子节点只存键值
2.叶子节点链表相连(范围查询快)
3.树高度低(3-4层存千万行)

聚簇索引: 数据和索引在一起
二级索引: 存主键值(需回表)
#### 🔧 详解
B+树每个节点可以存多个键值(相比二叉树更矮)。叶子节点形成有序链表适合范围查询。聚簇索引(主键)的叶子节点存完整行数据。二级索引的叶子节点存主键值，查询非索引列需要回表(查聚簇索引)。

#### 💻 代码
// 创建索引
CREATE INDEX idx_name ON users(name);
CREATE UNIQUE INDEX idx_email ON users(email);
// 复合索引(最左前缀)
CREATE INDEX idx_name_age ON users(name,age);
// 查看执行计划
EXPLAIN SELECT * FROM users WHERE name='Tom';
#### ❓ 追问
什么是回表？答：二级索引查到主键后再查聚簇索引获取完整数据。覆盖索引？答：索引包含查询所需的所有列不需要回表。

---
## 6. 事务ACID特性？

> **难度**: medium | **分类**: 数据库 | **ID**: 301

#### 🎯 本质
事务的四个特性：**原子性(Atomicity)、一致性(Consistency)、隔离性(Isolation)、持久性(Durability)**。

#### 🧒 类比
ACID像银行转账——要么全成功要么全回滚(原子)，余额守恒(一致)，同时转账不互相影响(隔离)，记录永久保存(持久)。

#### 📊 图解
ACID:
A原子性: 全部成功或全部失败
C一致性: 数据从一个有效状态到另一个
I隔离性: 并发事务互不干扰
D持久性: 提交后永久保存

隔离级别:
读未提交→读已提交→可重复读→串行化
#### 🔧 详解
原子性通过undo log实现(失败时回滚)。一致性由应用层保证。隔离性通过锁和MVCC实现。持久性通过redo log实现(先写日志再写数据)。MySQL默认隔离级别是可重复读(REPEATABLE READ)。

#### 💻 代码
// MySQL事务
START TRANSACTION;
UPDATE accounts SET balance=balance-100 WHERE id=1;
UPDATE accounts SET balance=balance+100 WHERE id=2;
COMMIT;
// 回滚
ROLLBACK;
// 设置隔离级别
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
#### ❓ 追问
什么是MVCC？答：多版本并发控制，读写不冲突。四种隔离级别分别解决什么问题？答：脏读→不可重复读→幻读。

---
## 7. SQL基本查询？

> **难度**: easy | **分类**: 数据库 | **ID**: 302

#### 🎯 本质
SQL查询：**SELECT**(选择) / **WHERE**(过滤) / **JOIN**(连接) / **GROUP BY**(分组) / **ORDER BY**(排序)。

#### 🧒 类比
SQL查询像在Excel中筛选——选列(SELECT)+筛选(WHERE)+排序(ORDER BY)+合并(JOIN)。

#### 📊 图解
基础:
SELECT col FROM table WHERE cond
JOIN: INNER/LEFT/RIGHT/FULL
GROUP BY + HAVING
ORDER BY col ASC/DESC
LIMIT n OFFSET m
#### 🔧 详解
SELECT指定查询列。WHERE过滤行。JOIN连接表(INNER交集/LEFT左表全/RIGHT右表全)。GROUP BY分组聚合(COUNT/SUM/AVG/MAX/MIN)。HAVING过滤分组。ORDER BY排序。LIMIT分页。

#### 💻 代码
SELECT u.name,COUNT(o.id) as orders
FROM users u
LEFT JOIN orders o ON u.id=o.user_id
WHERE u.status='active'
GROUP BY u.id
HAVING orders>5
ORDER BY orders DESC
LIMIT 10 OFFSET 0;
#### ❓ 追问
HAVING和WHERE的区别？答：WHERE过滤行(分组前)，HAVING过滤分组(分组后)。LEFT JOIN和INNER JOIN的区别？答：LEFT保留左表所有行，INNER只保留匹配的。

---
## 8. Redis数据类型和使用场景？

> **难度**: medium | **分类**: 数据库 | **ID**: 303

#### 🎯 本质
Redis支持**5种基础类型**：String/Hash/List/Set/SortedSet。用于缓存/排行榜/计数器/消息队列等。

#### 🧒 类比
Redis像多功能工具箱——不同抽屉(数据类型)放不同的工具(用途)。

#### 📊 图解
数据类型:
String: 缓存/计数器/分布式锁
Hash: 对象存储/购物车
List: 消息队列/最新列表
Set: 去重/标签/共同好友
Sorted Set: 排行榜/延迟队列

特殊: Bitmap/HyperLogLog/Stream
#### 🔧 详解
String可存文本/数字/JSON(最大512MB)。Hash适合存对象(用户信息)。List有序可重复(消息队列)。Set无序不重复(共同好友)。Sorted Set有序不重复(排行榜score排序)。Redis是单线程(避免锁竞争)但IO多路复用。

#### 💻 代码
// Redis命令
SET user:1 '{"name":"Tom"}' EX 3600  // 缓存1小时
GET user:1
INCR page:views  // 计数器
HSET cart:1 item1 2 item2 3  // 购物车
ZADD leaderboard 100 'Tom' 95 'Jerry'  // 排行榜
ZREVRANGE leaderboard 0 9 WITHSCORES  // Top10
SADD user:1:tags '前端' 'Vue'  // 标签
SINTER user:1:tags user:2:tags  // 共同标签
#### ❓ 追问
Redis为什么单线程还快？答：内存操作+IO多路复用+避免锁开销。Redis和Memcached的区别？答：Redis支持更多数据类型、持久化、集群。

---
## 9. 数据库连接池？

> **难度**: medium | **分类**: 数据库 | **ID**: 304

#### 🎯 本质
连接池**预先创建并复用**数据库连接，避免频繁创建/销毁连接的开销。

#### 🧒 类比
连接池像出租车队——提前备好车(连接)，有客(请求)直接派车，不用临时叫车。

#### 📊 图解
连接池参数:
最大连接数(max): 上限
最小空闲数(min): 保底
超时时间(timeout): 等待上限
空闲时间(idle): 回收空闲连接

Node.js: mysql2/pool
Java: HikariCP
#### 🔧 详解
每次创建数据库连接需要TCP握手+认证(开销大)。连接池预先创建若干连接。应用获取空闲连接用完归还而非关闭。超出max连接数时请求等待(超时报错)。合理设置pool size很重要。

#### 💻 代码
// Node.js连接池
const mysql=require('mysql2/promise');
const pool=mysql.createPool({
  host:'localhost',
  user:'root',
  database:'mydb',
  waitForConnections:true,
  connectionLimit:10,
  queueLimit:0
});
// 使用
const [rows]=await pool.execute('SELECT * FROM users WHERE id=?',[userId]);
#### ❓ 追问
连接池大小怎么设置？答：一般CPU核数*2+磁盘数。连接泄漏怎么办？答：设置超时自动回收+监控活跃连接。

---
## 10. 数据库分库分表？

> **难度**: hard | **分类**: 数据库 | **ID**: 305

#### 🎯 本质
当单表数据量过大时，通过**水平分片(sharding)**将数据分布到多个数据库/表中。

#### 🧒 类比
分库分表像把大仓库拆成多个小仓库——按规则(分片键)分配货物(数据)。

#### 📊 图解
分片策略:
水平分表: 按行拆分(按ID范围/Hash)
垂直分库: 按业务拆分(用户库/订单库)

分片键选择:
  均匀分布
  避免跨片查询
  常用查询条件
#### 🔧 详解
水平分表按分片键将数据分配到不同表/库。范围分片(1-10000在表A)简单但可能热点。Hash分片均匀但扩容麻烦。垂直分库将不同业务表拆到不同数据库。引入的问题：跨库JOIN、分布式事务、全局ID(雪花算法)、数据迁移。

#### 💻 代码
// 分片示例(按用户ID取模)
function getTable(userId){
  return `orders_${userId%4}`; // 4张表
}
// 路由到对应表
const table=getTable(userId);
await pool.execute(`SELECT * FROM ${table} WHERE user_id=?`,[userId]);

// 雪花算法ID
// 64bit: 1位符号 + 41位时间戳 + 10位机器ID + 12位序列号
#### ❓ 追问
什么是分布式事务？答：跨多个数据库的事务(2PC/TCC/Saga)。什么时候需要分库分表？答：单表超过千万级。

---
## 11. MongoDB和MySQL的区别？

> **难度**: medium | **分类**: 数据库 | **ID**: 306

#### 🎯 本质
MySQL是**关系型数据库**(表/SQL/事务)。MongoDB是**文档数据库**(JSON/灵活schema/水平扩展)。

#### 🧒 类比
MySQL像Excel表格(严格列定义)，MongoDB像文件夹(每个文件(文档)可以有不同字段)。

#### 📊 图解
MySQL:
  关系型/SQL/表结构/ACID强
  适合: 事务/复杂查询/固定结构

MongoDB:
  文档型/JSON/灵活schema
  适合: 快速迭代/半结构化数据/大数据
#### 🔧 详解
MySQL用SQL操作结构化表数据。MongoDB存储JSON-like文档(BSON)。MySQL的事务更成熟。MongoDB的schema灵活适合快速迭代。MongoDB天然支持水平扩展(分片)。选择依据：数据结构是否固定、是否需要事务、查询模式。

#### 💻 代码
// MongoDB
const {MongoClient}=require('mongodb');
const client=new MongoClient('mongodb://localhost:27017');
await client.connect();
const db=client.db('mydb');
// 插入
await db.collection('users').insertOne({name:'Tom',tags:['js','vue']});
// 查询
const users=await db.collection('users').find({tags:'js'}).toArray();
#### ❓ 追问
什么时候选MongoDB？答：数据结构不固定、需要快速迭代、大量半结构化数据。什么时候选MySQL？答：强事务需求、复杂关联查询。

---
## 12. 数据库优化策略？

> **难度**: medium | **分类**: 数据库 | **ID**: 307

#### 🎯 本质
数据库优化：**索引优化、查询优化、表结构优化、硬件优化**。先慢查询分析再针对性优化。

#### 🧒 类比
数据库优化像给交通系统疏通——先找到拥堵点(慢查询)再加路(索引)/调信号灯(查询)。

#### 📊 图解
优化方向:
1.索引: 添加/优化索引
2.查询: 避免SELECT */子查询→JOIN
3.结构: 字段类型/反范式/分区
4.缓存: Redis缓存热点数据
5.硬件: SSD/增加内存

分析: EXPLAIN / 慢查询日志
#### 🔧 详解
EXPLAIN分析查询执行计划。避免SELECT *只查需要的列。复合索引遵循最左前缀原则。避免在索引列上做函数运算。大表JOIN用小表驱动大表。分页优化用游标代替OFFSET。

#### 💻 代码
// 慢查询分析
EXPLAIN SELECT * FROM users WHERE name LIKE '%Tom%';
// 优化
// 1.避免%开头模糊(用全文索引)
// 2.添加索引
ALTER TABLE users ADD INDEX idx_name(name);
// 3.只查需要的列
SELECT id,name FROM users WHERE name='Tom';
// 4.分页优化
// ❌ SELECT * FROM users LIMIT 100000,10
// ✅ SELECT * FROM users WHERE id>100000 LIMIT 10
#### ❓ 追问
什么是慢查询日志？答：记录执行时间超过阈值的SQL。最左前缀原则？答：复合索引(name,age)能优化WHERE name=?和WHERE name=? AND age=?但不能优化WHERE age=?。

---
## 13. 什么是ORM？

> **难度**: easy | **分类**: 数据库 | **ID**: 308

#### 🎯 本质
ORM(Object-Relational Mapping)用**面向对象的方式操作数据库**，不需要手写SQL。

#### 🧒 类比
ORM像翻译官——你说对象语言(代码)，它翻译成数据库语言(SQL)。

#### 📊 图解
常见ORM:
Prisma: 类型安全/现代化
Sequelize: 老牌/功能全
TypeORM: TypeScript友好

优势:
  不用写SQL/防注入/类型安全
劣势:
  复杂查询受限/性能可能差
#### 🔧 详解
ORM将数据库表映射为类，行映射为对象。自动生成SQL防注入。支持多种数据库切换。但复杂查询(多表JOIN/子查询)可能受限。N+1查询问题需要预加载(eager loading)解决。

#### 💻 代码
// Prisma
const user=await prisma.user.findUnique({
  where:{id:1},
  include:{posts:true} // 预加载
});
await prisma.user.create({
  data:{name:'Tom',email:'tom@mail.com',posts:{create:{title:'Hello'}}}
});
await prisma.user.update({
  where:{id:1},
  data:{name:'Jerry'}
});
#### ❓ 追问
什么是N+1查询？答：查1次获取列表+再查N次获取关联数据。解决方案？答：include预加载(join一次查完)。

---
## 14. Redis缓存策略？

> **难度**: medium | **分类**: 数据库 | **ID**: 309

#### 🎯 本质
Redis缓存策略：**Cache Aside(旁路缓存)**最常用。还有Read/Write Through、Write Behind。

#### 🧒 类比
缓存策略像备忘录——需要时查(旁路)、主动记录(穿透)、攒一批再记(异步)。

#### 📊 图解
Cache Aside(最常用):
  读: 先查缓存→没有查DB→写入缓存
  写: 先更新DB→删除缓存

缓存问题:
  穿透: 查不存在的数据→布隆过滤器
  击穿: 热点key过期→互斥锁
  雪崩: 大量key同时过期→随机TTL
#### 🔧 详解
Cache Aside最常用：读时回填缓存，写时删除缓存(不是更新)。为什么删除不是更新？因为并发写可能导致脏数据。缓存穿透用布隆过滤器/空值缓存。缓存击穿用互斥锁/永不过期。缓存雪崩用随机过期时间。

#### 💻 代码
// Cache Aside实现
async function getUser(id){
  const cached=await redis.get(`user:${id}`);
  if(cached) return JSON.parse(cached);
  const user=await db.user.findById(id);
  if(user) await redis.setex(`user:${id}`,3600,JSON.stringify(user));
  return user;
}
// 更新
async function updateUser(id,data){
  await db.user.update(id,data);
  await redis.del(`user:${id}`); // 删缓存
}
#### ❓ 追问
为什么是删除缓存不是更新？答：并发场景下更新可能导致旧值覆盖新值。

---
## 15. 什么是NoSQL？

> **难度**: easy | **分类**: 数据库 | **ID**: 310

#### 🎯 本质
NoSQL是**非关系型数据库**的总称：文档(MongoDB)/键值(Redis)/列族(Cassandra)/图(Neo4j)。

#### 🧒 类比
NoSQL像多功能收纳——不限于表格(关系型)，可以是文件夹(文档)/标签(键值)/网格(列)/网(图)。

#### 📊 图解
NoSQL类型:
键值: Redis(缓存/会话)
文档: MongoDB(JSON文档)
列族: Cassandra(大数据/时序)
图: Neo4j(社交网络/关系)

CAP定理:
C一致性 A可用性 P分区容错
#### 🔧 详解
NoSQL牺牲关系型特性(ACID/SQL/JOIN)换取灵活性/可扩展性/高性能。CAP定理：分布式系统只能同时满足三个中的两个(通常选AP)。最终一致性vs强一致性。

#### 💻 代码
// 选择建议
// 关系型(MySQL): 事务/复杂查询/固定结构
// Redis: 缓存/排行榜/实时数据
// MongoDB: 灵活schema/快速迭代
// Elasticsearch: 全文搜索/日志分析

// Node.js + MongoDB
const {MongoClient}=require('mongodb');
const docs=await db.collection('logs')
  .find({level:'error'})
  .sort({timestamp:-1})
  .limit(100)
  .toArray();
#### ❓ 追问
什么是CAP定理？答：一致性/可用性/分区容错性三者只能取其二。

---
