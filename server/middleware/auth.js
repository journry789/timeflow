import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

/**
 * JWT 认证中间件
 * 验证请求头中的 Authorization token
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
        error: 'Authorization header missing or invalid'
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 验证用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          color: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在',
          error: 'User not found'
        });
      }

      // 将用户信息附加到请求对象
      req.user = {
        ...user,
        id: user.id.toString() // 转换为字符串便于使用
      };
      
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: '令牌已过期',
          error: 'Token expired'
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: '无效的令牌',
          error: 'Invalid token'
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '认证验证失败',
      error: error.message
    });
  }
};

/**
 * 生成 JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};