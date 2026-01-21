# API 代理配置说明

本文档说明如何在开发和生产环境中配置 API 地址。

## 开发环境

开发环境使用 Vite 代理，自动将以下请求代理到后端服务器：

- `/api/*` → `http://localhost:3000/api/*`（通过 `VITE_API_BASE_URL` 配置）
- `/uploads/*` → `http://localhost:3000/uploads/*`（通过 `VITE_API_BASE_URL` 配置）

### 配置方式

在 `.env` 文件中设置 `VITE_API_BASE_URL`：

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 生产环境

### 方案一：使用环境变量（推荐，简化部署）

在构建时通过环境变量设置后端地址，前端代码会直接使用该地址。

在构建时设置环境变量（**必须包含完整的 URL，包括协议、域名和端口号**）：

```bash
# Windows PowerShell
$env:VITE_API_BASE_URL="http://your-backend-server.com:3000"; npm run build

# Linux/Mac
VITE_API_BASE_URL=http://your-backend-server.com:3000 npm run build
```

或者在 `.env.production` 文件中设置：

```env
# 重要：必须包含完整的 URL，包括端口号（如果不是标准端口 80/443）
VITE_API_BASE_URL=http://your-backend-server.com:3000

# HTTPS 示例（标准端口 443 可以省略）
VITE_API_BASE_URL=https://your-backend-server.com

# 非标准 HTTPS 端口示例
VITE_API_BASE_URL=https://your-backend-server.com:8443
```

**重要提示**：
- ✅ 必须包含协议（`http://` 或 `https://`）
- ✅ 如果后端使用非标准端口，必须包含端口号（如 `:3000`）
- ✅ 标准端口（HTTP 80、HTTPS 443）可以省略端口号

**优点**：
- ✅ 部署简单，无需配置反向代理
- ✅ 可以灵活配置不同的后端地址

**注意**：
- ⚠️ 后端地址会在浏览器中可见（通过开发者工具）
- ⚠️ 需要确保后端服务器允许跨域请求（CORS）
- ⚠️ 如果后端地址改变，需要重新构建前端

### 方案二：使用反向代理（隐藏后端地址）

如果需要隐藏后端地址，可以使用反向代理服务器（如 Nginx）。

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /path/to/timeflow/client/dist;
    index index.html;

    # API 请求代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件（图片）代理
    location /uploads {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端路由（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

使用反向代理时，前端构建**不要**设置 `VITE_API_BASE_URL`，让代码使用相对路径 `/api`。

**优点**：
- ✅ 隐藏后端地址
- ✅ 避免 CORS 问题
- ✅ 更好的安全性

**缺点**：
- ⚠️ 需要额外配置反向代理服务器

## 环境变量说明

### VITE_API_BASE_URL

- **开发环境**：用于配置 Vite 代理的目标地址（在 `vite.config.ts` 中）
- **生产环境**：
  - 如果设置了该变量，前端代码会直接使用该地址
  - 如果未设置，前端代码会使用相对路径 `/api`（需要配合反向代理）

## 注意事项

- 如果使用环境变量方案，确保后端服务器配置了正确的 CORS 设置
- 在生产环境中，建议使用 HTTPS
- 确保后端服务器的安全性，不要直接暴露敏感接口
