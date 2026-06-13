# 系统设计

> 共 20 题

## 1. 设计一个短链接系统？

> **难度**: hard | **分类**: 系统设计 | **ID**: 431

#### 🎯 本质
短链接：长URL→短码→重定向。核心：**唯一ID生成+映射存储+302重定向**。

#### 🧒 类比
短链接像快递单号——长地址编成短码，输入短码重定向到原地址。

#### 📊 图解
1.生成短码(hash/自增ID+base62)
2.存储映射(数据库/缓存)
3.302重定向
#### 🔧 详解
生成策略：自增ID转base62(0-9a-zA-Z)或MD5取前6位。存储：MySQL+Redis缓存热点。302重定向(可以统计点击)。预生成短码池提高写入性能。

#### 💻 代码
// 短码生成
function toBase62(num){
  const chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result='';
  while(num>0){result=chars[num%62]+result;num=Math.floor(num/62);}
  return result||'0';
}
// 重定向
app.get('/:code',async(req,res)=>{
  const url=await redis.get(req.params.code)||await db.getUrl(code);
  if(url) res.redirect(302,url);
  else res.status(404).send('Not found');
});
#### ❓ 追问
301和302的区别？答：301永久(浏览器缓存)，302临时(每次经过服务器可统计)。

---
## 2. 设计一个消息推送系统？

> **难度**: hard | **分类**: 系统设计 | **ID**: 432

#### 🎯 本质
消息推送：WebSocket长连接+消息队列+离线存储+多端同步。

#### 🧒 类比
消息推送像快递送货——实时送(WSS)不在家存快递柜(离线)回来再取。

#### 📊 图解

```
客户端→WSS→消息队列→推送服务
```

#### 🔧 详解
WebSocket保持长连接。消息队列(Kafka/RabbitMQ)缓冲消息。离线消息存数据库。上线后拉取离线消息。心跳检测连接状态。

#### 💻 代码
// WebSocket服务
const wss=new WebSocket.Server({port:8080});
wss.on('connection',ws=>{
  ws.on('message',msg=>{
    const data=JSON.parse(msg);
    // 存储离线消息
    saveMessage(data);
    // 广播或定向推送
    broadcast(data);
  });
  // 发送离线消息
  sendOfflineMessages(ws);
});
#### ❓ 追问
如何保证消息不丢？答：消息持久化+ACK确认+重试机制。

---
## 3. 设计一个搜索引擎？

> **难度**: hard | **分类**: 系统设计 | **ID**: 433

#### 🎯 本质
搜索引擎：**爬虫→索引→查询**。倒排索引(Inverted Index)是核心数据结构。

#### 🧒 类比
搜索引擎像图书馆——爬虫(采购)→索引(编目)→查询(检索)。

#### 📊 图解

```
爬虫→分词→倒排索引→查询→排序
```

#### 🔧 详解
爬虫抓取网页。分词器将文本拆分为词。倒排索引：词→包含该词的文档列表。查询时从索引找到匹配文档。TF-IDF或BM25计算相关性排序。

#### 💻 代码
// 倒排索引
const invertedIndex={};
function index(doc){
  const words=tokenize(doc.text);
  words.forEach(word=>{
    if(!invertedIndex[word]) invertedIndex[word]=[];
    invertedIndex[word].push({id:doc.id,tf:count(words,word)});
  });
}
function search(query){
  const words=tokenize(query);
  const results=words.map(w=>invertedIndex[w]||[]);
  return intersect(results).sort(byRelevance);
}
#### ❓ 追问
什么是TF-IDF？答：词频-逆文档频率，衡量词的重要程度。

---
## 4. 设计一个限流器？

> **难度**: medium | **分类**: 系统设计 | **ID**: 434

#### 🎯 本质
限流：**固定窗口/滑动窗口/令牌桶/漏桶**。防止API被过度调用。

#### 🧒 类比
限流像地铁站限流——人太多就控制进站速度。

