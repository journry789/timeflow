import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import eventService from '../services/event.service.js';
import { getUploadsDir } from '../config/upload.js';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 构建完整的图片 URL
 */
function buildImageUrl(req, imagePath) {
  if (!imagePath) return null;
  // 如果已经是完整 URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // 构建完整 URL，兼容端口号
  const protocol = req.protocol;
  // req.get('host') 已包含端口（如果有），但个别代理可能去掉端口，这里补偿一次
  const rawHost = req.get('host') || '';
  const [hostnameFromHost, portFromHost] = rawHost.split(':');
  const hostname = hostnameFromHost || req.hostname || '';
  // 如果 host 里有端口直接用；否则尝试从 socket/local 获取
  const port =
    portFromHost ||
    (req.socket && req.socket.localPort) ||
    (req.connection && req.connection.localPort) ||
    '';

  const hostWithPort = port && !hostname.includes(':') ? `${hostname}:${port}` : hostname || rawHost;
  return `${protocol}://${hostWithPort}${imagePath}`;
}

/**
 * 删除文件（安全删除，忽略不存在的文件错误）
 * @param {string} filePath - 文件路径（可能是绝对路径、相对路径如 /uploads/xxx.jpg、完整URL，或直接是文件名）
 */
async function safeDeleteFile(filePath) {
  if (!filePath) {
    console.log('⚠️ 删除文件：路径为空，跳过');
    return;
  }
  
  try {
    let absolutePath;
    
    // 如果是完整 URL（如 http://localhost:3000/uploads/xxx.jpg），提取路径部分
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      try {
        const url = new URL(filePath);
        filePath = url.pathname; // 提取路径部分，如 /uploads/xxx.jpg
        console.log(`   🔄 从完整URL提取路径: ${filePath}`);
      } catch (urlError) {
        console.error(`   ❌ URL解析失败: ${filePath}`, urlError.message);
        throw new Error(`无效的URL格式: ${filePath}`);
      }
    }
    
   
      // 相对路径（如 /uploads/xxx.jpg），提取文件名
      const filename = filePath.replace(/^\/uploads\//, '');
      //相对路径+上传目录=绝对路径
      absolutePath = path.join(getUploadsDir(), filename);

    console.log(`🗑️ 尝试删除文件:`);
    console.log(`   原始路径: ${filePath}`);
    console.log(`   绝对路径: ${absolutePath}`);
    console.log(`   上传目录: ${getUploadsDir()}`);
    
    // 检查文件是否存在
    try {
      await fs.access(absolutePath);
      console.log(`   ✅ 文件存在，准备删除`);
    } catch (accessError) {
      if (accessError.code === 'ENOENT') {
        console.log(`   ⚠️ 文件不存在: ${absolutePath}`);
        return; // 文件不存在，不需要删除
      }
      throw accessError;
    }
    
    // 删除文件
    await fs.unlink(absolutePath);
    console.log(`   ✅ 成功删除文件: ${absolutePath}`);
  } catch (error) {
    // 文件不存在或其他错误
    if (error.code === 'ENOENT') {
      console.log(`   ⚠️ 文件不存在（ENOENT）: ${filePath}`);
    } else {
      console.error(`   ❌ 删除文件失败: ${filePath}`);
      console.error(`   错误代码: ${error.code}`);
      console.error(`   错误信息: ${error.message}`);
      console.error(`   错误堆栈: ${error.stack}`);
      // 重新抛出错误，让调用者知道删除失败
      throw error;
    }
  }
}

/**
 * POST /api/events - 创建事件
 */
export async function createEvent(req, res, next) {
  let uploadedFilePath = null;

  try {
    const { event_date, title, content, event_type, mood } = req.body;
    const userId = req.user.id;

    // 验证必填字段
    if (!event_date || !title || !content) {
      // 如果已经上传了文件，删除它
      if (req.file) {
        await safeDeleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: '事件日期、标题和内容不能为空',
        error: 'Missing required fields'
      });
    }

    // 处理上传的图片
    let imageUrl = null;
    if (req.file) {
      // 生成相对路径（用于数据库存储）
      const relativePath = `/uploads/${req.file.filename}`;
      imageUrl = relativePath;
      uploadedFilePath = req.file.path; // 保存文件路径，用于错误回滚
    }

    // 创建事件
    const event = await eventService.createEvent(
      userId,
      event_date,
      title,
      content,
      imageUrl,
      event_type || 'record',
      mood || null
    );

    // 构建完整的图片 URL
    const fullImageUrl = buildImageUrl(req, imageUrl);

    res.status(201).json({
      success: true,
      data: {
        id: event.id.toString(),
        user_id: event.userId.toString(),
        event_date: event.eventDate,
        title: event.title,
        content: event.content,
        image_url: fullImageUrl,
        event_type: event.eventType,
        mood: event.mood,
        created_at: event.createdAt,
        updated_at: event.updatedAt
      },
      message: '事件创建成功'
    });
  } catch (error) {
    // 错误回滚：如果创建事件失败但文件已上传，删除文件
    if (uploadedFilePath) {
      await safeDeleteFile(uploadedFilePath);
    }
    next(error);
  }
}

/**
 * PUT /api/events/:id - 更新事件
 */
