import prisma from '../config/database.js';

/**
 * 事件服务
 */
class EventService {
  /**
   * 创建事件
   */
  async createEvent(userId, eventDate, title, content, imageUrl = null, eventType = 'record', mood = null) {
    // 验证必填字段
    if (!eventDate) {
      throw new Error('事件日期不能为空');
    }
    if (!title || title.trim().length === 0) {
      throw new Error('事件标题不能为空');
    }
    if (!content || content.trim().length === 0) {
      throw new Error('事件内容不能为空');
    }
    if (title.length > 120) {
      throw new Error('事件标题不能超过120个字符');
    }

    // 验证 eventType
    if (eventType && !['plan', 'record'].includes(eventType)) {
      throw new Error('事件类型无效，必须是 plan 或 record');
    }

    // 验证 mood
    if (mood && !['happy', 'calm', 'sad', 'excited', 'tired'].includes(mood)) {
      throw new Error('心情类型无效');
    }

    const event = await prisma.event.create({
      data: {
        userId: BigInt(userId),
        eventDate: new Date(eventDate),
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl || null,
        eventType: eventType || 'record',
        mood: mood || null
      }
    });

    return event;
  }

  /**
   * 获取用户的所有事件（按日期降序）
   */
  async getUserEvents(userId) {
    const events = await prisma.event.findMany({
      where: {
        userId: BigInt(userId)
      },
      orderBy: {
        eventDate: 'desc'
      }
    });

    return events;
  }

  /**
   * 获取单个事件
   */
  async getEventById(eventId) {
    const event = await prisma.event.findUnique({
      where: { id: BigInt(eventId) }
    });

    if (!event) {
      throw new Error('事件不存在');
    }

    return event;
  }

  /**
   * 验证事件所有权
   */
  async verifyEventOwnership(eventId, userId) {
    const event = await this.getEventById(eventId);
    if (event.userId.toString() !== userId.toString()) {
      throw new Error('无权访问此事件');
    }
    return event;
  }

  /**
   * 更新事件
   */
  async updateEvent(eventId, userId, data) {
    // 先验证所有权
    await this.verifyEventOwnership(eventId, userId);

    const updateData = {};

    if (data.eventDate !== undefined) {
      updateData.eventDate = new Date(data.eventDate);
    }
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('事件标题不能为空');
      }
      if (data.title.length > 120) {
        throw new Error('事件标题不能超过120个字符');
      }
      updateData.title = data.title.trim();
    }
    if (data.content !== undefined) {
      if (!data.content || data.content.trim().length === 0) {
        throw new Error('事件内容不能为空');
      }
      updateData.content = data.content.trim();
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl || null;
    }
    if (data.eventType !== undefined) {
      if (!['plan', 'record'].includes(data.eventType)) {
        throw new Error('事件类型无效，必须是 plan 或 record');
      }
      updateData.eventType = data.eventType;
    }
    if (data.mood !== undefined) {
      if (data.mood && !['happy', 'calm', 'sad', 'excited', 'tired'].includes(data.mood)) {
        throw new Error('心情类型无效');
      }
      updateData.mood = data.mood || null;
    }

    const event = await prisma.event.update({
      where: { id: BigInt(eventId) },
      data: updateData
    });

    return event;
  }

  /**
   * 删除事件
   */
  async deleteEvent(eventId, userId) {
    // 先验证所有权
    await this.verifyEventOwnership(eventId, userId);

    await prisma.event.delete({
      where: { id: BigInt(eventId) }
    });

    return true;
  }

  /**
   * 批量获取多个用户的事件（用于合并时间线）
   */
  async getMultipleUsersEvents(userIds) {
    const bigIntUserIds = userIds.map(id => BigInt(id));
    
    const events = await prisma.event.findMany({
      where: {
        userId: { in: bigIntUserIds }
      },
      orderBy: {
        eventDate: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        }
      }
    });

    return events;
  }
}

export default new EventService();