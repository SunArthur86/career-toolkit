# CI/CD

> 共 11 题

## 1. 什么是CI/CD？为什么重要？

> **难度**: easy | **分类**: CI/CD | **ID**: 101

#### 🎯 本质
**CI(持续集成)**是频繁合并代码并自动构建测试，**CD(持续交付/部署)**是自动化部署通过测试的代码。

#### 🧒 类比
CI像每天体检早发现问题，CD像快递自动发货——测试通过直接送到客户手中。

#### 📊 图解
CI/CD流程：
代码提交→自动构建→自动测试→自动部署
常用工具：GitHub Actions/GitLab CI/Jenkins
#### 🔧 详解
CI的核心：频繁集成、自动化构建、自动化测试。CD分为持续交付(需人工确认)和持续部署(全自动)。好处：快速反馈、减少人为错误、快速发布。

#### 💻 代码
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
#### ❓ 追问
CI和CD的区别？答：CI关注代码合并和测试，CD关注自动化部署。持续交付vs持续部署？答：前者需人工确认，后者全自动。

---
## 2. GitHub Actions基础概念？

> **难度**: easy | **分类**: CI/CD | **ID**: 102

#### 🎯 本质
GitHub Actions是GitHub内置的**CI/CD平台**，通过YAML定义工作流，与代码仓库深度集成。

#### 🧒 类比
像一个住在仓库里的机器人——代码一变动就按指令清单自动干活。

#### 📊 图解
核心概念：
Workflow(工作流) → Event(触发事件)
  → Job(作业) → Step(步骤)
目录：.github/workflows/ci.yml
#### 🔧 详解
Workflow放在.github/workflows/目录，YAML格式。on定义触发条件，jobs定义作业，steps按顺序执行。Matrix策略支持多版本并行。actions是可复用步骤单元。

#### 💻 代码
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci && npm test
#### ❓ 追问
self-hosted runner是什么？答：自己提供的运行机器。Actions Marketplace？答：社区共享的action集合。

---
## 3. Jenkins是什么？基本概念？

> **难度**: easy | **分类**: CI/CD | **ID**: 103

#### 🎯 本质
Jenkins是最流行的开源**自动化服务器**，通过Pipeline定义CI/CD流水线，支持1800+插件。

#### 🧒 类比
像一个工厂流水线管理员——你告诉它每步做什么，它按顺序自动执行。

#### 📊 图解
核心概念：
Pipeline→流水线(整个流程)
Stage→阶段(Build/Test/Deploy)
Step→步骤(具体操作)
支持声明式和脚本式Pipeline
#### 🔧 详解
Jenkins用Java编写。声明式Pipeline结构清晰推荐使用。插件生态丰富是核心优势。缺点：UI老旧、配置复杂、资源占用大。现代项目更倾向GitHub Actions。

#### 💻 代码
pipeline {
  agent any
  stages {
    stage('Build') { steps { sh 'npm ci' } }
    stage('Test')  { steps { sh 'npm test' } }
    stage('Deploy') {
      when { branch 'main' }
      steps { sh './deploy.sh' }
    }
  }
}
#### ❓ 追问
Jenkins和GitHub Actions对比？答：Jenkins更灵活可自托管，Actions更轻量与GitHub集成。

---
## 4. 如何设计CI/CD流水线？

> **难度**: medium | **分类**: CI/CD | **ID**: 104

#### 🎯 本质
流水线设计原则：**快速反馈、安全可靠、可回滚**。分阶段构建→测试→部署，并行化独立任务。

#### 🧒 类比
像工厂生产线——原材料(代码)经过清洗(检查)、组装(构建)、质检(测试)、包装(部署)。

#### 📊 图解
标准前端流水线：
提交→Lint→单测→构建→E2E→部署Staging→验收→部署生产
关键：构建80%，回滚
#### 🔧 详解
设计要点：阶段划分、并行化、缓存优化(node_modules)、环境隔离、回滚策略。每次流水线失败应立即修复。

