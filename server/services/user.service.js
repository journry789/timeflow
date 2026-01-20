import prisma from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * 用户服务
 */
class UserService {
  /**
   * 创建用户
   */
  async createUser(email, username, password) {
    // 验证 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('无效的邮箱格式');
    }

    // 验证 username 格式（支持中文、字母、数字、下划线，2-50个字符）
    // 使用 Unicode 范围匹配中文字符、英文字母、数字和下划线
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,50}$/;
    if (!usernameRegex.test(username)) {
      throw new Error('用户名可以包含中文、字母、数字和下划线，长度为2-50个字符');
    }

    // 验证密码长度
    if (!password || password.length < 6) {
      throw new Error('密码至少需要6个字符');
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      throw new Error('该邮箱已被注册');
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingUsername) {
      throw new Error('该用户名已被使用');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 生成随机颜色（排除白色和接近白色的灰色）
    const randomColor = this.generateRandomColor();

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        color: randomColor
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        color: true,
        createdAt: true
      }
    });

    return user;
  }

  /**
   * 生成随机颜色（排除白色和接近白色的灰色）
   * 使用 HSL 颜色空间，确保亮度不会太高
   */
  generateRandomColor() {
    // 生成随机 HSL 值
    // H (色相): 0-360
    // S (饱和度): 40-100% (确保颜色鲜艳)
    // L (亮度): 30-70% (排除太亮接近白色的颜色)
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 60) + 40; // 40-100%
    const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%
    
    // 转换为 RGB
    const hslToRgb = (h, s, l) => {
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      
      if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
      } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
      }
      
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      
      return { r, g, b };
    };
    
    const rgb = hslToRgb(hue, saturation, lightness);
    
    // 转换为十六进制
    const toHex = (n) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * 通过邮箱和密码验证用户
   */
  async validateUser(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('邮箱或密码错误');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('邮箱或密码错误');
    }

    // 返回用户信息（不含密码）
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      color: user.color,
      createdAt: user.createdAt
    };
  }

  /**
   * 通过 ID 获取用户
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        color: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  }

  /**
   * 通过用户名获取用户公开信息
   */
  async getUserByUsername(username) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        color: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  }

  /**
   * 搜索用户（通过用户名或邮箱）
   */
  async searchUsers(query, currentUserId) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchTerm);

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: BigInt(currentUserId) // 排除当前用户
        },
        ...(isEmail
          ? { email: { contains: searchTerm, mode: 'insensitive' } }
          : { username: { contains: searchTerm, mode: 'insensitive' } })
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        color: true,
        createdAt: true
      },
      take: 10 // 限制返回10个结果
    });

    return users;
  }

  /**
   * 更新当前用户信息
   */
  async updateUser(userId, data) {
    const updateData = {};
    
    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }
    if (data.color !== undefined) {
      // 验证颜色格式
      if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
        throw new Error('颜色格式无效，必须是 #RRGGBB 格式');
      }
      updateData.color = data.color;
    }

    const user = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        color: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }
}

export default new UserService();