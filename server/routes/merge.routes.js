import express from 'express';
import { authenticate } from '../middleware/auth.js';
import friendshipService from '../services/friendship.service.js';
import userService from '../services/user.service.js';
import eventService from '../services/event.service.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * 构建完整的图片 URL
 */
function buildImageUrl(req, imagePath) {
  if (!imagePath) return null;
  // 如果已经是完整 URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // 构建完整 URL
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}${imagePath}`;
}

/**
 * GET /api/merge/:friendUsername
 * 合并时间线 - 获取自己和好友的事件列表
 */
router.get('/:friendUsername', async (req, res, next) => {
  try {
    const { friendUsername } = req.params;
    const userId = req.user.id;

    if (!friendUsername) {
      return res.status(400).json({
        success: false,
        message: '好友用户名不能为空',
        error: 'Friend username is required'
      });
    }

    // 获取好友信息
    const friend = await userService.getUserByUsername(friendUsername);

    // 验证是否为好友关系
    const isFriend = await friendshipService.verifyFriendship(
      userId,
      friend.id.toString()
    );

    if (!isFriend) {
      return res.status(403).json({
        success: false,
        message: '你们还不是好友关系',
        error: 'Not friends'
      });
    }

    // 获取两个用户的所有事件
    const myEvents = await eventService.getUserEvents(userId);
    const friendEvents = await eventService.getUserEvents(friend.id.toString());

    // 获取当前用户信息
    const me = await userService.getUserById(userId);

    res.json({
      success: true,
      data: {
        me: {
          username: me.username,
          color: me.color,
          avatar_url: me.avatarUrl,
          events: myEvents.map(event => ({
            id: event.id.toString(),
            event_date: event.eventDate,
            title: event.title,
            content: event.content,
            image_url: buildImageUrl(req, event.imageUrl),
            event_type: event.eventType,
            mood: event.mood,
            created_at: event.createdAt,
            updated_at: event.updatedAt
          }))
        },
        friend: {
          username: friend.username,
          color: friend.color,
          avatar_url: friend.avatarUrl,
          events: friendEvents.map(event => ({
            id: event.id.toString(),
            event_date: event.eventDate,
            title: event.title,
            content: event.content,
            image_url: buildImageUrl(req, event.imageUrl),
            event_type: event.eventType,
            mood: event.mood,
            created_at: event.createdAt,
            updated_at: event.updatedAt
          }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;