#### 💻 代码
jobs:
  lint:
    steps: [checkout, npm ci, npm run lint]
  test:
    needs: lint
    steps: [checkout, npm ci, npm test]
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    steps: [deploy-to-prod]
#### ❓ 追问
流水线太慢怎么优化？答：缓存依赖、并行job、增量构建。敏感信息怎么处理？答：用Secrets管理。

---
## 5. Docker在CI中的应用？

> **难度**: medium | **分类**: CI/CD | **ID**: 105

#### 🎯 本质
Docker在CI中提供**一致的构建环境**，消除"在我机器上能跑"的问题。容器化每个构建都在相同环境运行。

#### 🧒 类比
像给每个工人配完全相同的工具箱——不管谁来干活，结果都一样。

#### 📊 图解
Docker在CI中的作用：
1.统一构建环境
2.服务依赖(docker-compose)
3.多环境测试
4.镜像发布
#### 🔧 详解
三种方式：运行在Docker中、使用Docker服务(测试依赖)、构建Docker镜像发布。Docker layer缓存加速构建。多阶段构建减小镜像体积。

#### 💻 代码
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
#### ❓ 追问
镜像体积如何优化？答：alpine基础镜像+多阶段构建+layer缓存。

---
## 6. 自动化测试策略？测试金字塔？

> **难度**: medium | **分类**: CI/CD | **ID**: 106

#### 🎯 本质
测试金字塔：**底层大量单元测试(70%)**，中层集成测试(20%)，顶层少量E2E测试(10%)。

#### 🧒 类比
像饮食金字塔——底层谷物(单测)多吃，顶层甜食(E2E)少吃。

#### 📊 图解
测试金字塔：
    /E2E\      少量10%
   /集成测试\   适量20%
  / 单元测试  \  大量70%

CI：PR→单测+集成，合并→E2E
#### 🔧 详解
单元测试Jest/Vitest毫秒级，集成测试Testing Library秒级，E2E测试Playwright/Cypress分钟级。测试覆盖率是指标不是目标，核心逻辑必须覆盖。

#### 💻 代码
import { test, expect } from 'vitest';
test('formatPrice', () => {
  expect(formatPrice(999)).toBe('9.99');
});

// Playwright E2E
test('login', async ({page}) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@test.com');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});
#### ❓ 追问
TDD和BDD的区别？答：TDD先写测试再写代码，BDD用自然语言描述行为。

---
## 7. 蓝绿部署vs金丝雀发布？

> **难度**: medium | **分类**: CI/CD | **ID**: 107

#### 🎯 本质
**蓝绿部署**维护两套生产环境切换流量。**金丝雀发布**逐步将流量导向新版本(10%→50%→100%)。

#### 🧒 类比
蓝绿像有两个舞台切换，金丝雀像先给10%观众看新版没问题再扩大。

#### 📊 图解
蓝绿：
负载均衡器→蓝(v1) ←切换→ 绿(v2)

金丝雀：
100%流量→90%旧版+10%新版→观察→全量
#### 🔧 详解
蓝绿优点：零停机秒级回滚。缺点：双倍资源。金丝雀优点：风险可控真实用户验证。缺点：需流量分割和监控。还有滚动更新(K8s默认)和灰度发布。

#### 💻 代码
apiVersion: apps/v1
kind: Deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
#### ❓ 追问
什么是灰度发布？答：基于用户特征分流的发布策略。A/B测试和金丝雀的区别？答：A/B关注业务指标，金丝雀关注技术稳定性。

---
## 8. Git Flow vs Trunk-based开发？

> **难度**: medium | **分类**: CI/CD | **ID**: 108

#### 🎯 本质
**Git Flow**用多分支管理发布，**Trunk-based**所有人频繁向main提交用特性开关控制发布。现代推荐Trunk-based。

#### 🧒 类比
Git Flow像大公司审批流，Trunk-based像创业公司直接改主文档用开关控制。

#### 📊 图解
Git Flow: main←release←develop←feature
Trunk-based: 所有人→main(频繁提交)
  + 特性开关控制上线
#### 🔧 详解
Git Flow适合有版本号的产品。Trunk-based适合Web/SaaS，小批量频繁发布，特性开关控制功能可见性。核心优势：减少合并冲突、快速反馈。

#### 💻 代码
const features = {
  newDash: process.env.FF_NEW === 'true',
};
function App() {
  return features.newDash ?  : ;
}
#### ❓ 追问
特性开关技术实现？答：LaunchDarkly/Unleash或简单环境变量。Git Flow适合什么场景？答：有明确版本号的桌面/App产品。

---
## 9. 大规模monorepo的CI优化？

> **难度**: hard | **分类**: CI/CD | **ID**: 109

#### 🎯 本质
monorepo CI核心优化：**增量构建、任务编排、远程缓存**。工具：Nx/Turborepo。

#### 🧒 类比
像管理超市——不能一个商品变动就重新装修整个商场，只重新布置变了的那排货架。

#### 📊 图解
优化策略：
1.影响分析→只构建变化的包
2.任务图编排→按依赖拓扑排序
3.远程缓存→相同输入直接用缓存
4.并行执行→无依赖的任务并行
#### 🔧 详解
Nx的affected命令通过git diff分析依赖图只构建受影响项目。计算缓存基于输入hash。分布式执行将任务分配到多台机器。Turborepo更轻量专注任务编排。

#### 💻 代码
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "options": {
        "cacheableOperations": ["build","test"],
        "parallel": 3
      }
    }
  }
}
// nx affected --target=build
#### ❓ 追问
Nx和Turborepo怎么选？答：Nx功能更全面，Turborepo更简单轻量。

