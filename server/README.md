# TimeFlow API - 时间线合并应用后端

这是一个基于 Node.js + Express + PostgreSQL 的 RESTful API，用于时间线合并应用。

## 技术栈

- **Node.js 20+** (ESM)
- **Express.js** - Web 框架
- **PostgreSQL** - 数据库
- **Prisma** - ORM
- **JWT** - 身份认证
- **bcrypt** - 密码加密

## 项目结构

```
.
├── config/              # 配置文件
│   └── database.js      # Prisma 数据库连接
├── middleware/          # 中间件
│   ├── auth.js         # JWT 认证中间件
│   └── errorHandler.js # 全局错误处理
├── routes/             # 路由文件
│   ├── auth.routes.js  # 认证路由
│   ├── user.routes.js  # 用户路由
│   ├── event.routes.js # 事件路由
│   ├── friend.routes.js# 好友路由
│   └── merge.routes.js # 合并时间线路由
├── services/           # 业务逻辑层
│   ├── user.service.js
│   ├── event.service.js
│   └── friendship.service.js
├── prisma/             # Prisma 配置
│   ├── schema.prisma   # 数据库模型
│   ├── manual_constraints.sql # 手动添加的约束
│   └── MIGRATION_NOTES.md # 迁移说明
├── app.js              # Express 应用
├── server.js           # 服务器启动文件
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=development

# PostgreSQL 数据库连接
DATABASE_URL=postgresql://username:password@localhost:5432/timeflow?schema=public

# JWT 密钥（请使用强随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=*
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 创建数据库迁移
npm run prisma:migrate

# 手动添加额外的约束（必须执行）
psql -U username -d timeflow -f prisma/manual_constraints.sql
```

或者使用 Prisma Studio 查看数据库：

```bash
npm run prisma:studio
```

### 4. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 5. 使用 PM2 管理（生产推荐）

```bash
# 全局安装 PM2（如未安装）
npm install -g pm2

# 使用 pm2 启动（名称可自定义）
pm2 start server.js --name timeflow-api

# 查看运行状态与日志
pm2 status
pm2 logs timeflow-api

# 重启 / 停止 / 删除
pm2 restart timeflow-api
pm2 stop timeflow-api
pm2 delete timeflow-api

# 保存进程列表（重启后自动拉起）
pm2 save
pm2 startup    # 按提示执行生成的命令
```

## API 文档

### 认证相关

#### POST /api/auth/register
用户注册

**请求体：**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token"
  },
  "message": "注册成功"
}
```

#### POST /api/auth/login
用户登录

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 用户相关

#### GET /api/users/me
获取当前用户信息（需认证）

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/users/:username
获取指定用户的公开信息（公开接口）

### 事件相关

所有事件接口都需要认证。

#### POST /api/events
创建事件

**请求体：**
```json
{
  "event_date": "2024-01-01T00:00:00Z",
  "title": "事件标题",
  "content": "事件内容",
  "image_url": "https://example.com/image.jpg" // 可选
}
```

#### GET /api/events
获取当前用户的所有事件（按日期降序）

#### GET /api/events/:id
获取单个事件

#### PUT /api/events/:id
更新事件

#### DELETE /api/events/:id
删除事件

### 好友相关

所有好友接口都需要认证。

#### POST /api/friends/request
发送好友请求

**请求体：**
```json
{
  "username": "friend_username"
}
```

#### POST /api/friends/accept
接受好友请求

**请求体：**
```json
{
  "friendshipId": "123"
}
```

#### GET /api/friends
获取当前用户的所有好友（accepted 状态）

### 合并时间线

#### GET /api/merge/:friendUsername
合并时间线 - 获取自己和好友的事件列表（需认证，必须是好友关系）

**响应格式：**
```json
{
  "success": true,
  "data": {
    "me": {
      "username": "user1",
      "color": "#2563EB",
      "avatar_url": null,
      "events": [...]
    },
    "friend": {
      "username": "user2",
      "color": "#7C3AED",
      "avatar_url": null,
      "events": [...]
    }
  }
}
```

## 统一响应格式

所有 API 响应遵循以下格式：

```json
{
  "success": boolean,
  "data": any,        // 可选
  "message": string,  // 可选
  "error": string     // 可选（错误时）
}
```

## 数据库模型

### Users
- id, email, password_hash, username, display_name, avatar_url, color, created_at, updated_at

### Events
- id, user_id, event_date, title, content, image_url, created_at, updated_at

### Friendships
- id, user_id, friend_id, status (pending/accepted/rejected/blocked), requested_at, updated_at

## 错误处理

API 使用全局错误处理中间件，常见的错误码：

- `400` - 请求参数错误
- `401` - 未认证或令牌无效
- `403` - 无权限访问
- `404` - 资源不存在
- `409` - 资源冲突（如唯一约束）
- `500` - 服务器错误

## 开发说明

### 数据库迁移

Prisma 会自动处理大部分数据库结构，但以下约束需要手动添加：

1. User 表的 color 字段 CHECK 约束
2. Friendship 表的 CHECK 约束（防止自己加自己、status 验证）
3. Friendship 表的唯一索引（防止重复好友关系）

执行 `prisma/manual_constraints.sql` 文件中的 SQL。

### 认证流程

1. 用户注册/登录后获得 JWT token
2. 后续请求在 Header 中携带：`Authorization: Bearer <token>`
3. `authenticate` 中间件验证 token 并附加用户信息到 `req.user`

### 环境变量

必需的环境变量：
- `DATABASE_URL` - PostgreSQL 连接字符串
- `JWT_SECRET` - JWT 签名密钥

可选的环境变量：
- `PORT` - 服务器端口（默认 3000）
- `NODE_ENV` - 运行环境（development/production）
- `JWT_EXPIRES_IN` - Token 过期时间（默认 7d）
- `CORS_ORIGIN` - CORS 允许的来源（默认 *）

## 许可证

ISC