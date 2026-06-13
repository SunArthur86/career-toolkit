# Java

> 共 17 题

## 1. Java垃圾回收机制？

> **难度**: medium | **分类**: Java | **ID**: 484

#### 🎯 本质
JVM垃圾回收**自动回收不再引用的对象**。标记-清除/标记-整理/复制算法。

#### 🧒 类比
GC像环卫工——自动扫走没人用的垃圾(对象)，不需要手动清理。

#### 📊 图解
算法:
标记-清除: 标记→清除(有碎片)
复制: 分两块→活对象复制(无碎片)
标记-整理: 标记→整理到一端
#### 🔧 详解
JVM堆分为新生代(Eden+S0+S1)和老年代。新对象在Eden创建。Minor GC用复制算法清理新生代。Major GC/Full GC清理老年代。GC Roots(栈引用/静态变量/JNI)作为起点标记存活对象。

#### 💻 代码
// JVM参数
-Xms256m -Xmx1g          // 堆大小
-XX:+UseG1GC              // 使用G1收集器
-XX:NewRatio=2            // 新生代:老年代=1:2
-XX:+PrintGCDetails       // 打印GC日志
#### ❓ 追问
CMS和G1的区别？答：CMS并发低延迟但碎片多，G1分Region可预测停顿时间。

---
## 2. HashMap原理？

> **难度**: easy | **分类**: Java | **ID**: 485

#### 🎯 本质
HashMap用**数组+链表+红黑树**存储。key的hash定位桶，冲突时链表/红黑树。

#### 🧒 类比
HashMap像储物柜——hash值是柜号，同一柜号的东西用链子串起来。

#### 📊 图解
put(k,v):
1.hash(k)%length→桶
2.桶空→直接放
3.桶非空→链表/红黑树查找/插入
#### 🔧 详解
默认容量16，负载因子0.75(超过则扩容2倍)。put时计算hash定位桶。桶为空直接放。不为空遍历链表(或红黑树)查找key。链表长度>8转红黑树。扩容时重新hash分配。线程不安全用ConcurrentHashMap。

#### 💻 代码
// Java HashMap
Map map=new HashMap<>();
map.put("key",1);
map.get("key"); // 1
// hash计算
static final int hash(Object key){
  int h;
  return (key==null)?0:(h=key.hashCode())^(h>>>16);
}
#### ❓ 追问
HashMap和HashTable的区别？答：HashMap非线程安全允许null，HashTable线程安全不允许null。

---
## 3. ==和equals的区别？

> **难度**: easy | **分类**: Java | **ID**: 486

#### 🎯 本质
==比较**引用(地址)**，equals比较**内容**(需重写)。String的equals比较字符串值。

#### 🧒 类比
==像比身份证号(是不是同一个人)，equals像比内容(长得一不一样)。

#### 📊 图解
==: 比较引用地址
equals: 比较内容(需重写)

String s1=new String("a");
String s2=new String("a");
s1==s2 → false
s1.equals(s2) → true
#### 🔧 详解
==对于基本类型比较值，对于引用类型比较地址。Object的equals默认用==。String重写了equals比较字符内容。使用equals要注意null(用Objects.equals或先判空)。hashCode和equals要同时重写(HashMap依赖)。

#### 💻 代码
String s1="hello";      // 字符串常量池
String s2="hello";      // 指向同一对象
String s3=new String("hello"); // 堆新对象
s1==s2;    // true(常量池)
s1==s3;    // false(不同对象)
s1.equals(s3); // true(内容相同)
#### ❓ 追问
为什么重写equals要重写hashCode？答：HashMap先比hashCode再比equals，不一致会导致逻辑错误。

---
## 4. Java线程池？

> **难度**: medium | **分类**: Java | **ID**: 487

#### 🎯 本质
线程池**复用线程**避免频繁创建销毁。核心参数：核心线程数/最大线程数/队列/拒绝策略。

#### 🧒 类比
线程池像出租车队——核心车辆常驻，高峰期加车，队列等车，满了拒载。

