import express from 'express';
import userService from '../services/user.service.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // 验证必填字段
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱、用户名和密码不能为空',
        error: 'Missing required fields'
      });
    }

    // 创建用户
    const user = await userService.createUser(email, username, password);

    // 生成 token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          color: user.color
        },
        token
      },
      message: '注册成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空',
        error: 'Missing required fields'
      });
    }

    // 验证用户
    const user = await userService.validateUser(email, password);

    // 生成 token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          color: user.color
        },
        token
      },
      message: '登录成功'
    });
  } catch (error) {
    next(error);
  }
});

export default router;