export async function updateEvent(req, res, next) {
  let uploadedFilePath = null;
  let oldImagePath = null;

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { event_date, title, content, event_type, mood, remove_image } = req.body;

    // 获取现有事件（用于获取旧图片路径）
    const existingEvent = await eventService.getEventById(id);
    
    // 验证所有权
    await eventService.verifyEventOwnership(id, userId);
    
    // 保存旧图片路径
    if (existingEvent.imageUrl) {
      oldImagePath = existingEvent.imageUrl;
    }

    // 处理图片：新上传 > 删除 > 保持原图
    let imageUrl = existingEvent.imageUrl; // 默认保持原图片
    if (req.file) {
      // 有新文件上传，使用新图片
      const relativePath = `/uploads/${req.file.filename}`;
      imageUrl = relativePath;
      uploadedFilePath = req.file.path;
    } else if (remove_image === 'true' || remove_image === true) {
      // 前端明确要求删除图片
      imageUrl = null;
    }

    // 更新事件
    const event = await eventService.updateEvent(id, userId, {
      event_date,
      title,
      content,
      imageUrl: imageUrl, // 如果上传了新图，使用新图；否则保持原值
      eventType: event_type,
      mood
    });

    // 如果上传了新图片，删除旧图片
    if (req.file && oldImagePath) {
      await safeDeleteFile(oldImagePath);
    }
    
    // 如果要求删除图片，删除旧图片文件
    if ((remove_image === 'true' || remove_image === true) && oldImagePath) {
      await safeDeleteFile(oldImagePath);
    }

    // 构建完整的图片 URL
    const fullImageUrl = buildImageUrl(req, event.imageUrl);

    res.json({
      success: true,
      data: {
        id: event.id.toString(),
        user_id: event.userId.toString(),
        event_date: event.eventDate,
        title: event.title,
        content: event.content,
        image_url: fullImageUrl,
        event_type: event.eventType,
        mood: event.mood,
        created_at: event.createdAt,
        updated_at: event.updatedAt
      },
      message: '事件更新成功'
    });
  } catch (error) {
    // 错误回滚：如果更新失败但新文件已上传，删除新文件
    if (uploadedFilePath) {
      await safeDeleteFile(uploadedFilePath);
    }
    next(error);
  }
}

/**
 * DELETE /api/events/:id - 删除事件（同时删除关联的图片）
 */
export async function deleteEvent(req, res, next) {
  let imagePathToDelete = null;

  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 获取事件信息（包括图片路径）
    const event = await eventService.getEventById(id);
    
    // 验证所有权
    await eventService.verifyEventOwnership(id, userId);

    // 保存图片路径（用于删除文件）
    if (event.imageUrl) {
      imagePathToDelete = event.imageUrl;
    }

    // 删除数据库中的事件
    await eventService.deleteEvent(id, userId);

    // 删除关联的图片文件（即使失败也不影响响应，但会记录日志）
    if (imagePathToDelete) {
      console.log(`📋 准备删除事件图片（事件ID: ${id}）`);
      console.log(`   图片路径: ${imagePathToDelete}`);
      try {
        await safeDeleteFile(imagePathToDelete);
        console.log(`✅ 事件图片删除成功（事件ID: ${id}）`);
      } catch (fileError) {
        // 文件删除失败不影响整体操作，只记录警告
        console.error(`❌ 删除事件图片文件失败（事件ID: ${id}）`);
        console.error(`   错误: ${fileError.message}`);
        console.error(`   路径: ${imagePathToDelete}`);
      }
    } else {
      console.log(`ℹ️ 事件无图片文件，跳过删除（事件ID: ${id}）`);
    }

    res.json({
      success: true,
      message: '事件删除成功'
    });
  } catch (error) {
    // 如果数据库删除失败，仍然尝试删除已保存的文件路径（如果之前获取到了）
    // 这确保了即使操作失败，也不会有孤立文件
    if (imagePathToDelete) {
      try {
        await safeDeleteFile(imagePathToDelete);
      } catch (fileError) {
        // 忽略文件删除错误
      }
    }
    next(error);
  }
}

/**
 * GET /api/events - 获取当前用户的所有事件
 */
export async function getEvents(req, res, next) {
  try {
    const userId = req.user.id;
    const events = await eventService.getUserEvents(userId);

    res.json({
      success: true,
      data: events.map(event => ({
        id: event.id.toString(),
        user_id: event.userId.toString(),
        event_date: event.eventDate,
        title: event.title,
        content: event.content,
        image_url: buildImageUrl(req, event.imageUrl),
        event_type: event.eventType,
        mood: event.mood,
        created_at: event.createdAt,
        updated_at: event.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/events/:id - 获取单个事件
 */
export async function getEventById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 验证事件存在且属于当前用户
    await eventService.verifyEventOwnership(id, userId);
    const event = await eventService.getEventById(id);

    res.json({
      success: true,
      data: {
        id: event.id.toString(),
        user_id: event.userId.toString(),
        event_date: event.eventDate,
        title: event.title,
        content: event.content,
        image_url: buildImageUrl(req, event.imageUrl),
        event_type: event.eventType,
        mood: event.mood,
        created_at: event.createdAt,
        updated_at: event.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}