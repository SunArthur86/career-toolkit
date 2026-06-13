# 工程化

> 共 15 题

## 1. Webpack核心概念？

> **难度**: medium | **分类**: 工程化 | **ID**: 44

#### 🎯 本质
Webpack 是模块打包器，把所有依赖打包成静态资源。

#### 🧒 类比
用生活中的场景来类比理解这个概念，降低认知门槛。

#### 📊 核心概念
Entry:    打包入口(可多入口)
Output:   输出配置(路径+文件名)
Loader:   转换非JS文件
babel-loader(JS转译) css-loader(处理CSS)
file-loader(处理图片/字体)
Plugin:   扩展功能
HtmlWebpackPlugin(生成HTML)
MiniCssExtractPlugin(CSS提取)
DefinePlugin(注入环境变量)
#### 💻 构建流程
初始化配置 → 编译(Compiler) → 从Entry出发
→ 调用Loader转换 → 依赖图(Dependency Graph)
→ 输出Chunk → Plugin处理 → Bundle输出
#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### ❓ 追问
团队如何推行这个实践？

---
## 2. Vite为什么比Webpack快？

> **难度**: easy | **分类**: 工程化 | **ID**: 45

#### 🎯 本质
Vite 利用浏览器原生 ESM，开发时不打包，按需编译。

#### 🧒 类比
Webpack 像先把整本百科全书印好再给你看；Vite 像你要看哪页就印哪页。

#### 📊 核心差异
Webpack: 打包所有模块→启动开发服务器
冷启动: 30s+(大型项目)

Vite: 启动服务器→按需编译(原生ESM)
冷启动: 300ms
预构建: esbuild(Go编写,比JS快10-100倍)
热更新: 基于ESM的HMR,不重新打包
#### ❓ 追问
生产构建用什么？答：Rollup（Vite内置），也支持配置用esbuild。

#### 🔧 详解
核心要点已在上方说明，实际开发中需要结合项目场景灵活应用。

#### 💻 代码

```
// 见上方代码示例
```

---
## 3. 前端代码规范怎么做？

> **难度**: medium | **分类**: 工程化 | **ID**: 94

#### 🎯 本质
前端代码规范通过**自动化工具链**统一团队代码风格和质量标准，包括代码质量检查（ESLint）、格式化（Prettier）、Git钩子（Husky）和提交规范（Commitlint），形成**提交即检查**的自动化工作流。

#### 🧒 类比
像驾校考试——ESLint是考官（检查你是否违章），Prettier是自动挡（自动帮你调好姿势），Husky是考试门禁（不达标不让提交），Commitlint是答题卡格式要求（commit信息必须规范）。

#### 📊 图解
代码规范工具链:

  编辑器
    ↓ 保存时自动格式化
  ESLint + Prettier
    ↓ 检查质量 + 统一风格
  git commit
    ↓ Husky触发pre-commit钩子
  lint-staged
    ↓ 只检查暂存区的文件(高效)
  commitlint
    ↓ 检查commit message格式
  git push → CI/CD完整检查

ESLint核心规则:
  no-unused-vars    禁止未使用变量
  no-console        禁止console.log
  eq-eqeq           必须用===
  no-var            禁止var
  prefer-const      优先用const

Commit规范(Conventional Commits):
  feat: 新功能
  fix: 修复bug
  docs: 文档
  style: 格式(不影响逻辑)
  refactor: 重构
  test: 测试
  chore: 构建/工具
#### 🔧 详解
**ESLint**关注代码质量（潜在错误、最佳实践），**Prettier**关注代码格式（缩进、引号、换行）。两者配合使用，ESLint的格式规则交给Prettier处理（eslint-config-prettier关闭冲突规则）。**lint-staged**只检查git暂存区的文件，比全量检查快得多。

#### 💻 代码
// package.json 配置
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,md}": [
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg":
        "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}

// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "prettier"  // 必须放最后
  ],
  rules: {
    "no-console": "warn",
    "no-unused-vars": ["warn", {
      argsIgnorePattern: "^_"
    }],
    "prefer-const": "error"
  }
};

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}

// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"]
};