---
## 10. 零停机部署方案？

> **难度**: hard | **分类**: CI/CD | **ID**: 110

#### 🎯 本质
零停机部署确保**用户无感知更新**。核心：新旧版本平滑过渡，流量切换+数据迁移+向后兼容。

#### 🧒 类比
像行驶中换轮胎——车不停，先装新轮胎确认没问题再卸旧的。

#### 📊 图解
步骤：
1.新版本启动(与旧版并行)
2.健康检查
3.逐步切流量(10%→50%→100%)
4.旧版本下线
#### 🔧 详解
K8s滚动更新(maxSurge+maxUnavailable)、蓝绿(整切)、金丝雀(渐切)。数据库迁移是难点——需双版本兼容：扩展-收缩模式。

#### 💻 代码
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - readinessProbe:
          httpGet:
            path: /health
            port: 3000
#### ❓ 追问
readinessProbe和livenessProbe的区别？答：readiness控制是否接收流量，liveness控制是否重启。数据库迁移如何零停机？答：扩展-收缩两步发布。

---
## 11. GitOps实践？

> **难度**: hard | **分类**: CI/CD | **ID**: 111

#### 🎯 本质
GitOps以**Git仓库为唯一事实来源**的运维方法——所有配置用Git管理，提交触发自动部署。

#### 🧒 类比
像建筑图纸管理系统——改了图纸自动通知施工队按新图纸施工。

#### 📊 图解
流程：
配置仓库(Git) → GitOps Operator(ArgoCD/Flux)
  → 检测变化 → 自动同步到集群
Push模式: CI直接apply
Pull模式: Operator监听Git(推荐)
#### 🔧 详解
ArgoCD(K8s原生UI友好)和Flux(CNCF轻量)。核心原则：声明式、版本化、自动同步、可回滚(git revert)。配置仓库和应用仓库分离。

#### 💻 代码
apiVersion: argoproj.io/v1alpha1
kind: Application
spec:
  source:
    repoURL: https://github.com/org/k8s-configs
    path: overlays/production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
#### ❓ 追问
ArgoCD和Flux怎么选？答：ArgoCD UI强大适合多团队，Flux更轻量。什么是配置漂移？答：集群实际状态与Git声明不一致。

---