#### 📊 图解
固定窗口: 计数+重置
滑动窗口: 精确计数
令牌桶: 匀速+允许突发
漏桶: 匀速输出
#### 🔧 详解
固定窗口简单但不精确(边界突发)。滑动窗口更精确。令牌桶允许突发流量(匀速生成令牌)。漏桶匀速输出(平滑流量)。分布式限流用Redis+Lua原子操作。

#### 💻 代码
// 令牌桶(Redis)
const script=`
local tokens=redis.call('get',KEYS[1]) or ARGV[2]
local rate=tonumber(ARGV[1])
local capacity=tonumber(ARGV[2])
local now=tonumber(ARGV[3])
local fill=(now-last)*rate
tokens=math.min(capacity,tokens+fill)
if tokens>=1 then
  redis.call('set',KEYS[1],tokens-1)
  return 1
else return 0 end`;
redis.eval(script,1,'rate_limit:user1',10,100,Date.now());
#### ❓ 追问
分布式限流怎么实现？答：Redis+Lua保证原子性。

---
## 5. 设计一个秒杀系统？

> **难度**: hard | **分类**: 系统设计 | **ID**: 435

#### 🎯 本质
秒杀：**高并发瞬间流量**。限流+缓存+异步下单+库存预热。

#### 🧒 类比
秒杀像春运抢票——瞬间涌入大量请求，要快速过滤保证不超卖。

#### 📊 图解
1.前端: 按钮防抖+倒计时
2.网关: 限流+黑名单
3.服务: Redis预减库存
4.下单: MQ异步
#### 🔧 详解
前端倒计时防止提前刷接口。Nginx限流。Redis原子减库存(Lua脚本)。消息队列异步下单。数据库最终扣减。

#### 💻 代码
// Redis原子减库存
const lua=`
local stock=redis.call('get',KEYS[1])
if tonumber(stock)
#### ❓ 追问
如何防止超卖？答：Redis+Lua原子操作保证库存不会为负。

---
## 6. 设计单点登录(SSO)？

> **难度**: medium | **分类**: 系统设计 | **ID**: 436

#### 🎯 本质
SSO：**一次登录访问所有系统**。CAS/OAuth2.0/JWT方案。

#### 🧒 类比
SSO像一张通票——买一次票可以玩所有项目。

#### 📊 图解
方案:
CAS: 中央认证服务
OAuth2.0: 授权框架
JWT: 无状态令牌
#### 🔧 详解
CAS：访问子系统→重定向到认证中心→登录→发ticket→回调验证。OAuth2.0：授权码模式最安全。JWT：颁发token各系统自行验证。Session共享用Redis。

#### 💻 代码
// CAS流程
app.use((req,res,next)=>{
  if(!req.session.user&&!req.query.ticket){
    return res.redirect(`https://sso.com/login?service=${encodeURIComponent(req.url)}`);
  }
  if(req.query.ticket){
    const user=await validateTicket(req.query.ticket);
    req.session.user=user;
  }
  next();
});
#### ❓ 追问
OAuth2.0的授权码模式流程？答：用户→授权→回调code→服务端换token。

---
## 7. 设计CDN架构？

> **难度**: medium | **分类**: 系统设计 | **ID**: 437

#### 🎯 本质
CDN：**内容分发网络**，将内容缓存到离用户最近的边缘节点。

#### 🧒 类比
CDN像连锁便利店——不用去总店(源站)就近的分店(边缘节点)就有货。

#### 📊 图解
用户→边缘节点→命中→返回
        ↓未命中
        源站→缓存→返回
#### 🔧 详解
DNS解析时返回离用户最近的边缘节点IP。边缘节点缓存静态资源。未命中回源拉取。适合静态资源/图片/视频。缓存策略：过期时间/主动刷新。

