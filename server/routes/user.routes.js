import express from 'express';
import { authenticate } from '../middleware/auth.js';
import userService from '../services/user.service.js';
import { updateMe } from '../controllers/user.controller.js';
import { uploadAvatarMiddleware, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * GET /api/users/me
 * 获取当前用户信息（需认证）
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);

    res.json({
      success: true,
      data: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        color: user.color,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/search?q=query
 * 搜索用户（通过用户名或邮箱，需认证）
 */
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词至少需要2个字符',
        error: 'Search query must be at least 2 characters'
      });
    }

    const users = await userService.searchUsers(q.trim(), req.user.id);

    res.json({
      success: true,
      data: users.map(user => ({
        id: user.id.toString(),
        username: user.username,
        display_name: user.displayName,
        avatar_url: user.avatarUrl,
        color: user.color,
        created_at: user.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/me
 * 更新当前用户信息（需认证，支持 multipart/form-data）
 * 支持更新：username, color, avatar, password
 */
router.put('/me', authenticate, uploadAvatarMiddleware, handleUploadError, updateMe);

/**
 * GET /api/users/:username
 * 获取指定用户的公开信息（公开接口）
 */
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '用户名不能为空',
        error: 'Username is required'
      });
    }

    const user = await userService.getUserByUsername(username);

    res.json({
      success: true,
      data: {
        id: user.id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        color: user.color,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;