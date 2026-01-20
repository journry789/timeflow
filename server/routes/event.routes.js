import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware, handleUploadError } from '../middleware/uploadMiddleware.js';
import * as eventController from '../controllers/event.controller.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * POST /api/events
 * 创建事件（支持图片上传）
 * Content-Type: multipart/form-data
 * 字段：event_date, title, content, event_type, mood, image (文件)
 */
router.post('/', uploadMiddleware, handleUploadError, eventController.createEvent);

/**
 * GET /api/events
 * 获取当前用户的所有事件（按日期降序）
 */
router.get('/', eventController.getEvents);

/**
 * GET /api/events/:id
 * 获取单个事件
 */
router.get('/:id', eventController.getEventById);

/**
 * PUT /api/events/:id
 * 更新事件（支持图片更新）
 * Content-Type: multipart/form-data
 * 字段：event_date, title, content, event_type, mood, image (文件，可选)
 */
router.put('/:id', uploadMiddleware, handleUploadError, eventController.updateEvent);

/**
 * DELETE /api/events/:id
 * 删除事件（同时删除关联的图片）
 */
router.delete('/:id', eventController.deleteEvent);

export default router;