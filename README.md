
<div align="center">
  <img style="width: 80px;height: 80px" src="src/assets/logos/custom2.png" alt="Blog Admin Logo"/>
  <h1>Blog Admin</h1>
  <p>基于 Vue3 + TypeScript + Arco Design 的现代化博客后台管理系统</p>
</div>

<div align="center">

[![Vue](https://img.shields.io/badge/Vue-3.5.19-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Arco Design](https://img.shields.io/badge/Arco%20Design-2.57.0-165DFF?logo=arco-design&logoColor=white)](https://arco.design/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

</div>

> **三端说明**：本仓库（管理端）与 [blog-home-nuxt](https://github.com/Jiang-Xia/blog-home-nuxt) 为 **MIT 开源**；后端 **blog-server 闭源**。  
> 完整部署、源码授权与付费合作 → **[jiang-xia.top/open-source](https://jiang-xia.top/open-source)**

## 📖 项目简介

Blog Admin 是一个基于 **Vue3**、**TypeScript**、**Vite** 和 **Arco Design Vue** 构建的现代化博客后台管理系统。该系统采用最新的前端技术栈，为个人博客提供完整的文章管理、用户管理、内容分类、标签管理、RPG 游戏化运营等核心功能。

本仓库为博客三端架构中的**管理后台**，配套服务：
- 博客前台：[blog-home-nuxt](https://github.com/Jiang-Xia/blog-home-nuxt)（MIT 开源）
- 后端 API：**blog-server 闭源**，说明与授权见 [开源与合作](https://jiang-xia.top/open-source)

## ✨ 核心特性

### 🚀 技术特性
- **Vue3 Composition API** - 使用最新的 Vue3 语法和组合式 API
- **TypeScript 支持** - 完整的类型定义和类型安全
- **Vite 构建工具** - 快速的开发体验和构建速度
- **Arco Design Vue** - 企业级 UI 组件库，美观且易用
- **Pinia 状态管理** - 现代化的状态管理方案
- **Vue Router 4** - 官方路由解决方案

### 🎯 功能特性
- **📊 数据仪表板** - 可视化数据展示，包含访问统计、内容分析等
- **📝 文章管理** - 支持 Markdown 编辑器，文章创建、编辑、分类管理
- **🏷️ 分类标签** - 灵活的文章分类和标签系统
- **👥 用户管理** - 用户权限管理、角色分配
- **💬 评论系统** - 文章评论管理和审核
- **🔗 链接管理** - 友情链接和资源链接管理
- **📁 资源管理** - 文件上传、图片管理等
- **🎮 RPG 管理** - 成就、任务、奖池、用户数据、物品配置、活动、公会、社交流水
- **🌐 国际化支持** - 中英文双语支持
- **📱 响应式设计** - 支持多设备访问

### 🛠️ 开发特性
- **ESLint + Prettier** - 代码规范和格式化
- **Husky + lint-staged** - Git 钩子和代码质量检查
- **Commitlint** - 提交信息规范
- **Mock 数据** - 开发阶段数据模拟
- **热更新** - 快速的开发调试体验

## 🏗️ 项目架构

```
src/
├── api/                 # API 接口层
├── assets/             # 静态资源
├── components/         # 公共组件
├── config/            # 配置文件
├── directive/         # 自定义指令
├── hooks/             # 组合式函数
├── layout/            # 布局组件
├── locale/            # 国际化配置
├── router/            # 路由配置
├── store/             # 状态管理
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
└── views/             # 页面组件
    ├── dashboard/     # 仪表板
    ├── article/       # 文章管理
    ├── category/      # 分类管理
    ├── tag/          # 标签管理
    ├── user/         # 用户管理
    ├── system/       # 系统管理
    ├── comment/      # 评论管理
    ├── resource/     # 资源管理
    ├── rpg/          # RPG 游戏化管理（8 个页面）
    └── login/        # 登录页面
```

## 🏗️ 技术架构

```
浏览器
  → Vue Router 路由
    → views/*.vue（Arco Design 页面）
      → src/api/*.ts（axios + JWT）
        → blog-server /api/v1
```

- **内容编辑**：文章编辑页使用 `md-editor-v3`，提交 `content` + `contentHtml` 至后端
- **权限控制**：基于后端 RBAC，菜单与按钮按角色/权限动态渲染
- **路由模块**：`router/routes/modules/` 按业务域拆分（content、interaction、ext-apps 等）

## 🚀 快速开始

### 环境要求
- Node.js >= 20.19.3
- npm >= 10.8.2 或 yarn >= 1.22.0
- 已启动的 blog-server 后端（闭源，需自行授权获取或对接兼容 API）

### 环境配置

修改 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_PREFIX_PATH=/x-blog
VITE_NUXT_OPEN_ENCRYPT=false
```

### 推荐IDE
- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) - Vue3 官方推荐的开发工具

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发模式
```bash
npm run dev
# 或
yarn dev
```

### 生产构建
```bash
npm run build
# 或
yarn build
```

### 代码检查
```bash
npm run lint
# 或
yarn lint
```

### 类型检查
```bash
npm run type-check
# 或
yarn type-check
```

## 📱 在线预览

- **在线演示**: [Blog Admin](https://admin.jiang-xia.top/dashboard/workplace)

## 🔧 技术栈详情

### 核心框架
- **Vue 3.5.19** - 渐进式 JavaScript 框架
- **TypeScript 5.9.2** - JavaScript 的超集，提供类型系统
- **Vite 7.1.3** - 下一代前端构建工具

### UI 组件库
- **Arco Design Vue 2.57.0** - 字节跳动出品的企业级设计系统
- **Vue ECharts 7.0.3** - 基于 ECharts 的 Vue 图表组件

### 状态管理 & 路由
- **Pinia 3.0.3** - Vue 官方推荐的状态管理库
- **Vue Router 4.5.1** - Vue.js 官方路由管理器

### 开发工具
- **ESLint 9.31.0** - JavaScript 代码检查工具
- **Prettier 3.6.2** - 代码格式化工具
- **Husky 9.1.7** - Git 钩子管理
- **lint-staged 16.1.5** - 暂存文件 lint 检查

### 功能库
- **axios 1.11.0** - HTTP 客户端
- **dayjs 1.11.13** - 轻量级日期处理库
- **crypto-js 4.2.0** - 加密算法库
- **md-editor-v3 5.8.4** - Markdown 编辑器
- **vue-i18n 11.1.11** - Vue 国际化插件

## 📁 主要功能模块

### 仪表板 (Dashboard)
- 数据统计面板
- 访问量趋势图
- 热门内容展示
- 快速操作入口

### 文章管理 (Article)
- 文章创建与编辑
- Markdown 编辑器支持
- 分类和标签管理
- 文章状态管理

### 内容管理
- **分类管理** - 文章分类的增删改查
- **标签管理** - 文章标签的创建和管理
- **评论管理** - 用户评论的审核和管理

### 系统管理
- **用户管理** - 用户账户和权限管理
- **菜单管理** - 系统菜单结构配置
- **角色权限** - 基于角色的访问控制

### 资源管理
- 文件上传和管理
- 图片资源处理
- 静态资源优化

### RPG 管理 (`/ext-apps/rpg`)

| 路由 | 页面 | 功能 |
|------|------|------|
| `/ext-apps/rpg/achievement` | 成就管理 | `rpg_item_config` CRUD |
| `/ext-apps/rpg/quest` | 任务管理 | 每日/悬赏/特殊任务 CRUD |
| `/ext-apps/rpg/lottery` | 奖池管理 | 抽奖池配置与记录 |
| `/ext-apps/rpg/user` | 用户数据 | RPG 用户只读与统计 |
| `/ext-apps/rpg/item-config` | 系统物品 | 称号/头像框/宠物等 CRUD |
| `/ext-apps/rpg/activity` | 活动管理 | 赛季/节日活动 CRUD |
| `/ext-apps/rpg/guild` | 公会管理 | 公会列表与删除 |
| `/ext-apps/rpg/social-log` | 社交流水 | 打赏/社交互动记录 |

RPG 管理端接口与后端实现文档在 **blog-server 源码授权** 后提供；公开 Issue 可讨论管理端 UI 与联调问题。

## 🎨 界面预览

系统采用现代化的设计风格，包含：
- 响应式布局设计
- 深色/浅色主题切换
- 美观的数据可视化图表
- 直观的操作界面

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

### 开发规范
- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 编写代码
- 遵循 Vue3 组合式 API 最佳实践
- 提交信息遵循 Conventional Commits 规范

## 📄 开源协议

本项目（blog-admin）基于 [MIT License](./LICENSE) 开源。  
后端 blog-server **不在此协议范围内**，获取方式见 [开源与合作](https://jiang-xia.top/open-source)。

## 📚 相关文档

- [blog-home-nuxt README](https://github.com/Jiang-Xia/blog-home-nuxt) - 博客前台
- [开源与合作（闭源边界 · 付费套餐）](https://jiang-xia.top/open-source)

## 👨‍💻 作者

**jiang-xia**

- 项目地址: [Gitee](https://gitee.com/jiang-xia/blog-admin)
- 在线演示: [https://admin.jiang-xia.top](https://admin.jiang-xia.top)

## 🙏 致谢

感谢以下开源项目：
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Arco Design](https://arco.design/) - 企业级设计系统
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

---

<div align="center">
  <p>如果这个项目对你有帮助，请给个 ⭐️ 支持一下！</p>
</div>
