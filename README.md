# AgentScope Java Frontend

企业级 AI 智能助手前端应用，基于 Vue 3 + TypeScript + Element Plus 构建，提供完整的用户认证、权限管理和 AI 对话交互功能。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4.15 | 前端框架（Composition API） |
| TypeScript | 5.3.3 | 类型安全 |
| Vite | 5.0.11 | 构建工具 |
| Element Plus | 2.5.4 | UI 组件库 |
| Vue Router | 4.2.5 | 路由管理 |
| Pinia | 2.1.7 | 状态管理 |
| Axios | 1.6.5 | HTTP 客户端 |
| markdown-it | 14.0.0 | Markdown 渲染 |
| highlight.js | 11.11.1 | 代码高亮 |
| dayjs | 1.11.10 | 日期处理 |
| crypto-js | 4.2.0 | AES 密码加密 |
| Sass | 1.70.0 | CSS 预处理器 |

## 项目结构

```
src/
├── api/                              # API 请求层
│   ├── index.ts                      # API 统一导出
│   ├── auth.ts                       # 认证接口（登录、登出、验证码）
│   ├── ai.ts                         # AI 聊天接口（对话、画像、记忆统计）
│   ├── user.ts                       # 用户管理接口
│   ├── role.ts                       # 角色管理接口
│   └── menu.ts                       # 菜单管理接口
├── views/                            # 页面组件
│   ├── Login.vue                     # 登录页面
│   ├── Home.vue                      # 首页（欢迎信息 + 快捷功能）
│   ├── ai/
│   │   └── Chat.vue                  # AI 聊天页面
│   └── system/
│       ├── User.vue                  # 用户管理
│       ├── Role.vue                  # 角色管理
│       └── Menu.vue                  # 菜单管理
├── components/                       # 公共组件
│   └── AIChat.vue                    # AI 聊天悬浮窗（核心交互组件）
├── layouts/
│   └── MainLayout.vue                # 主布局（侧边栏 + 顶部导航 + 内容区）
├── store/                            # Pinia 状态管理
│   └── modules/
│       ├── user.ts                   # 用户状态（Token、登录/登出）
│       └── menu.ts                   # 菜单状态（动态路由、权限菜单）
├── router/
│   └── index.ts                      # 路由配置 + 路由守卫
├── types/
│   └── api.ts                        # TypeScript 接口定义
├── utils/
│   ├── request.ts                    # Axios 封装（请求/响应拦截器）
│   └── aesCryptUtils.ts              # AES 密码加密工具
├── styles/
│   ├── index.scss                    # 全局样式
│   └── variables.scss                # SCSS 变量
├── main.ts                           # 应用入口
└── App.vue                           # 根组件
```

## 核心功能

### 1. AI 聊天悬浮窗

位于页面右下角的悬浮聊天窗口（AIChat.vue），提供：

- 可拖拽移动和调整大小（8 个方向）
- 左侧对话历史列表，右侧聊天区域
- Markdown 渲染 + 代码高亮（highlight.js）
- 代码块一键复制
- Shift+Enter 换行，Enter 发送
- 自动滚动到最新消息
- 未读消息计数提示

### 2. 用户认证

- 用户名 + 密码 + 图形验证码登录
- AES 密码加密传输（CBC 模式 + PKCS7 填充）
- JWT Token 存储在 localStorage
- 路由守卫自动检查认证状态

### 3. 动态权限路由

- 登录后从后端获取用户权限菜单
- 动态添加路由（`router.addRoute`）
- 侧边栏菜单根据权限自动渲染
- 支持目录（type=1）、菜单（type=2）、按钮（type=3）三级权限

### 4. 系统管理

- **用户管理**：增删改查、分配角色、状态切换、密码重置
- **角色管理**：增删改查、分配菜单权限
- **菜单管理**：树形表格展示、支持目录/菜单/按钮类型

## API 调用

