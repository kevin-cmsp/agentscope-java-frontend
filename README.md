# AgentScope-Java 前端项目

## 项目概述

基于 Vue 3 + TypeScript + Element Plus 构建的企业级 AI Agent 管理系统前端应用。提供智能聊天对话、系统管理（用户/角色/菜单）、动态权限路由等功能，配合后端 agentscope-java-backend 使用。

### 核心功能

- **AI 智能聊天**：悬浮式聊天窗口，支持 Markdown 渲染，集成天气查询、计算器、活动策划等 AI 能力
- **系统管理**：完整的用户管理、角色管理、菜单管理 CRUD 功能
- **动态路由**：基于用户角色权限动态生成路由和侧边栏菜单
- **安全认证**：AES 密码加密、JWT Token 认证、验证码登录

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4.15 | 前端框架 |
| TypeScript | 5.3.3 | 类型安全 |
| Vite | 5.0.11 | 构建工具 |
| Vue Router | 4.2.5 | 路由管理 |
| Pinia | 2.1.7 | 状态管理 |
| Element Plus | 2.5.4 | UI 组件库 |
| Axios | 1.6.5 | HTTP 客户端 |
| CryptoJS | 4.2.0 | AES 加密 |
| markdown-it | 14.0.0 | Markdown 渲染 |
| dayjs | 1.11.10 | 日期处理 |
| Sass | 1.70.0 | CSS 预处理器 |

## 项目结构

```
agentscope-java-frontend/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── App.vue                    # 根组件
│   ├── api/                       # API 请求层
│   │   ├── index.ts               #   模块导出
│   │   ├── auth.ts                #   认证接口（登录/登出/验证码）
│   │   ├── user.ts                #   用户管理接口
│   │   ├── role.ts                #   角色管理接口
│   │   ├── menu.ts                #   菜单管理接口
│   │   └── ai.ts                  #   AI 聊天接口
│   ├── views/                     # 页面组件
│   │   ├── Login.vue              #   登录页
│   │   ├── Home.vue               #   首页
│   │   ├── ai/
│   │   │   └── Chat.vue           #   AI 聊天页
│   │   └── system/
│   │       ├── User.vue           #   用户管理
│   │       ├── Role.vue           #   角色管理
│   │       └── Menu.vue           #   菜单管理
│   ├── components/                # 公共组件
│   │   └── AIChat.vue             #   AI 聊天悬浮窗
│   ├── layouts/
│   │   └── MainLayout.vue         #   主布局（侧边栏+顶部导航+内容区）
│   ├── store/                     # Pinia 状态管理
│   │   ├── index.ts               #   Store 入口
│   │   └── modules/
│   │       ├── user.ts            #   用户状态（Token/登录/登出）
│   │       └── menu.ts            #   菜单状态（动态路由）
│   ├── router/
│   │   └── index.ts               #   路由配置 + 路由守卫
│   ├── types/
│   │   └── api.ts                 #   TypeScript 类型定义
│   ├── utils/
│   │   ├── request.ts             #   Axios 封装（拦截器/Token/错误处理）
│   │   └── aesCryptUtils.ts       #   AES 加密工具
│   └── styles/
│       ├── index.scss             #   全局样式
│       └── variables.scss         #   SCSS 变量
├── index.html                     # HTML 入口
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 依赖管理
└── .eslintrc.cjs                  # ESLint 配置
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:3000）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

开发环境下 API 请求自动代理到 `http://localhost:8080`（需先启动后端服务）。

### 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 超级管理员 |

## 页面说明

### 登录页 (Login.vue)

- 表单验证：用户名、密码、验证码必填
- 密码使用 AES/CBC/PKCS7 加密后传输
- 验证码点击可刷新
- 登录成功后跳转首页

### 首页 (Home.vue)

- 欢迎信息（显示当前用户昵称）
- 实时时间显示
- 系统统计信息（系统状态、在线用户、今日访问）
- 快捷功能入口（天气查询、计算器、活动策划、数据查询）
- 最近对话时间线

### 主布局 (MainLayout.vue)

- **侧边栏**：根据用户权限动态生成菜单，支持折叠/展开
- **顶部导航**：折叠按钮 + 用户下拉菜单（个人信息、退出登录）
- **内容区**：路由页面出口，带 Fade 过渡动画
- **悬浮窗**：AI 聊天组件固定在右下角

### AI 聊天组件 (AIChat.vue)

- 悬浮式窗口，点击右下角图标弹出，支持自由拖拽调整大小
- 左右分栏布局（类似千问对话界面）：
  - 左侧：新建对话按钮 + 对话历史列表（标题为用户首次提问前20字符）
  - 右侧：聊天消息区域 + 输入区域
- 用户消息靠右展示，助手回答靠左展示
- 支持 Markdown 渲染（代码块、表格、列表等）
- 消息发送：Enter 发送，Shift+Enter 换行
- 新建对话：清空消息区域，光标聚焦输入框
- 点击历史对话：加载该对话的完整消息记录
- 删除对话：支持删除单条对话历史
- 加载状态骨架屏
- 未读消息徽章提示

### 用户管理 (User.vue)

- 搜索：按用户名、手机号、状态筛选
- 表格：ID、用户名、昵称、手机号、邮箱、状态、创建时间、操作
- 操作：新增、编辑、删除、启用/禁用、重置密码、分配角色
- 分页：支持 10/20/50/100 每页

### 角色管理 (Role.vue)

- 搜索：按角色名、状态筛选
- 表格：ID、角色名、描述、角色编码、状态、创建时间、操作
- 操作：新增、编辑、删除、启用/禁用、分配菜单权限

### 菜单管理 (Menu.vue)

