# 🎯 Career Toolkit

> 面试突击 · 技术雷达 · 算法动画 — 离线可用的前端面试备考工具

🔗 **在线访问**: [https://sunarthur86.github.io/career-toolkit/](https://sunarthur86.github.io/career-toolkit/)

## ✨ 功能

### 📚 面试题库（545题 / 35分类）
- 35 个技术分类，从 HTML 基础到分布式系统
- Markdown 格式题库，增强解析器（列表/代码/高亮）
- 全文搜索 + 关键词高亮
- 键盘导航（`j`/`k` 翻题）

### 📊 技术雷达
- 多维度技术能力评估
- 雷达图可视化
- 能力差距分析

### 🎬 算法动画
- 11 种基础算法可视化（Canvas 渲染）
- 排序、搜索、图算法、动态规划
- 互动控制（播放/暂停/步进）

### 🎤 模拟面试
- 20+ 面试场景模拟
- 实时评分系统
- 面试录音回放

### 🃏 闪卡 + 间隔重复（SM-2）
- Anki 式间隔重复算法
- 3D 翻转闪卡
- 笔记功能
- 复习提醒

### 📱 PWA 离线支持
- Service Worker 缓存
- 可安装到桌面
- 离线使用所有功能

## 🛠️ 技术栈
- 纯前端（HTML + CSS + JavaScript）
- Canvas 动画渲染
- localStorage（safe-ls.js 安全封装）
- SM-2 间隔重复算法
- PWA（manifest.json + sw.js）
- 响应式设计 + 深色模式

## 📂 项目结构
```
├── index.html              # 主页面
├── manifest.json           # PWA 配置
├── sw.js                   # Service Worker
├── css/
│   ├── style.css           # 主样式 (36KB)
│   └── mock-interview.css  # 模拟面试样式
├── js/
│   ├── safe-ls.js          # localStorage 安全封装
│   ├── config.js           # 配置
│   ├── data.js             # 增强Markdown解析器
│   ├── spaced-repetition.js # SM-2 间隔重复 + 闪卡
│   ├── interview.js        # 面试模块（搜索/高亮/SR集成）
│   ├── mock-interview.js   # 模拟面试模块
│   ├── radar.js            # 技术雷达
│   ├── algorithm.js        # 算法可视化
│   └── app.js              # 主应用逻辑
├── data/
│   ├── catalog.json        # 35分类目录索引
│   └── cat-*.md            # 35个Markdown题库
└── images/                 # 截图/图标
```

## 📊 数据统计
- **545 题**，35 个分类
- **11 种算法动画**
- **SM-2 间隔重复**
- **~1.6MB** 纯前端

## ⌨ 快捷键
| 快捷键 | 功能 |
|--------|------|
| `j` `k` | 下一题 / 上一题 |
| `/` | 快速搜索 |

---

📅 2026 · 面试备考一站搞定