### AI 相关

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `chat()` | POST | `/api/chat` | 发送消息 |
| `getConversations()` | GET | `/api/chat/conversations` | 获取会话列表 |
| `createConversation()` | POST | `/api/chat/conversations` | 创建新会话 |
| `getConversationMessages()` | GET | `/api/chat/conversations/{id}/messages` | 获取消息列表 |
| `deleteConversation()` | DELETE | `/api/chat/conversations/{id}` | 删除会话 |
| `getUserProfile()` | GET | `/api/profile` | 获取用户画像 |
| `analyzeUserProfile()` | POST | `/api/profile/analyze` | 触发画像分析 |
| `getMemoryStats()` | GET | `/api/memory/stats` | 获取记忆统计 |
| `getWeather()` | POST | `/api/weather` | 天气查询 |
| `executeCalculator()` | POST | `/api/skills/calculator` | 计算器 |
| `planParty()` | POST | `/api/party/level` | 活动策划 |

### 认证相关

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `getCaptcha()` | GET | `/api/auth/captcha` | 获取验证码 |
| `login()` | POST | `/api/auth/login` | 用户登录 |
| `logout()` | POST | `/api/auth/logout` | 用户登出 |
| `getUserInfo()` | GET | `/api/auth/userInfo` | 获取用户信息 |

## TypeScript 类型定义

```typescript
// 通用响应
interface Result<T> { code: number; message: string; data: T }

// 用户信息
interface UserInfo { id: number; username: string; nickname: string; ... }

// 菜单
interface Menu { id: number; name: string; path: string; type: number; children?: Menu[] }

// 聊天消息
interface ChatMessage { role: 'user' | 'assistant'; content: string; time?: string }

// 会话
interface Conversation { id: number; userId: number; title: string; ... }

// 用户画像
interface UserProfile { id: number; interestTags: string; chatStyle: string; ... }

// 记忆统计
interface MemoryStats { memorySize: number; hasSummary: boolean; needsCompression: boolean }
```

## 环境要求

- Node.js 18+
- npm 或 yarn

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器默认启动在 `http://localhost:3000`，API 请求通过 Vite 代理转发到后端 `http://localhost:8080`。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

### 5. 代码检查

```bash
npm run lint
```

## 构建配置

### Vite 配置（vite.config.ts）

```typescript
{
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: { '@': './src' }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  }
}
```

## 路由配置

| 路径 | 组件 | 说明 | 认证 |
|------|------|------|------|
| `/login` | Login.vue | 登录页面 | 否 |
| `/home` | Home.vue | 首页 | 是 |
| `/ai/chat` | Chat.vue | AI 聊天页面 | 是 |
| `/system/user` | User.vue | 用户管理 | 是 |
| `/system/role` | Role.vue | 角色管理 | 是 |
| `/system/menu` | Menu.vue | 菜单管理 | 是 |

其他路由根据后端菜单权限动态添加。

## 页面布局

```
┌──────────────────────────────────────────────┐
│  Logo  │  折叠按钮  │        │ 用户信息 │ 退出 │  顶部导航 (60px)
├────────┼─────────────────────────────────────┤
│        │                                     │
│ 侧边栏  │            主内容区                  │
│(240px  │         (路由视图)                   │
│ 或64px) │                                     │
│        │            ┌─────────────────┐      │
│        │            │  AI 聊天悬浮窗   │      │
│        │            │  (可拖拽/缩放)   │      │
│        │            └─────────────────┘      │
└────────┴─────────────────────────────────────┘
```

## 状态管理

### User Store

```typescript
state: { token: string; userInfo: UserInfo | null }
actions: { userLogin(), userLogout(), initUserInfo() }
```

### Menu Store

```typescript
state: { menus: Menu[] }
computed: { sidebarMenus }
actions: { loadMenus(userId) }
```

## 安全机制

- **密码加密**：AES-CBC 模式 + PKCS7 填充，Base64 编码传输
- **Token 管理**：JWT Token 存储在 localStorage，请求自动携带 Authorization Header
- **权限控制**：路由守卫 + 动态路由 + 后端权限校验
- **会话超时**：401 响应自动跳转登录页
