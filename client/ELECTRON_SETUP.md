# Electron 桌面应用配置说明

本文档说明如何使用 Electron 将 TimeFlow 构建为桌面应用程序。

## 快速开始

### 1. 安装 Electron 依赖

```bash
cd electron
npm install
```

或者在主目录下：

```bash
npm run electron:install
```

### 2. 开发模式

**方式一：分步启动**

1. 启动前端开发服务器（在 `client` 目录）：
```bash
npm run dev
```

2. 启动 Electron（在 `client/electron` 目录）：
```bash
cd electron
npm run dev
```

**方式二：一键启动**（推荐）

在主目录下运行：
```bash
npm run electron:dev
```

这会同时启动 Vite 开发服务器和 Electron 窗口。

### 3. 构建桌面应用

#### 构建前端
首先需要构建前端应用：
```bash
npm run build
```

#### 构建 Electron 应用

**构建所有平台：**
```bash
npm run electron:build
```

**构建特定平台：**

Windows:
```bash
npm run electron:build:win
```

macOS:
```bash
npm run electron:build:mac
```

Linux:
```bash
npm run electron:build:linux
```

构建产物会输出到 `electron/dist-electron/` 目录。

## 目录结构

```
client/
├── electron/              # Electron 配置文件（独立目录）
│   ├── main.js           # 主进程文件
│   ├── preload.js        # 预加载脚本
│   ├── package.json      # Electron 依赖和配置
│   ├── README.md         # Electron 详细文档
│   ├── .gitignore        # Electron 构建产物忽略
│   └── assets/           # 应用图标（可选）
├── src/                  # 前端源码（不受影响）
├── dist/                 # 前端构建产物
├── package.json          # 主项目配置（已添加 Electron 脚本）
└── vite.config.ts        # Vite 配置（不受影响）
```

## 配置说明

### Electron 配置位置

所有 Electron 相关配置都在 `electron/` 目录下，**完全独立**，不会影响现有的 Web 应用功能：

- ✅ Web 应用功能完全不受影响
- ✅ 可以独立开发和构建
- ✅ 使用自己的依赖和配置

### 主进程配置 (main.js)

- 窗口大小和配置
- 开发/生产环境切换
- 安全策略
- IPC 通信

### 预加载脚本 (preload.js)

- 安全地暴露 Electron API 到渲染进程
- 桥接 Vue 应用和 Electron 功能

## API 配置

Electron 应用使用与 Web 应用相同的 API 配置机制：

- 开发环境：使用 Vite 代理（`/api` → 后端服务器）
- 生产环境：使用环境变量 `VITE_API_BASE_URL` 或相对路径

## 应用图标

如果需要自定义应用图标，请在 `electron/assets/` 目录下放置：

- `icon.ico` - Windows 图标（256x256）
- `icon.icns` - macOS 图标
- `icon.png` - Linux 图标（512x512）

## 常见问题

### 1. 开发模式下无法连接

确保前端开发服务器在 `http://localhost:5173` 运行。

### 2. 构建后无法加载

检查 `dist` 目录是否存在且包含构建后的文件。

### 3. 图标不显示

确保图标文件存在于 `electron/assets/` 目录。

## 与 Web 应用的关系

- **完全独立**：Electron 配置不影响 Web 应用
- **共享代码**：使用相同的前端源码
- **独立构建**：可以单独构建 Electron 应用
- **独立部署**：Web 应用和桌面应用可以独立部署

## 更多信息

详细的 Electron 配置说明请参考：`electron/README.md`
