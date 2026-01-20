import prisma from '../config/database.js';
import userService from './user.service.js';

/**
 * 好友关系服务
 */
class FriendshipService {
  /**
   * 发送好友请求
   */
  async sendFriendRequest(userId, friendUsername) {
    // 验证不能加自己为好友
    if (userId === friendUsername) {
      throw new Error('不能添加自己为好友');
    }

    // 查找好友用户
    const friend = await userService.getUserByUsername(friendUsername);
    const friendId = friend.id.toString();

    if (userId === friendId) {
      throw new Error('不能添加自己为好友');
    }

    // 检查是否已存在好友关系
    const existingFriendship = await this.findFriendship(
      BigInt(userId),
      BigInt(friendId)
    );

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        throw new Error('你们已经是好友了');
      }
      if (existingFriendship.status === 'pending') {
        if (existingFriendship.userId.toString() === userId) {
          throw new Error('你已经发送过好友请求了');
        } else {
          throw new Error('对方已经向你发送了好友请求');
        }
      }
      if (existingFriendship.status === 'blocked') {
        throw new Error('无法添加此用户为好友');
      }
      // 如果之前被拒绝，更新状态为 pending 并重置请求时间
      if (existingFriendship.status === 'rejected') {
        const userIdBigInt = BigInt(userId);
        const friendIdBigInt = BigInt(friendId);
        const [smallerId, largerId] = 
          userIdBigInt < friendIdBigInt 
            ? [userIdBigInt, friendIdBigInt]
            : [friendIdBigInt, userIdBigInt];
        
        const friendship = await prisma.friendship.update({
          where: { id: existingFriendship.id },
          data: {
            userId: smallerId,
            friendId: largerId,
            status: 'pending',
            requestedAt: new Date()
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                color: true,
                avatarUrl: true
              }
            },
            friend: {
              select: {
                id: true,
                username: true,
                color: true,
                avatarUrl: true
              }
            }
          }
        });

        return friendship;
      }
    }

    // 创建好友请求（始终让较小的 user_id 作为 user_id）
    const userIdBigInt = BigInt(userId);
    const friendIdBigInt = BigInt(friendId);
    const [smallerId, largerId] = 
      userIdBigInt < friendIdBigInt 
        ? [userIdBigInt, friendIdBigInt]
        : [friendIdBigInt, userIdBigInt];

    const friendship = await prisma.friendship.create({
      data: {
        userId: smallerId,
        friendId: largerId,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        }
      }
    });

    return friendship;
  }

  /**
   * 查找好友关系（考虑双向性）
   */
  async findFriendship(userId, friendId) {
    const [smallerId, largerId] = 
      userId < friendId ? [userId, friendId] : [friendId, userId];

    const friendship = await prisma.friendship.findFirst({
      where: {
        userId: smallerId,
        friendId: largerId
      }
    });

    return friendship;
  }

  /**
   * 接受好友请求
   */
  async acceptFriendRequest(userId, friendshipId) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: BigInt(friendshipId) },
      include: {
        user: true,
        friend: true
      }
    });

    if (!friendship) {
      throw new Error('好友请求不存在');
    }

    // 验证请求是发给当前用户的
    const isCurrentUserFriend = 
      friendship.friendId.toString() === userId.toString() ||
      (friendship.userId.toString() === userId.toString() && 
       friendship.friendId.toString() !== userId.toString());

    // 更严格的验证：必须是接收方才能接受
    if (friendship.friendId.toString() !== userId.toString()) {
      throw new Error('无权接受此好友请求');
    }

    if (friendship.status !== 'pending') {
      throw new Error('好友请求状态无效');
    }

    // 更新状态为 accepted
    const updatedFriendship = await prisma.friendship.update({
      where: { id: BigInt(friendshipId) },
      data: { status: 'accepted' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        }
      }
    });

    return updatedFriendship;
  }

  /**
   * 获取当前用户的所有好友关系（包括所有状态）
   */
  async getUserFriends(userId) {
    const friendships = await prisma.friendship.findMany({
      where: {
            OR: [
              { userId: BigInt(userId) },
              { friendId: BigInt(userId) }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            color: true
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            color: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // 提取好友信息（排除当前用户自己），并包含状态和关系信息
    // 过滤规则：
    // 1. pending 状态且 friendId === userId（接收方收到的请求）不在此处返回，应通过 getPendingRequests 获取
    // 2. rejected 状态且 friendId === userId（接收方拒绝的请求）不返回，只有发起方能看到被拒绝的请求
    const friends = friendships
      .filter(friendship => {
        const isCurrentUserSender = friendship.userId.toString() === userId.toString();
        
        // 如果是 pending 状态且当前用户是接收方，不返回（应通过 getPendingRequests 获取）
        if (friendship.status === 'pending' && !isCurrentUserSender) {
          return false;
        }
        
        // 如果是 rejected 状态且当前用户是接收方，不返回（只有发起方能看到被拒绝的请求）
        if (friendship.status === 'rejected' && !isCurrentUserSender) {
          return false;
        }
        
        return true;
      })
      .map(friendship => {
        const isCurrentUserSender = friendship.userId.toString() === userId.toString();
        const friendInfo = isCurrentUserSender ? friendship.friend : friendship.user;
        
        return {
          ...friendInfo,
          friendship_id: friendship.id.toString(),
          status: friendship.status,
          is_sender: isCurrentUserSender,
          requested_at: friendship.requestedAt
        };
    });

    return friends;
  }

  /**
   * 获取当前用户收到的待处理好友请求（pending 状态，且当前用户是接收方）
   */
  async getPendingRequests(userId) {
    const friendships = await prisma.friendship.findMany({
      where: {
        friendId: BigInt(userId),
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            color: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    return friendships.map(friendship => ({
      id: friendship.id.toString(),
      user_id: friendship.userId.toString(),
      friend_id: friendship.friendId.toString(),
      status: friendship.status,
      requested_at: friendship.requestedAt,
      updated_at: friendship.updatedAt,
      user: {
        id: friendship.user.id.toString(),
        username: friendship.user.username,
        display_name: friendship.user.displayName,
        avatar_url: friendship.user.avatarUrl,
        color: friendship.user.color
      }
    }));
  }

  /**
   * 拒绝好友请求
   */
  async rejectFriendRequest(userId, friendshipId) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: BigInt(friendshipId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!friendship) {
      throw new Error('好友请求不存在');
    }

    // 验证请求是发给当前用户的
    if (friendship.friendId.toString() !== userId.toString()) {
      throw new Error('无权拒绝此好友请求');
    }

    if (friendship.status !== 'pending') {
      throw new Error('好友请求状态无效');
    }

    // 更新状态为 rejected
    const updatedFriendship = await prisma.friendship.update({
      where: { id: BigInt(friendshipId) },
      data: { status: 'rejected' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            color: true,
            avatarUrl: true
          }
        }
      }
    });

    return updatedFriendship;
  }

  /**
   * 验证两个用户是否为好友（accepted 状态）
   */
  async verifyFriendship(userId1, userId2) {
    const friendship = await this.findFriendship(
      BigInt(userId1),
      BigInt(userId2)
    );

    if (!friendship || friendship.status !== 'accepted') {
      return false;
    }

    return true;
  }

  /**
   * 删除好友关系
   */
  async deleteFriendship(userId, friendUsername) {
    // 查找好友用户
    const friend = await userService.getUserByUsername(friendUsername);
    const friendId = friend.id.toString();

    if (userId === friendId) {
      throw new Error('不能删除自己');
    }

    // 查找好友关系
    const friendship = await this.findFriendship(
      BigInt(userId),
      BigInt(friendId)
    );

    if (!friendship) {
      throw new Error('好友关系不存在');
    }

    // 验证当前用户是好友关系的一方
    if (friendship.userId.toString() !== userId && friendship.friendId.toString() !== userId) {
      throw new Error('无权删除此好友关系');
    }

    // 删除好友关系（支持所有状态）
    await prisma.friendship.delete({
      where: { id: friendship.id }
    });

    return true;
  }

  /**
   * 通过 friendshipId 删除好友关系
   */
  async deleteFriendshipById(userId, friendshipId) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: BigInt(friendshipId) }
    });

    if (!friendship) {
      throw new Error('好友关系不存在');
    }

    // 验证当前用户是好友关系的一方
    if (friendship.userId.toString() !== userId && friendship.friendId.toString() !== userId) {
      throw new Error('无权删除此好友关系');
    }

    // 删除好友关系
    await prisma.friendship.delete({
      where: { id: BigInt(friendshipId) }
    });

    return true;
  }
}

export default new FriendshipService();