#### 📊 图解
ThreadPoolExecutor(
  corePoolSize,
  maximumPoolSize,
  keepAliveTime,
  workQueue,
  rejectedHandler
)
#### 🔧 详解
核心线程常驻不销毁。任务来时先用核心线程。核心满了进队列。队列满了创建新线程到最大线程数。都满了执行拒绝策略(Abort/CallerRuns/Discard)。Executors工具类创建常见线程池。

#### 💻 代码
// 创建线程池
ExecutorService pool=new ThreadPoolExecutor(
  4,                      // 核心线程数
  8,                      // 最大线程数
  60, TimeUnit.SECONDS,   // 空闲存活时间
  new LinkedBlockingQueue<>(100), // 工作队列
  new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
);
pool.execute(()->System.out.println("task"));
#### ❓ 追问
为什么不用Executors创建？答：FixedThreadPool队列无界可能OOM，CachedThreadPool最大线程数Integer.MAX_VALUE可能创建大量线程。

---
## 5. synchronized和ReentrantLock？

> **难度**: medium | **分类**: Java | **ID**: 488

#### 🎯 本质
两者都实现**互斥锁**。synchronized是JVM内置关键字，ReentrantLock是API层面更灵活。

#### 🧒 类比
synchronized像自动门(简单)，ReentrantLock像手动门(灵活但需自己关)。

#### 📊 图解
synchronized: JVM内置,自动释放
ReentrantLock: API层,手动unlock
支持: 公平锁/条件变量/可中断
#### 🔧 详解
synchronized：加在方法或代码块上，JVM自动管理。不可中断。非公平。ReentrantLock：需手动lock/unlock(try-finally)。支持公平锁、条件变量(await/signal)、可中断锁定(lockInterruptibly)、超时获取(tryLock)。

#### 💻 代码
// synchronized
synchronized(obj){
  // 临界区
}
// ReentrantLock
Lock lock=new ReentrantLock(true); // 公平锁
lock.lock();
try{
  // 临界区
}finally{
  lock.unlock(); // 必须手动释放
}
#### ❓ 追问
什么时候用ReentrantLock？答：需要公平锁/条件变量/超时获取/可中断时。

---
## 6. Java基本数据类型？

> **难度**: easy | **分类**: Java | **ID**: 489

#### 🎯 本质
8种基本类型：**byte/short/int/long/float/double/char/boolean**。对应包装类。

#### 🧒 类比
基本类型像零件规格——不同大小(位数)存储不同范围的数据。

#### 📊 图解
byte: 8位(-128~127)
short: 16位
int: 32位
long: 64位
float: 32位
double: 64位
char: 16位(Unicode)
boolean: true/false
#### 🔧 详解
基本类型存值，包装类是对象(Integer/Long等)。自动装箱(Integer i=1)和拆箱(int n=i)。Integer缓存-128~127(==比较true)。注意：Long/Double的==比较用equals。

#### 💻 代码
// 自动装箱拆箱
Integer a=127;   // 缓存池
Integer b=127;
a==b;       // true
Integer c=128;
Integer d=128;
c==d;       // false(超出缓存)
c.equals(d); // true
#### ❓ 追问
Integer缓存范围？答：-128到127。超出则创建新对象。

---
## 7. Java集合框架？

> **难度**: medium | **分类**: Java | **ID**: 490

#### 🎯 本质
集合框架分为**Collection(单列)和Map(双列)**。List有序/Set去重/Queue队列/Map键值对。

#### 🧒 类比
集合像不同容器——List是数组(有顺序)，Set是集合(不重复)，Map是字典(查字典)。

#### 📊 图解
Collection
├── List: ArrayList/LinkedList
├── Set: HashSet/TreeSet
└── Queue: LinkedList/PriorityQueue
Map
├── HashMap/TreeMap
└── LinkedHashMap
#### 🔧 详解
ArrayList：动态数组，随机访问O(1)插入删除O(n)。LinkedList：双向链表，插入删除O(1)随机访问O(n)。HashSet：基于HashMap去重。TreeSet：红黑树有序。HashMap：数组+链表+红黑树。TreeMap：红黑树按键排序。

#### 💻 代码
// 常用操作
List list=new ArrayList<>();
list.add("a");list.get(0);
Set set=new HashSet<>();
set.add(1);set.contains(1);
Map map=new HashMap<>();
map.put("key",1);map.get("key");
#### ❓ 追问
ArrayList和LinkedList选择？答：随机访问多用ArrayList，频繁增删头部用LinkedList。