#### 💻 代码
// Nginx缓存配置
proxy_cache_path /var/cache levels=1:2 keys_zone=cdn:100m;
server {
  location /static/ {
    proxy_cache cdn;
    proxy_cache_valid 200 7d;
    proxy_pass http://origin;
  }
}
#### ❓ 追问
CDN的缓存刷新？答：URL purge主动刷新或等TTL过期。

---
## 8. 设计一个Feed流？

> **难度**: hard | **分类**: 系统设计 | **ID**: 438

#### 🎯 本质
Feed流：**推模式/拉模式/推拉结合**。核心：如何高效获取关注人的动态。

#### 🧒 类比
Feed流像朋友圈——看到关注的人发的动态。要快速、按时间排序。

#### 📊 图解
推模式: 写时扩散(发帖推到粉丝信箱)
拉模式: 读时聚合(刷新时拉取关注人帖子)
推拉: 大V拉+普通推
#### 🔧 详解
推模式：发帖时写入所有粉丝的信箱(写扩散)。适合粉丝少读多写少的场景。拉模式：刷新时查询关注人的帖子(读聚合)。适合粉丝多写多读少的场景。推拉结合：大V用拉模式，普通用户用推模式。

#### 💻 代码
// 推模式
async function publish(userId,content){
  const postId=await db.createPost(userId,content);
  const followers=await db.getFollowers(userId);
  // 写入所有粉丝的timeline
  await redis.lpush(
    ...followers.map(f=>({key:`timeline:${f}`,value:postId}))
  );
}
// 拉模式
async function getFeed(userId){
  const following=await db.getFollowing(userId);
  return await db.getLatestPosts(following,limit=20);
}
#### ❓ 追问
推模式的问题？答：大V粉丝千万写扩散极慢。拉模式的问题？答：关注多时读聚合慢。

---
## 9. 设计一个图片上传服务？

> **难度**: medium | **分类**: 系统设计 | **ID**: 439

#### 🎯 本质
图片上传：**客户端直传OSS+CDN加速+图片处理(裁剪/压缩)**。

#### 🧒 类比
图片上传像寄快递——打包(压缩)→发到集散中心(OSS)→配送到家(CDN)。

#### 📊 图解
1.客户端申请上传凭证
2.直传OSS/S3
3.异步处理(缩略图/水印)
4.CDN分发
#### 🔧 详解
客户端先请求上传凭证(STS临时凭证)。直传OSS/S3避免经过应用服务器。上传成功后触发异步处理(缩略图/压缩/水印)。CDN加速图片访问。

#### 💻 代码
// 服务端签发上传凭证
app.get('/upload-token',(req,res)=>{
  const policy={expiration:new Date(Date.now()+3600000),
    conditions:[['content-length-range',0,5*1024*1024]]};
  const token=oss.signPolicy(policy);
  res.json({uploadUrl:'https://oss.example.com',token});
});
// 客户端直传
const formData=new FormData();
formData.append('file',file);
formData.append('policy',token);
fetch(uploadUrl,{method:'POST',body:formData});
#### ❓ 追问
为什么要客户端直传？答：避免文件经过应用服务器节省带宽。

---
## 10. API网关设计？

> **难度**: medium | **分类**: 系统设计 | **ID**: 440

#### 🎯 本质
API网关是**所有API请求的统一入口**：路由/鉴权/限流/监控/日志。

#### 🧒 类比
API网关像公司前台——所有来访(请求)先到前台统一登记/验证/指引。

#### 📊 图解
客户端→API网关→微服务
  |鉴权|限流|路由|日志|
#### 🔧 详解
统一入口管理所有API。路由到后端微服务。鉴权和限流。请求/响应转换。监控和日志聚合。常见实现：Nginx/Kong/APISIX。

#### 💻 代码
// Kong配置
// 添加服务
curl -X POST http://localhost:8001/services -d name=user-service -d url=http://user:3000
// 添加路由
curl -X POST http://localhost:8001/services/user-service/routes -d paths[]=/api/users
// 添加限流插件
curl -X POST http://localhost:8001/routes/user-route/plugins -d name=rate-limiting -d config.minute=100
#### ❓ 追问
API网关和Nginx的区别？答：Nginx是通用反向代理，API网关专注API管理(鉴权/限流/转换)。

