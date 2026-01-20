import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initUploadsDir, getUploadsDir } from './config/upload.js';

// 导入路由
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import eventRoutes from './routes/event.routes.js';
import friendRoutes from './routes/friend.routes.js';
import mergeRoutes from './routes/merge.routes.js';

// 加载环境变量
dotenv.config();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化上传目录（应用启动时）
initUploadsDir().catch(err => {
  console.error('❌ 初始化上传目录失败:', err);
});

// 静态文件服务：暴露上传目录
const uploadsDir = getUploadsDir();
app.use('/uploads', express.static(uploadsDir));
console.log(`📁 静态文件服务已启动: /uploads -> ${uploadsDir}`);

// 请求日志中间件（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API 运行正常',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/merge', mergeRoutes);

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

export default app;