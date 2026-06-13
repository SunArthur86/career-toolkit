# Docker

> 共 11 题

## 1. 什么是Docker？

> **难度**: easy | **分类**: Docker | **ID**: 334

#### 🎯 本质
Docker是**容器化平台**——将应用和依赖打包成轻量级容器，保证环境一致。

#### 🧒 类比
Docker像集装箱——不管里面装什么货物(应用)，运输方式都一样。

#### 📊 图解

```
镜像→容器: docker run
```

#### 🔧 详解
Docker镜像是分层存储。容器是镜像的运行实例。相比虚拟机更轻量(共享内核)。

#### 💻 代码
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node","server.js"]
#### ❓ 追问
Docker和虚拟机的区别？答：容器共享宿主内核更轻量，VM有独立内核更隔离。

---
## 2. Docker Compose？

> **难度**: medium | **分类**: Docker | **ID**: 335

#### 🎯 本质
Docker Compose**定义和管理多容器应用**。一个YAML文件编排多个服务。

#### 🧒 类比
Compose像乐队指挥——一个乐谱(yml)指挥所有乐器(容器)协同演奏。

#### 📊 图解
services:
  web/api/db/redis
#### 🔧 详解
docker-compose.yml定义多个服务。depends_on控制启动顺序。volumes持久化数据。

#### 💻 代码
version:'3.8'
services:
  app:
    build:.
    ports:['3000:3000']
    depends_on:[db,redis]
  db:
    image:mysql:8
    volumes:['db_data:/var/lib/mysql']
  redis:
    image:redis:7-alpine
volumes:
  db_data:
#### ❓ 追问
depends_on保证就绪吗？答：只保证启动不保证就绪。需要健康检查。

---
## 3. Docker网络？

> **难度**: medium | **分类**: Docker | **ID**: 336

#### 🎯 本质
Docker提供**多种网络模式**：bridge/host/overlay/none实现容器间通信。

#### 🧒 类比
Docker网络像公司电话系统——不同部门用不同线路通信。

#### 📊 图解

```
bridge/host/overlay/none
```

#### 🔧 详解
bridge默认模式(虚拟网桥)。host共享宿主网络。自定义网络通过服务名DNS解析通信。

#### 💻 代码
docker network create mynet
docker run --net mynet --name app my-image
docker run --net mynet --name db mysql
// app内可以 ping db
#### ❓ 追问
bridge网络是什么？答：Docker默认虚拟网桥，容器间通过IP通信。

---
## 4. Docker Volume数据持久化？

> **难度**: medium | **分类**: Docker | **ID**: 337

#### 🎯 本质
容器**重启后数据丢失**，Volume将数据存储在宿主机实现持久化。

#### 🧒 类比
Volume像U盘——容器是电脑，拔掉U盘数据还在。

#### 📊 图解

```
Volume/Bind Mount/tmpfs
```

#### 🔧 详解
Volume由Docker管理。Bind Mount映射宿主目录。

#### 💻 代码
docker volume create mydata
docker run -v mydata:/app/data my-image
docker run -v $(pwd)/data:/app/data my-image
#### ❓ 追问
Volume和Bind Mount怎么选？答：生产用Volume，开发用Bind Mount。

---
## 5. Docker镜像优化？

> **难度**: hard | **分类**: Docker | **ID**: 338

#### 🎯 本质
优化Docker镜像：**减小体积、多阶段构建、利用缓存、安全扫描**。

#### 🧒 类比
镜像优化像减肥——去掉多余脂肪保持健康。

#### 📊 图解

```
小基础镜像+多阶段构建+缓存
```

#### 🔧 详解
选择alpine基础镜像。多阶段构建只保留产物。利用Docker层缓存。

#### 💻 代码
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
#### ❓ 追问
什么是多阶段构建？答：多个FROM只保留最后一个的产物。

---
## 6. Dockerfile最佳实践？

> **难度**: medium | **分类**: Docker | **ID**: 339

#### 🎯 本质
Dockerfile定义**镜像构建步骤**。优化指令顺序减少构建时间。