---
## 11. 设计一个延迟任务系统？

> **难度**: hard | **分类**: 系统设计 | **ID**: 441

#### 🎯 本质
延迟任务：**时间轮/延迟队列/Redis ZSET/定时扫描**。到时间触发执行。

#### 🧒 类比
延迟任务像定时炸弹——设好时间到点自动执行。

#### 📊 图解
方案:
1.Redis ZSET(score=执行时间)
2.时间轮
3.DelayQueue(Java)
4.RabbitMQ TTL+DLX
#### 🔧 详解
Redis ZSET：score存执行时间，定时轮询取出到期的任务。时间轮：高效管理大量定时任务。MQ的延迟消息：RabbitMQ设置TTL+死信队列。

#### 💻 代码
// Redis ZSET
async function addDelayTask(task,delayMs){
  const executeAt=Date.now()+delayMs;
  await redis.zadd('delay_tasks',executeAt,JSON.stringify(task));
}
// 消费者定时轮询
setInterval(async()=>{
  const now=Date.now();
  const tasks=await redis.zrangebyscore('delay_tasks',0 now,'LIMIT',0,100);
  tasks.forEach(t=>{processTask(t);redis.zrem('delay_tasks',t);});
},1000);
#### ❓ 追问
如何保证任务不丢？答：先处理再删除(ZREM)，处理失败重新入队。

---
## 12. 负载均衡策略？

> **难度**: medium | **分类**: 系统设计 | **ID**: 442

#### 🎯 本质
负载均衡将请求**分发到多台服务器**。策略：轮询/加权/最少连接/哈希。

#### 🧒 类比
负载均衡像分诊台——把病人(请求)合理分配给不同医生(服务器)。

#### 📊 图解
策略:
轮询(Round Robin)
加权轮询(Weighted)
最少连接(Least Conn)
IP哈希(IP Hash)
随机(Random)
#### 🔧 详解
轮询：依次分配最简单。加权：性能好的服务器多分配。最少连接：分配给当前连接最少的。IP哈希：同一IP分配到同一服务器(会话保持)。四层(L4)基于IP/端口，七层(L7)基于HTTP内容。

#### 💻 代码
// Nginx配置
upstream backend {
  server 10.0.0.1 weight=3;
  server 10.0.0.2 weight=2;
  server 10.0.0.3 backup;
  least_conn;
}
server {
  location / {
    proxy_pass http://backend;
  }
}
#### ❓ 追问
什么是健康检查？答：定期检测后端服务器是否可用，不可用则自动剔除。

---
## 13. 设计一个分布式ID生成器？

> **难度**: hard | **分类**: 系统设计 | **ID**: 443

#### 🎯 本质
分布式ID要求**全局唯一、趋势递增、高性能**。雪花算法最常用。

#### 🧒 类比
分布式ID像身份证号——全国唯一且有序。

#### 📊 图解
方案:
UUID: 无序
数据库自增: 性能差
雪花算法: 推荐
Leaf: 美团方案
#### 🔧 详解
雪花算法：64位=1位符号+41位时间戳+10位机器ID+12位序列号。单机每毫秒可生成4096个ID。时间有序。机器ID通过ZK分配。时钟回拨问题需要处理。