---
## 8. JVM内存模型？

> **难度**: hard | **分类**: Java | **ID**: 491

#### 🎯 本质
JVM内存分为**堆(对象)、栈(方法栈)、方法区(类信息)、程序计数器、本地方法栈**。

#### 🧒 类比
JVM内存像工厂——堆是仓库(存产品)、栈是工位(方法执行)、方法区是图纸(类信息)。

#### 📊 图解
JVM内存:
堆: 对象实例(GC管理)
方法区: 类信息+常量
栈: 方法调用帧
本地方法栈: Native方法
程序计数器: 当前执行位置
#### 🔧 详解
堆：所有对象实例和数组。GC主要区域(新生代+老年代)。方法区/元空间：类信息、常量池、静态变量。虚拟机栈：每个方法一个栈帧(局部变量+操作数栈)。程序计数器：当前线程执行的字节码行号。本地方法栈：Native方法。

#### 💻 代码
// JVM参数调优
-Xms1g -Xmx4g           // 堆大小
-Xmn256m                // 新生代大小
-XX:MetaspaceSize=256m   // 元空间
-Xss256k                // 栈大小
-XX:+HeapDumpOnOutOfMemoryError // OOM时dump
#### ❓ 追问
OOM怎么排查？答：jmap dump→MAT分析→找大对象/泄漏引用链。

---
## 9. String/StringBuilder/StringBuffer？

> **难度**: medium | **分类**: Java | **ID**: 492

#### 🎯 本质
String**不可变**，StringBuilder**可变非线程安全**，StringBuffer**可变线程安全**。

#### 🧒 类比
String像刻字(不可改)，StringBuilder像白板(可改)，StringBuffer是加锁的白板。

#### 📊 图解
String: 不可变(final char[])
StringBuilder: 可变，非线程安全
StringBuffer: 可变，线程安全(synchronized)
#### 🔧 详解
String对象不可变(用final char[]存储)。每次拼接创建新对象。StringBuilder内部用可变char[]，append不创建新对象。StringBuffer加了synchronized线程安全但慢。单线程拼接用StringBuilder。

