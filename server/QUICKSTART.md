# 快速开始指南

## 1. 安装依赖

```bash
npm install
```

## 2. 配置数据库

### 创建 PostgreSQL 数据库

```sql
CREATE DATABASE timeflow;
```

### 配置环境变量

创建 `.env` 文件（参考 `env.example.txt`）：

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/timeflow?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

## 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 创建数据库迁移
npm run prisma:migrate
# 输入迁移名称，例如：init

# 手动添加额外的约束（重要！）
psql -U username -d timeflow -f prisma/manual_constraints.sql
```

如果使用 Windows PowerShell，执行 SQL 文件：

```powershell
# 方法1：使用 psql
psql -U username -d timeflow -f prisma\manual_constraints.sql

# 方法2：在 psql 中执行
psql -U username -d timeflow
\i prisma/manual_constraints.sql
\q
```

## 4. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## 5. 测试 API

### 健康检查

**PowerShell (推荐):**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method Get
```

**或使用 curl.exe:**
```powershell
curl.exe http://localhost:3000/health
```

### 注册用户

**PowerShell (推荐):**
```powershell
$body = @{
    email = "test@example.com"
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method Post -Body $body -ContentType "application/json"
```

**或使用 curl.exe:**
```powershell
curl.exe -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"password123\"}'
```

### 登录

**PowerShell (推荐):**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token
Write-Host "Token: $token"
```

**或使用 curl.exe:**
```powershell
curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

保存返回的 token，用于后续请求。

### 创建事件（需要认证）

**PowerShell (推荐):**
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    event_date = "2024-01-01T00:00:00Z"
    title = "我的第一个事件"
    content = "这是事件的内容"
    image_url = "https://example.com/image.jpg"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/events -Method Post -Body $body -Headers $headers
```

**或使用 curl.exe:**
```powershell
curl.exe -X POST http://localhost:3000/api/events `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"event_date\":\"2024-01-01T00:00:00Z\",\"title\":\"我的第一个事件\",\"content\":\"这是事件的内容\",\"image_url\":\"https://example.com/image.jpg\"}'
```

### 获取事件列表

**PowerShell (推荐):**
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri http://localhost:3000/api/events -Method Get -Headers $headers
```

**或使用 curl.exe:**
```powershell
curl.exe http://localhost:3000/api/events -H "Authorization: Bearer $token"
```

## PowerShell 快速测试脚本

将以下命令保存为 `test-api.ps1`，可以快速测试 API：

```powershell
# 测试 API 脚本
$baseUrl = "http://localhost:3000"

# 1. 健康检查
Write-Host "`n=== 健康检查 ===" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/health"

# 2. 注册用户
Write-Host "`n=== 注册用户 ===" -ForegroundColor Green
$registerBody = @{
    email = "test@example.com"
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
$token = $registerResponse.data.token
Write-Host "注册成功! Token: $token" -ForegroundColor Yellow

# 3. 登录
Write-Host "`n=== 登录 ===" -ForegroundColor Green
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
Write-Host "登录成功! Token: $token" -ForegroundColor Yellow

# 4. 获取当前用户信息
Write-Host "`n=== 获取当前用户信息 ===" -ForegroundColor Green
$headers = @{ "Authorization" = "Bearer $token" }
$userInfo = Invoke-RestMethod -Uri "$baseUrl/api/users/me" -Method Get -Headers $headers
$userInfo.data

# 5. 创建事件
Write-Host "`n=== 创建事件 ===" -ForegroundColor Green
$eventBody = @{
    event_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    title = "我的第一个事件"
    content = "这是事件的内容"
} | ConvertTo-Json

$eventResponse = Invoke-RestMethod -Uri "$baseUrl/api/events" -Method Post -Body $eventBody -Headers $headers -ContentType "application/json"
Write-Host "事件创建成功!" -ForegroundColor Yellow

# 6. 获取事件列表
Write-Host "`n=== 获取事件列表 ===" -ForegroundColor Green
$events = Invoke-RestMethod -Uri "$baseUrl/api/events" -Method Get -Headers $headers
$events.data
```

## 常见问题

### Prisma 错误：Cannot find module '@prisma/client'

解决：运行 `npm run prisma:generate`

### 数据库连接错误

检查：
1. PostgreSQL 服务是否运行
2. `.env` 中的 `DATABASE_URL` 是否正确
3. 数据库用户是否有权限

### 约束创建失败

确保在运行 `prisma migrate` 后再执行 `manual_constraints.sql`

## 使用 Prisma Studio 查看数据库

```bash
npm run prisma:studio
```

这将打开浏览器，可以通过图形界面查看和编辑数据库。