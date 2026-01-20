import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/database.js';

// 加载环境变量
dotenv.config();

const PORT = process.env.PORT || 3000;

// 验证必需的环境变量
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:', missingEnvVars.join(', '));
  console.error('请检查 .env 文件配置');
  process.exit(1);
}

// 测试数据库连接
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testDatabaseConnection();

    // 启动 HTTP 服务器
    app.listen(PORT, () => {
      console.log(`
🚀 服务器启动成功！
📍 端口: ${PORT}
🌍 环境: ${process.env.NODE_ENV || 'development'}
🔗 地址: http://localhost:${PORT}
📚 API 文档: http://localhost:${PORT}/health
      `);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM 信号接收，正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT 信号接收，正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 启动应用
startServer();