// 安装命令:
// npm i -D eslint prettier husky lint-staged
//   @commitlint/cli @commitlint/config-conventional
#### ❓ 追问
ESLint和Prettier冲突怎么办？答：安装eslint-config-prettier，放在extends最后，它会关闭所有和Prettier冲突的ESLint规则。如何跳过husky检查？答：git commit --no-verify（紧急情况使用，不推荐）。TypeScript项目需要额外配置吗？答：需要安装@typescript-eslint/parser和对应的插件。

---
## 4. 前端工程化是什么？

> **难度**: medium | **分类**: 工程化 | **ID**: 277

#### 🎯 本质
前端工程化是用**系统化/规范化**的方法管理前端开发流程：模块化/组件化/自动化/规范化。

#### 🧒 类比
前端工程化像把小作坊变成工厂——标准化流程、自动化生产、质量检测。

#### 📊 图解
工程化内容:
1.模块化: ES Module/CommonJS
2.组件化: React/Vue组件
3.自动化: CI/CD/测试/部署
4.规范化: ESLint/Prettier/Husky
5.构建工具: Webpack/Vite/Rollup
#### 🔧 详解
工程化解决前端项目规模增大后的协作和维护问题。模块化拆分代码职责。组件化复用UI。自动化减少人工操作。规范化统一代码风格。构建工具优化开发体验和产物质量。

#### 💻 代码
// 工程化工具链
// package.json
{
  "scripts":{
    "lint":"eslint src/",
    "format":"prettier --write src/",
    "test":"jest",
    "build":"vite build",
    "preview":"vite preview"
  },
  "lint-staged":{
    "*.{js,ts}":["eslint --fix","prettier --write"]
  },
  "husky":{
    "hooks":{"pre-commit":"lint-staged"}
  }
}
#### ❓ 追问
前端工程化的核心目标？答：提高开发效率、保障代码质量、降低维护成本。

---
## 5. Webpack核心概念？

> **难度**: medium | **分类**: 工程化 | **ID**: 278

#### 🎯 本质
Webpack是**模块打包器**：entry(入口)→loader(转换)→plugin(扩展)→output(输出)。

#### 🧒 类比
Webpack像翻译出版流程——稿纸(entry)→翻译(loader)→编辑审校(plugin)→成书(output)。

#### 📊 图解
核心概念:
Entry: 打包起点
Output: 输出配置
Loader: 转换非JS文件(babel/css)
Plugin: 扩展功能(HMR/压缩)
Mode: development/production

Webpack 5新特性:
Module Federation/持久化缓存
#### 🔧 详解
Entry指定打包入口(单/多入口)。Loader链式处理文件(babel-loader转ES6、css-loader处理CSS)。Plugin在整个构建生命周期注入功能。Webpack 5支持持久化缓存(构建提速)和Module Federation(微前端)。

#### 💻 代码
// webpack.config.js
const HtmlWebpackPlugin=require('html-webpack-plugin');
module.exports={
  entry:'./src/index.js',
  output:{filename:'[name].[contenthash].js',path:'dist'},
  module:{
    rules:[
      {test:/\.js$/,use:'babel-loader',exclude:/node_modules/},
      {test:/\.css$/,use:['style-loader','css-loader']}
    ]
  },
  plugins:[new HtmlWebpackPlugin({template:'index.html'})],
  devServer:{hot:true,port:3000}
};
#### ❓ 追问
Loader和Plugin的区别？答：Loader转换文件内容，Plugin扩展构建流程。

---
## 6. Vite为什么快？

> **难度**: medium | **分类**: 工程化 | **ID**: 279

#### 🎯 本质
Vite开发时**用原生ESM按需编译**(不打包)，生产用Rollup打包。冷启动极快。

#### 🧒 类比
Webpack像提前打包所有行李(慢)，Vite像只拿需要的(快)。

#### 📊 图解
Vite快的原因:
开发模式:
  1.原生ESM(浏览器直接import)
  2.按需编译(只编译当前页面)
  3.esbuild预构建(快10-100倍)

生产构建:
  Rollup打包(优化输出)
#### 🔧 详解
Webpack开发时需要打包所有模块才能启动(项目越大越慢)。Vite利用浏览器原生ESM支持，不需要打包。请求到某个模块时才编译(按需)。依赖预构建用esbuild(Go写的极快)。生产构建用Rollup(更好的tree-shaking)。

