/**
 * 全局错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // Prisma 错误处理
  if (err.code === 'P2002') {
    // 唯一约束冲突
    const field = err.meta?.target?.[0] || '字段';
    return res.status(409).json({
      success: false,
      message: `${field} 已存在`,
      error: 'Unique constraint violation'
    });
  }

  if (err.code === 'P2025') {
    // 记录未找到
    return res.status(404).json({
      success: false,
      message: '资源不存在',
      error: 'Record not found'
    });
  }

  if (err.code === 'P2003') {
    // 外键约束失败
    return res.status(400).json({
      success: false,
      message: '关联资源不存在',
      error: 'Foreign key constraint failed'
    });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message || '输入验证失败',
      error: 'Validation error'
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌',
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '认证令牌已过期',
      error: 'Token expired'
    });
  }

  // 默认错误响应
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器错误' : message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * 404 处理中间件
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `路径 ${req.originalUrl} 不存在`,
    error: 'Route not found'
  });
};