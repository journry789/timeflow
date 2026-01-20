import express from 'express';
import { authenticate } from '../middleware/auth.js';
import friendshipService from '../services/friendship.service.js';
import prisma from '../config/database.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * POST /api/friends/request
 * 发送好友请求
 */
router.post('/request', async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '用户名不能为空',
        error: 'Username is required'
      });
    }

    const friendship = await friendshipService.sendFriendRequest(userId, username);

    // 确定返回的好友信息
    const friend = 
      friendship.userId.toString() === userId 
        ? friendship.friend 
        : friendship.user;

    res.status(201).json({
      success: true,
      data: {
        id: friendship.id.toString(),
        user_id: friendship.userId.toString(),
        friend_id: friendship.friendId.toString(),
        status: friendship.status,
        requested_at: friendship.requestedAt,
        friend: {
          id: friend.id.toString(),
          username: friend.username,
          color: friend.color,
          avatar_url: friend.avatarUrl
        }
      },
      message: '好友请求已发送'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/friends/accept
 * 接受好友请求
 */
router.post('/accept', async (req, res, next) => {
  try {
    const { friendshipId } = req.body;
    const userId = req.user.id;

    if (!friendshipId) {
      return res.status(400).json({
        success: false,
        message: '好友请求ID不能为空',
        error: 'Friendship ID is required'
      });
    }

    const friendship = await friendshipService.acceptFriendRequest(userId, friendshipId);

    // 确定返回的好友信息
    const friend = 
      friendship.friendId.toString() === userId 
        ? friendship.user 
        : friendship.friend;

    res.json({
      success: true,
      data: {
        id: friendship.id.toString(),
        user_id: friendship.userId.toString(),
        friend_id: friendship.friendId.toString(),
        status: friendship.status,
        requested_at: friendship.requestedAt,
        updated_at: friendship.updatedAt,
        friend: {
          id: friend.id.toString(),
          username: friend.username,
          color: friend.color,
          avatar_url: friend.avatarUrl
        }
      },
      message: '好友请求已接受'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/friends
 * 获取当前用户的所有好友关系（包括所有状态）
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friends = await friendshipService.getUserFriends(userId);

    res.json({
      success: true,
      data: friends.map(friend => ({
        id: friend.id.toString(),
        username: friend.username,
        display_name: friend.displayName,
        avatar_url: friend.avatarUrl,
        color: friend.color,
        friendship_id: friend.friendship_id,
        status: friend.status,
        is_sender: friend.is_sender,
        requested_at: friend.requested_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/friends/requests
 * 获取当前用户收到的待处理好友请求
 */
router.get('/requests', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requests = await friendshipService.getPendingRequests(userId);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/friends/reject
 * 拒绝好友请求
 */
router.post('/reject', async (req, res, next) => {
  try {
    const { friendshipId } = req.body;
    const userId = req.user.id;

    if (!friendshipId) {
      return res.status(400).json({
        success: false,
        message: '好友请求ID不能为空',
        error: 'Friendship ID is required'
      });
    }

    const friendship = await friendshipService.rejectFriendRequest(userId, friendshipId);

    res.json({
      success: true,
      message: '好友请求已拒绝'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/friends/request/:friendshipId
 * 删除好友请求（通过 friendshipId）
 */
router.delete('/request/:friendshipId', async (req, res, next) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    if (!friendshipId) {
      return res.status(400).json({
        success: false,
        message: '好友请求ID不能为空',
        error: 'Friendship ID is required'
      });
    }

    await friendshipService.deleteFriendshipById(userId, friendshipId);

    res.json({
      success: true,
      message: '请求已删除'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/friends/:username
 * 删除好友关系
 */
router.delete('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '用户名不能为空',
        error: 'Username is required'
      });
    }

    await friendshipService.deleteFriendship(userId, username);

    res.json({
      success: true,
      message: '好友已删除'
    });
  } catch (error) {
    next(error);
  }
});

export default router;