#### 🧒 类比
Dockerfile像菜谱——按步骤准备食材。

#### 📊 图解

```
指令顺序:不常变在前(缓存)
```

#### 🔧 详解
先COPY package.json+RUN install。最后COPY源码。用非root用户。

#### 💻 代码
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
USER node
EXPOSE 3000
CMD ["node","server.js"]
#### ❓ 追问
为什么要非root用户？答：容器内root等于宿主root有安全风险。

---
## 7. Docker常用命令？

> **难度**: easy | **分类**: Docker | **ID**: 340

#### 🎯 本质
Docker命令分**镜像命令**和**容器命令**。

#### 🧒 类比
Docker命令像遥控器——不同按钮控制不同功能。

#### 📊 图解

```
build/pull/run/exec/logs/ps
```

#### 🔧 详解
docker build构建。docker run运行。docker exec进入容器。

#### 💻 代码
docker build -t myapp .
docker run -d -p 8080:3000 myapp
docker logs -f container_id
docker exec -it container_id sh
docker system prune -a
#### ❓ 追问
docker run的-d参数？答：后台运行(detach)。

---
## 8. Docker和Kubernetes的关系？

> **难度**: medium | **分类**: Docker | **ID**: 341

#### 🎯 本质
Docker是**容器运行时**，Kubernetes是**容器编排平台**。

#### 🧒 类比
Docker像汽车，K8s像出租车公司管理调度大量汽车。

#### 📊 图解

```
Pod/Service/Deployment
```

#### 🔧 详解
K8s管理容器生命周期。Pod是最小部署单元。Service提供稳定入口。

#### 💻 代码
apiVersion: apps/v1
kind: Deployment
metadata: {name: my-app}
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: my-app:v1
        ports: [{containerPort: 3000}]
#### ❓ 追问
Pod为什么是最小单元？答：多容器共享网络和存储(sidecar模式)。

---
## 9. 容器安全最佳实践？

> **难度**: medium | **分类**: Docker | **ID**: 342

#### 🎯 本质
容器安全：**最小权限、扫描漏洞、密钥管理、网络隔离**。

#### 🧒 类比
容器安全像银行——最小权限+扫描+隔离。

#### 📊 图解

```
非root+扫描+Secret+只读
```

#### 🔧 详解
用非root运行。扫描镜像漏洞。不存密钥在镜像中。

#### 💻 代码
FROM node:18-alpine
RUN addgroup -S app && adduser -S app -G app
USER app
docker run --read-only --cpus=1 --memory=512m my-app
#### ❓ 追问
什么是容器逃逸？答：攻击者从容器突破到宿主机。

---
## 10. Docker Registry私有仓库？

> **难度**: medium | **分类**: Docker | **ID**: 343

#### 🎯 本质
Docker Registry**存储和分发镜像**。Docker Hub公共/自建私有。

#### 🧒 类比
Registry像应用商店——公共或私有的。

#### 📊 图解

```
Docker Hub/Harbor/ECR
```

#### 🔧 详解
docker login/tag/push/pull。Harbor是企业级选择。

#### 💻 代码
docker run -d -p 5000:5000 registry:2
docker tag myapp localhost:5000/myapp
docker push localhost:5000/myapp
#### ❓ 追问
什么是Harbor？答：VMware开源的企业级Docker Registry。

---
## 11. Docker Swarm vs Kubernetes？

> **难度**: easy | **分类**: Docker | **ID**: 344

#### 🎯 本质
Swarm是Docker自带编排(简单)。K8s是工业级编排(强大)。

#### 🧒 类比
Swarm像家庭用车，K8s像高铁系统。

#### 📊 图解

```
Swarm简单/K8s强大
```

#### 🔧 详解
Swarm适合小规模快速上手。K8s适合大规模微服务。

#### 💻 代码
docker swarm init
docker stack deploy -c docker-compose.yml myapp
kubectl apply -f deployment.yaml
kubectl scale deployment my-app --replicas=5
#### ❓ 追问
什么时候用Swarm？答：小规模(<50容器)简单场景。

---