- 树形表格展示菜单层级
- 菜单类型：目录(type=1)、菜单(type=2)、按钮(type=3)
- 操作：新增、编辑、删除
- 支持配置路由路径、组件路径、图标、排序、权限标识

## 核心机制

### 认证流程

```
获取验证码 → 输入用户名+密码+验证码 → AES加密密码 → POST /auth/login
→ 获得JWT Token → 存储到localStorage → 后续请求Header携带Token
```

AES 加密配置（需与后端一致）：
- 算法：AES/CBC/PKCS7
- 密钥（32字符）和 IV（16字符）在 `aesCryptUtils.ts` 中配置

### 动态路由

```
用户登录 → 路由守卫检测 → 调用 /system/menu/user/{userId}
→ 获取菜单树 → 存入Pinia → 遍历菜单动态添加路由
→ 侧边栏自动渲染（只显示type=1目录和type=2菜单）
```

组件映射：菜单 `component` 字段（如 `system/User`）映射到 `src/views/` 下对应组件。

### HTTP 请求

- 基础路径：`/api`
- 超时：30 秒
- 请求拦截：自动添加 `Authorization: Bearer <token>`
- 响应拦截：code !== 200 提示错误；401 自动跳转登录页
- 开发代理：`/api` -> `http://localhost:8080`

### 状态管理

**User Store**：
- `token` / `userInfo`：登录态信息
- `userLogin()`：登录并持久化到 localStorage
- `userLogout()`：登出并清空状态
- `initUserInfo()`：从 localStorage 恢复状态（页面刷新）

**Menu Store**：
- `menus`：完整菜单数据
- `sidebarMenus`（计算属性）：过滤后的侧边栏菜单（type=1 目录 + type=2 子菜单）
- `loadMenus(userId)`：从后端加载用户菜单

## API 模块

### 认证 (auth.ts)

| 方法 | 接口 | 说明 |
|------|------|------|
| `getCaptcha()` | GET `/auth/captcha` | 获取验证码 |
| `login(params)` | POST `/auth/login` | 用户登录 |
| `logout()` | POST `/auth/logout` | 用户登出 |
| `getUserInfo()` | GET `/auth/userinfo` | 获取当前用户信息 |

### 用户管理 (user.ts)

| 方法 | 接口 | 说明 |
|------|------|------|
| `queryUsers(params)` | GET `/system/user` | 查询用户列表 |
| `getUserById(id)` | GET `/system/user/{id}` | 用户详情 |
| `createUser(data)` | POST `/system/user` | 创建用户 |
| `updateUser(data)` | PUT `/system/user` | 更新用户 |
| `deleteUser(id)` | DELETE `/system/user/{id}` | 删除用户 |
| `updateUserStatus(userId, status)` | PUT `/system/user/status` | 更新状态 |
| `resetPassword(userId)` | PUT `/system/user/reset-password/{id}` | 重置密码 |
| `assignRoles(userId, roleIds)` | PUT `/system/user/assign-roles` | 分配角色 |
| `getUserRoles(userId)` | GET `/system/user/roles/{id}` | 获取用户角色 |

### 角色管理 (role.ts)

| 方法 | 接口 | 说明 |
|------|------|------|
| `queryRoles(params)` | GET `/system/role` | 查询角色列表 |
| `getRoleById(id)` | GET `/system/role/{id}` | 角色详情 |
| `createRole(data)` | POST `/system/role` | 创建角色 |
| `updateRole(data)` | PUT `/system/role` | 更新角色 |
| `deleteRole(id)` | DELETE `/system/role/{id}` | 删除角色 |
| `updateRoleStatus(roleId, status)` | PUT `/system/role/status` | 更新状态 |
| `assignMenus(roleId, menuIds)` | PUT `/system/role/assign-menus` | 分配菜单 |
| `getRoleMenus(roleId)` | GET `/system/role/menus/{id}` | 获取角色菜单 |
| `getRoleUsers(roleId)` | GET `/system/role/users/{id}` | 获取角色用户 |

### 菜单管理 (menu.ts)

| 方法 | 接口 | 说明 |
|------|------|------|
| `getMenuTree()` | GET `/system/menu/tree` | 获取菜单树 |
| `getUserMenusByUserId(userId)` | GET `/system/menu/user/{id}` | 获取用户菜单（动态路由） |
| `getUserMenus(roleIds)` | POST `/system/menu/user-menus` | 按角色获取菜单 |
| `createMenu(data)` | POST `/system/menu` | 创建菜单 |
| `updateMenu(data)` | PUT `/system/menu` | 更新菜单 |
| `deleteMenu(id)` | DELETE `/system/menu/{id}` | 删除菜单 |

### AI 聊天 (ai.ts)

| 方法 | 接口 | 说明 |
|------|------|------|
| `chat(message, conversationId?)` | POST `/chat` | AI 聊天（支持关联会话） |
| `getConversations()` | GET `/chat/conversations` | 获取会话列表 |
| `createConversation(title?)` | POST `/chat/conversations` | 创建新会话 |
| `getConversationMessages(id)` | GET `/chat/conversations/{id}/messages` | 获取会话消息 |
| `deleteConversation(id)` | DELETE `/chat/conversations/{id}` | 删除会话 |
| `planParty(message)` | POST `/party/level` | 活动策划 |
| `getWeather(city)` | POST `/weather` | 天气查询 |
| `executeCalculator(params)` | POST `/skills/calculator` | 计算器 |

## 构建与部署

### 开发环境

```bash
npm run dev
# http://localhost:3000
# API 代理到 http://localhost:8080
```

### 生产构建

```bash
npm run build
# 输出目录：dist/
```

### Nginx 部署配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 许可证

MIT License