#### 💻 代码
// 性能对比
String s="";
for(int i=0;i
#### ❓ 追问
为什么String不可变？答：安全(HashMap key/类加载)、字符串常量池、线程安全。

---
## 10. Java异常体系？

> **难度**: medium | **分类**: Java | **ID**: 493

#### 🎯 本质
异常分为**Checked(编译期检查)和Unchecked(运行期)**。Error是系统级不可恢复。

#### 🧒 类比
异常像看病——Checked是必须打疫苗(编译器强制处理)，Unchecked是感冒(运行时才出现)。

#### 📊 图解
Throwable
├── Error: 系统级(StackOverflow/OOM)
└── Exception
    ├── Checked: IOException/SQLException
    └── Unchecked(Runtime): NPE/IndexOutOfBounds
#### 🔧 详解
Checked异常必须try-catch或throws声明(编译器检查)。Unchecked异常(RuntimeException及其子类)不强制处理。Error是JVM层面的问题通常不捕获。自定义异常继承Exception(Checked)或RuntimeException(Unchecked)。

#### 💻 代码
try{
  Files.readAllBytes(Paths.get("file.txt")); // Checked
}catch(IOException e){
  e.printStackTrace();
}

// RuntimeException不需要显式处理
int[] arr={1,2,3};
arr[5]; // ArrayIndexOutOfBoundsException
#### ❓ 追问
什么时候用Checked？答：调用方可以合理恢复的情况。否则用Unchecked。

---
## 11. volatile关键字？

> **难度**: hard | **分类**: Java | **ID**: 494

#### 🎯 本质
volatile保证**可见性(主内存同步)和禁止指令重排序**。但不保证原子性。

#### 🧒 类比
volatile像公告栏——修改立即可见所有人，但不保证两人同时修改不出冲突。

#### 📊 图解
volatile保证:
1.可见性: 写→刷主内存,读→从主内存
2.有序性: 禁止指令重排
不保证:
原子性: i++仍不安全
#### 🔧 详解
volatile写：强制刷到主内存。volatile读：强制从主内存读。禁止JVM对volatile变量的指令重排序(内存屏障)。适合一个线程写多个线程读的场景(如boolean标志)。不保证复合操作(i++)的原子性，需AtomicInteger。

#### 💻 代码
volatile boolean running=true;
// 线程1
while(running){ /*工作*/ }
// 线程2
running=false; // 立即可见

// 不安全!
volatile int count=0;
count++; // 非原子操作
// 安全
AtomicInteger count=new AtomicInteger(0);
count.incrementAndGet(); // 原子操作
#### ❓ 追问
volatile和synchronized的区别？答：volatile轻量级只保证可见性/有序性，synchronized重量级保证原子性+可见性。

---
## 12. Java反射？

> **难度**: medium | **分类**: Java | **ID**: 495

#### 🎯 本质
反射在**运行时**获取类的信息(字段/方法/构造器)并动态调用。

#### 🧒 类比
反射像透视眼——不需要提前知道类的结构，运行时就能看透并操作。

#### 📊 图解
Class cls=Class.forName("com.XXX")
Method m=cls.getMethod("name")
m.invoke(instance)
#### 🔧 详解
Class对象包含类的所有信息。getFields/getMethods获取公开成员。getDeclaredFields获取所有成员(含私有需setAccessible)。反射创建对象newInstance。反射调用方法invoke。Spring IoC/DI大量使用反射。

#### 💻 代码
// 反射示例
Class cls=Class.forName("java.util.ArrayList");
Constructor ctor=cls.getConstructor();
Object list=ctor.newInstance();
Method add=cls.getMethod("add",Object.class);
add.invoke(list,"hello");
Field[] fields=cls.getDeclaredFields();
for(Field f:fields) System.out.println(f.getName());
#### ❓ 追问
反射的性能？答：比直接调用慢，但现代JVM已大幅优化。Spring启动慢部分原因就是大量反射。

---
## 13. Java泛型？

> **难度**: medium | **分类**: Java | **ID**: 496

#### 🎯 本质
泛型**参数化类型**，编译期检查类型安全。类型擦除：编译后泛型信息被擦除。

#### 🧒 类比
泛型像模板——一个容器(类/方法)可以装不同类型但编译器帮你检查。

#### 📊 图解
class Box{
  T value;
  T get(){return value;}
}
Box b=new Box<>();
#### 🔧 详解
泛型类(class Box)、泛型方法( T foo(T t))、通配符(/)。PECS原则：生产者用extends(只读)，消费者用super(只写)。类型擦除：编译后T变成Object(或上界)。运行时无法获取泛型类型(new T()不行)。

#### 💻 代码
// 泛型
List list=new ArrayList<>();
list.add("hello");
// list.add(123); // 编译错误

// 通配符
void printAll(List list){...} // 只读
void addAll(List list){...}    // 只写

// 类型擦除后
List → List (运行时)
#### ❓ 追问
什么是泛型擦除？答：编译后泛型信息被擦除为Object或上界，运行时无泛型信息。

---
## 14. 接口和抽象类的区别？

> **难度**: easy | **分类**: Java | **ID**: 497

#### 🎯 本质
接口定义**行为契约**(多实现)，抽象类定义**共同属性**(单继承)。

#### 🧒 类比
接口像驾照(证明你会开车)，抽象类像 Vehicle 基类(有共同属性方法)。

#### 📊 图解
接口: 只定义方法签名(Java8+有default)
抽象类: 可有实现+成员变量

类: 单继承抽象类
类: 多实现接口
#### 🔧 详解
接口：方法默认public abstract，Java8+有default/static方法，Java9+有private方法。无成员变量(只有常量)。抽象类：可以有构造器、成员变量、具体方法。子类单继承。设计原则：面向接口编程。

#### 💻 代码
// 接口
interface Flyable{
  void fly(); // 抽象方法
  default void land(){System.out.println("landing");} // default
}
// 抽象类
abstract class Animal{
  String name; // 成员变量
  abstract void sound(); // 抽象方法
  void eat(){System.out.println("eating");} // 具体方法
}
#### ❓ 追问
什么时候用接口vs抽象类？答：定义行为用接口(is-a关系)，共享代码用抽象类(has共性)。

---
## 15. Spring IoC和AOP？

> **难度**: medium | **分类**: Java | **ID**: 498

#### 🎯 本质
IoC(控制反转)将对象**创建和管理交给容器**。AOP(面向切面)将**横切关注点**(日志/事务)抽离。

#### 🧒 类比
IoC像外卖(不用自己做让平台送)，AOP像快递包装(统一加一层处理不改变内容)。

#### 📊 图解
IoC: @Component/@Autowired
  容器创建+注入依赖
AOP: @Aspect/@Before/@After
  统一处理日志/事务/权限
#### 🔧 详解
IoC：传统程序自己创建对象(new)。Spring容器(ApplicationContext)管理对象的创建和依赖注入(DI)。@Component标记Bean，@Autowired注入依赖。AOP：将日志/事务/权限等横切关注点从业务代码中分离。用动态代理(JDK/CGLIB)在方法前后织入增强逻辑。

#### 💻 代码
// IoC
@Service
public class UserService{
  @Autowired
  private UserRepository repo; // 自动注入
}
// AOP
@Aspect
@Component
public class LogAspect{
  @Before("execution(* com.example.service.*.*(..))")
  public void log(JoinPoint jp){
    System.out.println("调用:"+jp.getSignature());
  }
}
#### ❓ 追问
Spring Bean的生命周期？答：实例化→属性注入→初始化→使用→销毁。

---
## 16. Java内存模型(JMM)？

> **难度**: hard | **分类**: Java | **ID**: 499

#### 🎯 本质
JMM定义**线程如何通过主内存交互**。happens-before规则保证可见性和有序性。

#### 🧒 类比
JMM像公司规章制度——规定各部门(线程)怎么共享文件(内存)，谁先谁后。

#### 📊 图解
JMM规定:
1.所有变量存在主内存
2.每线程有自己的工作内存
3.线程间通过主内存通信

happens-before:
解锁h-b于加锁
volatile写h-b于读
线程start h-b于其操作
#### 🔧 详解
每个线程有工作内存(缓存)。对变量的操作先在工作内存进行再同步到主内存。这导致可见性问题。happens-before规则：程序顺序、volatile、锁、线程启动/终止、传递性。volatile保证可见性。synchronized保证原子性+可见性。

#### 💻 代码
// 双重检查锁(DCL)
class Singleton{
  private volatile static Singleton instance;
  static Singleton getInstance(){
    if(instance==null){             // 第一次检查
      synchronized(Singleton.class){
        if(instance==null){          // 第二次检查
          instance=new Singleton();   // volatile防止重排
        }
      }
    }
    return instance;
  }
}
#### ❓ 追问
为什么DCL要volatile？答：防止new Singleton()的指令重排序(分配→初始化→赋值可能重排为分配→赋值→初始化)。

---
## 17. Java 8新特性？

> **难度**: medium | **分类**: Java | **ID**: 500

#### 🎯 本质
Java 8引入**Lambda表达式、Stream API、Optional、函数式接口、默认方法**。

#### 🧒 类比
Java 8像工具箱升级——Lambda是快捷键，Stream是流水线，Optional是安全套。

#### 📊 图解
Lambda: (a,b)->a+b
Stream: list.stream().filter().map()
Optional: Optional.ofNullable(x)
#### 🔧 详解
Lambda：简洁的匿名函数写法。Stream：函数式数据处理(filter/map/reduce/collect)。Optional：优雅处理null避免NPE。函数式接口：只有一个抽象方法的接口(@FunctionalInterface)。默认方法：接口中的default实现。新的Date/Time API(LocalDate/LocalDateTime)。

#### 💻 代码
// Lambda
list.sort((a,b)->a.compareTo(b));
// Stream
List names=users.stream()
  .filter(u->u.getAge()>18)
  .map(User::getName)
  .collect(Collectors.toList());
// Optional
Optional.ofNullable(user)
  .map(User::getAddress)
  .map(Address::getCity)
  .orElse("unknown");
#### ❓ 追问
Stream是懒加载的？答：是的，终端操作(collect/forEach)时才执行。中间操作(filter/map)只记录操作。

---
