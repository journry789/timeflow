## Timeflow Vue 测试服务器

用于在本地或内网以 Node/Express 方式承载已构建的 Vue 前端产物。

### 前置要求
- 在 `client` 目录执行：`npm install && npm run build`
- 构建产物会生成在 `client/dist`

### 使用步骤
1) 安装依赖  
   `cd client/vue-test-server && npm install`

2) 启动服务器  
   `npm start`  
   默认监听 `0.0.0.0:4173`，可通过环境变量覆盖：
   - `PORT`：监听端口
   - `HOST`：监听地址

3) 访问  
   浏览器打开 `http://localhost:4173`（或你设置的 HOST/PORT）。

### 说明
- 使用 `compression` 启用 gzip，静态文件缓存 1 天，`index.html` 不缓存。
- 未命中静态资源时回退到 `index.html`，适配前端路由。
- 所有文件均位于 `client/vue-test-server` 目录，方便与主应用隔离。