#### 💻 代码
// 雪花算法
class Snowflake{
  constructor(machineId){this.machine=machineId;this.seq=0;this.lastTime=0;}
  nextId(){
    const now=Date.now();
    if(now===this.lastTime){
      this.seq=(this.seq+1)&0xFFF;
      if(this.seq===0) while(Date.now()
#### ❓ 追问
时钟回拨怎么办？答：检测回拨则等待或报警。

---
## 14. 分布式缓存一致性？

> **难度**: medium | **分类**: 系统设计 | **ID**: 444

#### 🎯 本质
缓存和数据库一致性：**Cache Aside+延迟双删+Canal监听binlog**。

#### 🧒 类比
缓存一致性像超市标价——价格变了要同步更新所有标价牌(缓存)。

#### 📊 图解
策略:
1.更新DB→删缓存
2.延迟双删
3.binlog监听(Canal)
#### 🔧 详解
最简单：更新数据库后删除缓存。延迟双删：先删缓存→更新DB→延迟再删缓存(防止旧读回填)。Canal监听MySQL binlog自动同步缓存。最终一致性而非强一致性。

#### 💻 代码
// 延迟双删
async function update(id,data){
  await redis.del(`user:${id}`);     // 第一次删
  await db.update(id,data);           // 更新DB
  setTimeout(()=>redis.del(`user:${id}`),500); // 延迟再删
}
#### ❓ 追问
为什么要延迟双删？答：防止并发读将旧值回填缓存。

---
## 15. 微服务通信方式？

> **难度**: medium | **分类**: 系统设计 | **ID**: 445

#### 🎯 本质
微服务通信：**同步(HTTP/gRPC)和异步(消息队列)**。

#### 🧒 类比
微服务通信像部门间沟通——打电话(同步)或发邮件(异步)。

#### 📊 图解
同步: HTTP REST/gRPC
异步: RabbitMQ/Kafka
事件驱动: Event Sourcing
#### 🔧 详解
同步：HTTP简单但耦合。gRPC高性能(Protobuf序列化+HTTP/2)。异步：消息队列解耦+削峰。事件驱动：发布领域事件，消费端响应。选择依据：需要即时响应用同步，允许延迟用异步。

#### 💻 代码
// gRPC定义(proto3)
service UserService {
  rpc GetUser(UserRequest) returns (UserResponse);
}
// 消息队列
channel.assertQueue('user.created');
channel.sendToQueue('user.created',Buffer.from(JSON.stringify(user)));
#### ❓ 追问
gRPC和REST的区别？答：gRPC二进制更高效、强类型、双向流。REST文本更通用。

---
## 16. 设计一个实时协同编辑器？

> **难度**: hard | **分类**: 系统设计 | **ID**: 446

#### 🎯 本质
协同编辑：**OT(操作转换)或CRDT(无冲突复制数据类型)**。多人同时编辑不冲突。

#### 🧒 类比
协同编辑像多人同时改一份文档——OT是商量好谁先谁后，CRDT是设计出不冲突的操作。

#### 📊 图解
方案:
OT: 操作转换(Google Docs)
CRDT: 无冲突复制
#### 🔧 详解
OT：收到远程操作时根据本地操作历史转换后再应用。CRDT：数据结构本身保证任意顺序操作结果一致(数学特性)。WebSocket实时同步。光标位置同步。

#### 💻 代码
// 简化OT
function transform(op1,op2){
  if(op1.type==='insert'&&op2.type==='insert'){
    if(op1.pos
#### ❓ 追问
OT和CRDT哪个好？答：OT复杂但精确，CRDT简单但数据量可能膨胀。

---
## 17. 数据库读写分离？

> **难度**: medium | **分类**: 系统设计 | **ID**: 447

#### 🎯 本质
读写分离：**主库写、从库读**。主从复制(binlog)。代理层路由读写。

#### 🧒 类比
读写分离像餐厅——厨师(主库)负责做菜(写)，服务员(从库)负责上菜(读)。

#### 📊 图解
写→主库→binlog→从库
读→从库
#### 🔧 详解
主库处理所有写操作。通过binlog同步到从库。应用通过代理(如ProxySQL)或代码层路由读写请求。注意：主从延迟导致读到旧数据。

#### 💻 代码
// 读写路由
const masterPool=mysql.createPool(masterConfig);
const slavePool=mysql.createPool(slaveConfig);
function query(sql,params){
  if(/^\s*SELECT/i.test(sql)) return slavePool.execute(sql,params);
  return masterPool.execute(sql,params);
}
#### ❓ 追问
主从延迟怎么处理？答：关键读走主库、半同步复制、并行复制。

---
## 18. 设计一个配置中心？

> **难度**: medium | **分类**: 系统设计 | **ID**: 448

#### 🎯 本质
配置中心：**集中管理所有服务的配置**。实时推送变更。Apollo/Nacos/etcd。

#### 🧒 类比
配置中心像公司公告栏——所有通知(配置)统一发布各部门实时查看。

#### 📊 图解
功能:
集中存储/版本管理
实时推送/灰度发布
权限管理/审计日志
#### 🔧 详解
集中管理所有服务的配置。支持环境区分(dev/staging/prod)。配置变更实时推送(长轮询/WebSocket)。版本管理和回滚。灰度发布逐步生效。

#### 💻 代码
// Nacos配置监听
import {NacosConfigClient} from 'nacos';
const client=new NacosConfigClient({serverAddr:'localhost:8848'});
const config=await client.getConfig('db-config','DEFAULT_GROUP');
client.subscribe({dataId:'db-config',group:'DEFAULT_GROUP'},content=>{
  console.log('配置变更:',content);
  reloadConfig(content);
});
#### ❓ 追问
Apollo和Nacos的区别？答：Apollo功能更全(灰度/审批)，Nacos集成服务发现更轻量。

---
## 19. 如何设计高可用系统？

> **难度**: hard | **分类**: 系统设计 | **ID**: 449

#### 🎯 本质
高可用：**冗余(多副本)+故障转移+降级+熔断+监控**。目标是99.99%可用性。

#### 🧒 类比
高可用像备用方案——主方案挂了备方案顶上，降级保核心功能。

#### 📊 图解
高可用策略:
1.冗余: 多副本部署
2.故障转移: 自动切换
3.降级: 关闭非核心功能
4.熔断: 快速失败
5.限流: 保护系统
6.监控: 及时发现
#### 🔧 详解
冗余消除单点故障。健康检查+自动故障转移(VIP/Pacemaker)。降级在系统压力大时关闭非核心功能。熔断器模式(Hystrix/Resilience4j)防止级联故障。限流保护系统不被压垮。全链路监控(OpenTelemetry)。

#### 💻 代码
// 熔断器
const breaker=new CircuitBreaker(fetchUser,{
  timeout:3000,errorThreshold:50%,resetTimeout:30000
});
try{const user=await breaker.fire(userId);}
catch(e){/*降级*/return getCachedUser(userId);}
#### ❓ 追问
什么是SLA/SLO/SLI？答：SLA服务等级协议，SLO目标(99.9%)，SLI指标(可用性/延迟)。

---
## 20. 服务降级和熔断？

> **难度**: medium | **分类**: 系统设计 | **ID**: 450

#### 🎯 本质
**降级**在压力大时关闭非核心功能。**熔断**在错误率过高时快速失败防止级联。

#### 🧒 类比
降级像景区限流关闭部分景点，熔断像跳闸——电流过载自动断电保护。

#### 📊 图解
降级: 关闭推荐/评论等非核心
熔断: 三状态(关闭→打开→半开)
#### 🔧 详解
降级策略：读降级(返回缓存)、写降级(异步写)、功能降级(关闭非核心)。熔断器三状态：关闭(正常)→打开(快速失败)→半开(试探恢复)。sentinel/Hystrix实现。

#### 💻 代码
// Sentinel规则
// 降级规则: RT>100ms且窗口内>5次则降级
// 熔断规则: 错误率>50%且请求>10则熔断
// 降级处理
const userService=create({
  fallback:(err)=>({name:'用户[降级]',avatar:'default.png'})
});
#### ❓ 追问
熔断器的半开状态？答：允许少量请求探测，成功则关闭熔断器，失败则继续保持打开。

---
