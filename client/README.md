# TimeFlow Client - 时间线合并应用前端

Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia 构建的现代化前端应用。

## 技术栈

- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Pinia** - 状态管理（含持久化）
- **Vue Router 4** - 路由管理
- **Tailwind CSS + daisyUI** - UI 样式框架（支持暗黑模式）
- **Axios** - HTTP 请求
- **Day.js** - 日期处理
- **Vue Toastification** - 消息提示

## 项目结构

```
src/
├── assets/              # 静态资源
│   └── main.css        # 全局样式
├── components/          # 组件
│   ├── EventCard.vue           # 事件卡片
│   ├── TimelineAxis.vue        # 时间轴组件
│   ├── CreateEventModal.vue    # 创建/编辑事件弹窗
│   └── FriendItem.vue          # 好友项组件
├── composables/        # 组合式函数
│   └── useApi.ts      # API 请求封装
├── layouts/           # 布局
│   └── DefaultLayout.vue      # 默认布局（含导航栏）
├── router/            # 路由配置
│   └── index.ts      # 路由定义和守卫
├── stores/            # Pinia 状态管理
│   ├── auth.ts       # 认证状态
│   ├── event.ts      # 事件状态
│   └── friend.ts     # 好友状态
├── types/             # TypeScript 类型定义
│   └── api.ts        # API 相关类型
├── views/             # 页面视图
│   ├── LoginView.vue          # 登录/注册页
│   ├── TimelineView.vue       # 个人时间线页
│   ├── FriendsView.vue        # 好友列表页
│   └── MergeView.vue          # 合并时间线页
├── App.vue            # 根组件
└── main.ts            # 应用入口
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=TimeFlow
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 功能特性

### 认证系统
- ✅ 用户注册/登录
- ✅ JWT Token 自动管理
- ✅ 路由守卫保护
- ✅ 用户信息持久化

### 时间线管理
- ✅ 创建、编辑、删除事件
- ✅ 事件卡片展示（支持图片）
- ✅ 时间轴可视化
- ✅ 按日期排序

### 好友系统
- ✅ 好友列表展示
- ✅ 搜索好友
- ✅ 发送好友请求
- ✅ 接受好友请求

### 合并时间线（核心功能）
- ✅ 左右对比布局
- ✅ 按日期分组显示
- ✅ 使用用户颜色区分
- ✅ 响应式设计

### UI/UX
- ✅ 暗黑模式支持
- ✅ 响应式布局（移动端优先）
- ✅ Toast 消息提示
- ✅ 加载状态显示
- ✅ 空状态处理

## 主要页面

### 1. 登录/注册页 (`/login`)
- 支持登录和注册模式切换
- 表单验证
- 成功后自动跳转

### 2. 个人时间线页 (`/timeline`)
- 垂直时间轴展示
- 事件卡片交替布局
- 浮动添加按钮
- 支持编辑和删除

### 3. 好友列表页 (`/friends`)
- 好友列表展示
- 搜索功能
- 添加好友输入框
- 跳转合并时间线

### 4. 合并时间线页 (`/merge/:username`)
- 左右对比布局
- 好友事件（左）vs 我的事件（右）
- 按日期分组
- 使用颜色区分用户

## API 集成

所有 API 请求通过 `composables/useApi.ts` 封装，自动处理：
- Token 注入
- 错误统一处理
- Toast 消息提示
- 401 自动跳转登录

## 状态管理

使用 Pinia 管理全局状态：

- **authStore**: 用户认证信息、登录状态
- **eventStore**: 事件列表、CRUD 操作
- **friendStore**: 好友列表、好友请求

所有 store 支持持久化（localStorage）。

## 样式系统

- **Tailwind CSS**: 工具类样式
- **daisyUI**: UI 组件库
- **暗黑模式**: 通过 `dark` class 切换
- **自定义颜色**: 使用用户 color 作为主题色

## 开发建议

1. **类型安全**: 充分利用 TypeScript 类型检查
2. **组件复用**: 提取通用组件到 `components/`
3. **状态管理**: 全局状态使用 Pinia，局部状态使用 `ref/reactive`
4. **API 调用**: 统一使用 `useApi()` 组合式函数
5. **错误处理**: 依赖 store 和 composable 的统一错误处理

## 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 许可证

ISC