#### 💻 代码
// vite.config.js
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins:[react()],
  server:{port:3000,proxy:{'/api':'http://localhost:8080'}},
  build:{
    rollupOptions:{
      output:{manualChunks:{vendor:['react','react-dom']}}
    }
  }
});
#### ❓ 追问
Vite生产构建为什么不用esbuild？答：esbuild的代码分割和CSS处理不如Rollup成熟。

---
## 7. Babel的作用和原理？

> **难度**: medium | **分类**: 工程化 | **ID**: 280

#### 🎯 本质
Babel将**新版JS转换为旧版兼容代码**。解析(parse)→转换(transform)→生成(generate)。

#### 🧒 类比
Babel像翻译器——把普通话(ES6+)翻译成方言(ES5)让所有人都能听懂。

#### 📊 图解
Babel流程:
1.Parse: 代码→AST(抽象语法树)
2.Transform: AST转换(插件)
3.Generate: AST→代码

核心:
@babel/core
@babel/preset-env
@babel/plugin-*
#### 🔧 详解
Babel本身不做任何转换只提供框架。preset-env根据目标浏览器决定需要哪些转换。plugin-transform-runtime避免重复注入helper代码。JSX插件转换React JSX。Stage预设表示TC39提案阶段。

#### 💻 代码
// babel.config.json
{
  "presets":[
    ["@babel/preset-env",{
      "targets":"> 0.25%, not dead",
      "useBuiltIns":"usage",
      "corejs":3
    }],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  "plugins":[
    ["@babel/plugin-transform-runtime",{"corejs":3}]
  ]
}
#### ❓ 追问
什么是polyfill？答：为旧浏览器提供新API的实现。core-js的作用？答：提供polyfill库。

---
## 8. ESLint和Prettier？

> **难度**: easy | **分类**: 工程化 | **ID**: 281

#### 🎯 本质
**ESLint**检查代码质量(错误/不规范)。**Prettier**格式化代码风格(缩进/引号/换行)。配合使用。

#### 🧒 类比
ESLint像代码审查员(检查逻辑问题)，Prettier像自动排版员(统一格式)。

#### 📊 图解
ESLint:
  代码质量规则(no-unused-vars等)
  支持插件(react/vue/typescript)
  可自动修复(--fix)

Prettier:
  代码风格(缩进/引号/分号)
  固执己见(少配置)
  编辑器保存自动格式化
#### 🔧 详解
ESLint用于发现代码问题(未使用变量、潜在错误)。Prettier用于统一代码风格。可能有冲突(规则重叠)用eslint-config-prettier解决。Husky+lint-staged在提交前自动检查格式化。

#### 💻 代码
// .eslintrc.json
{
  "extends":[
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier" // 关闭和Prettier冲突的规则
  ],
  "rules":{"no-console":"warn"}
}
// .prettierrc
{
  "singleQuote":true,
  "trailingComma":"es5",
  "printWidth":80,
  "tabWidth":2
}
#### ❓ 追问
什么是lint-staged？答：只对暂存区(git add)的文件运行lint，提高效率。

---
## 9. Monorepo管理？

> **难度**: medium | **分类**: 工程化 | **ID**: 282

#### 🎯 本质
Monorepo将**多个相关项目放在一个仓库**管理。工具：pnpm workspace/Turborepo/Nx/Lerna。

#### 🧒 类比
Monorepo像一栋写字楼——多个公司(项目)共用一栋楼(仓库)共享设施(依赖)。

#### 📊 图解
Monorepo工具:
pnpm workspace: 原生支持
Turborepo: 构建缓存/并行
Nx: 增量构建/依赖图
Lerna: 经典(已并入Nx)

结构:
/packages
  /app-a
  /app-b
  /shared-ui
  /shared-utils
#### 🔧 详解
Monorepo优势：共享代码(组件/工具库)、统一版本、原子提交、CI简化。pnpm的硬链接节省磁盘。Turborepo的远程缓存加速CI。Nx的依赖图分析只构建受影响的包。

#### 💻 代码
// pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

// package.json(root)
{
  "scripts":{
    "build":"turbo run build",
    "test":"turbo run test",
    "dev":"turbo run dev --parallel"
  }
}
// turbo.json
{
  "pipeline":{
    "build":{"dependsOn":["^build"],"outputs":["dist/**"]},
    "test":{"dependsOn":["build"]}
  }
}
#### ❓ 追问
Monorepo的缺点？答：仓库大clone慢、权限管理复杂。Multirepo vs Monorepo？答：Multirepo独立但代码复用难，Monorepo统一但仓库大。

---
## 10. Git工作流？

> **难度**: medium | **分类**: 工程化 | **ID**: 283

#### 🎯 本质
Git工作流定义**团队协作的分支策略**。常见：Git Flow/GitHub Flow/Trunk-Based。

#### 🧒 类比
Git工作流像公司的审批流程——不同级别的变更走不同的审批(分支)路线。

#### 📊 图解
Git Flow:
  main(生产) + develop + feature/* + release/* + hotfix/*

GitHub Flow:
  main + feature分支+PR

Trunk-Based:
  只有一个main+短命feature分支+频繁集成
#### 🔧 详解
Git Flow适合发布周期长的项目。GitHub Flow简单适合持续部署。Trunk-Based适合CI/CD成熟团队。分支命名：feature/xxx、fix/xxx、release/v1.0。PR/MR做代码审查。

#### 💻 代码
// Git Flow常用命令
git checkout -b feature/user-auth develop
git add . && git commit -m 'feat: add user auth'
git checkout develop && git merge feature/user-auth
git branch -d feature/user-auth

// GitHub Flow
git checkout -b fix/login-bug main
git push origin fix/login-bug
// 在GitHub创建Pull Request
// Code Review后合并到main
#### ❓ 追问
什么是Trunk-Based Development？答：所有人都向main(主干)提交，用feature flag控制未完成功能。

---
## 11. 什么是CI/CD？

> **难度**: medium | **分类**: 工程化 | **ID**: 284

#### 🎯 本质
CI(持续集成)自动**构建测试**每次提交。CD(持续部署)自动**发布到生产**。GitHub Actions/Jenkins常用。

#### 🧒 类比
CI像自动质检(每次提交都检测)，CD像自动上架(检测通过直接卖)。

#### 📊 图解
CI流程:
1.提交代码→触发CI
2.拉取代码→安装依赖
3.代码检查(lint)
4.单元测试
5.构建打包

CD流程:
6.部署到staging
7.集成测试
8.部署到production
#### 🔧 详解
CI确保每次提交不破坏项目。CD自动化部署减少人工错误。GitHub Actions是GitHub原生CI/CD。Jenkins自建更灵活。常见的CD策略：蓝绿部署、金丝雀发布、滚动更新。

#### 💻 代码
// .github/workflows/ci.yml
name: CI
on: [push,pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version:20}
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
#### ❓ 追问
蓝绿部署是什么？答：两套环境切换。金丝雀发布？答：先发布给小部分用户验证。

---
## 12. package.json的作用？

> **难度**: easy | **分类**: 工程化 | **ID**: 285

#### 🎯 本质
package.json是**项目的配置文件**：名称/版本/依赖/脚本/引擎等。npm init创建。

#### 🧒 类比
package.json像项目的身份证——包含项目的基本信息和依赖关系。

#### 📊 图解
重要字段:
name/version: 包名和版本
scripts: 可执行脚本
dependencies: 生产依赖
devDependencies: 开发依赖
peerDependencies: 对等依赖
engines: Node/npm版本
main/module/exports: 入口
#### 🔧 详解
scripts中定义常用命令。dependencies运行时需要。devDependencies开发时需要(构建工具/测试)。peerDependencies要求宿主提供(插件模式)。engines指定Node版本。exports定义包的导出路径。

#### 💻 代码
// package.json
{
  "name":"my-app",
  "version":"1.0.0",
  "type":"module",
  "scripts":{
    "dev":"vite",
    "build":"tsc && vite build",
    "preview":"vite preview"
  },
  "dependencies":{"express":"^4.18.0"},
  "devDependencies":{"typescript":"^5.0.0"},
  "engines":{"node":">=18.0.0"}
}
#### ❓ 追问
什么是peerDependencies？答：期望宿主项目提供的依赖(如React组件库期望宿主有React)。

---
## 13. 微前端架构？

> **难度**: hard | **分类**: 工程化 | **ID**: 286

#### 🎯 本质
微前端将**大型应用拆分为独立子应用**，各自开发/部署/运行。qiankun/Module Federation/iframe。

#### 🧒 类比
微前端像购物中心——每个店(子应用)独立经营但共用一个大楼(主应用)。

#### 📊 图解
方案对比:
1.iframe: 最简单但隔离过度
2.qiankun: 基于single-spa
3.Module Federation: Webpack 5
4.Web Components: 原生组件

挑战:
样式隔离/JS沙箱/公共依赖/路由/通信
#### 🔧 详解
qiankun通过Proxy沙箱隔离JS、Shadow DOM/shoped CSS隔离样式。Module Federation运行时共享模块。iframe天然隔离但体验差(弹窗/路由)。Web Components原生隔离但兼容性。子应用间通信通过CustomEvent或状态管理。

#### 💻 代码
// qiankun
import {registerMicroApps,start} from 'qiankun';
registerMicroApps([{
  name:'react-app',
  entry:'//localhost:3001',
  container:'#subapp',
  activeRule:'/react'
},{
  name:'vue-app',
  entry:'//localhost:3002',
  container:'#subapp',
  activeRule:'/vue'
}]);
start();

// Module Federation
// webpack.config.js
new ModuleFederationPlugin({
  name:'host',
  remotes:{app1:'app1@http://localhost:3001/remoteEntry.js'}
});
#### ❓ 追问
微前端的公共依赖如何处理？答：externals+CDN或Module Federation共享。JS沙箱怎么实现？答：Proxy拦截window对象、快照沙箱。

---
## 14. 前端监控和日志？

> **难度**: medium | **分类**: 工程化 | **ID**: 287

#### 🎯 本质
前端监控包括**性能监控、错误监控、用户行为监控**。Sentry/ErrorBoundary/Performance API。

#### 🧒 类比
前端监控像安防系统——摄像头(性能)、报警器(错误)、门禁记录(用户行为)。

#### 📊 图解
监控类型:
1.性能: FP/FCP/LCP/FID/CLS
2.错误: JS错误/资源加载/API错误
3.用户行为: PV/UV/点击/停留
4.业务: 转化率/核心流程

工具:
Sentry(错误)
Google Analytics(行为)
Lighthouse(性能)
#### 🔧 详解
性能监控用Performance API采集Web Vitals。错误监控用window.onerror+unhandledrejection+ErrorBoundary。用户行为监控埋点(手动/自动)。上报策略：批量+降级(Image发送)。

#### 💻 代码
// 错误监控
window.onerror=(msg,url,line,col,err)=>{
  report({type:'js',msg,url,line,col,stack:err?.stack});
};
window.addEventListener('unhandledrejection',e=>{
  report({type:'promise',reason:e.reason});
});
// 性能
const observer=new PerformanceObserver(list=>{
  for(const entry of list.getEntries()){
    report({name:entry.name,duration:entry.duration});
  }
});
observer.observe({type:'largest-contentful-paint',buffered:true});
#### ❓ 追问
什么是埋点？答：在代码中插入数据采集代码记录用户行为。无痕埋点？答：全局监听事件自动采集不需手动埋点。

---
## 15. 代码质量保障？

> **难度**: medium | **分类**: 工程化 | **ID**: 288

#### 🎯 本质
代码质量通过**代码审查、静态分析、自动化测试、持续集成**多维度保障。

#### 🧒 类比
代码质量像食品质检——原料检查(静态分析)→生产过程(测试)→出厂检验(Code Review)。

#### 📊 图解
质量保障:
1.ESLint+Prettier: 风格统一
2.TypeScript: 类型安全
3.单元测试: Jest/Vitest
4.E2E测试: Cypress/Playwright
5.Code Review: 人工审查
6.SonarQube: 代码质量扫描
#### 🔧 详解
ESLint+Prettier统一风格。TypeScript在编译时发现类型错误。单元测试验证模块逻辑。E2E测试验证用户流程。Code Review是最后一道人工审查。测试覆盖率80%以上是合理目标。TDD先写测试再写代码。

#### 💻 代码
// 测试配置
// vitest.config.ts
export default defineConfig({
  test:{
    globals:true,
    coverage:{
      provider:'v8',
      reporter:['text','lcov'],
      include:['src/**/*.{ts,tsx}']
    }
  }
});
// 测试示例
import {render,screen} from '@testing-library/react';
test('renders title',()=>{
  render();
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
#### ❓ 追问
测试金字塔是什么？答：底层大量单元测试、中层集成测试、顶层少量E2E测试。

---
