import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import userService from '../services/user.service.js';
import { getUploadsDir } from '../config/upload.js';

/**
 * 安全删除文件
 */
async function safeDeleteFile(filePath) {
  if (!filePath) return;
  
  try {
    // 处理不同的路径格式
    let fullPath = filePath;
    
    // 如果是相对路径（如 /uploads/avatars/xxx.jpg）
    if (filePath.startsWith('/uploads/')) {
      const filename = filePath.replace('/uploads/', '');
      fullPath = path.join(getUploadsDir(), filename);
    }
    // 如果是完整 URL
    else if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // 提取路径部分
      const url = new URL(filePath);
      const urlPath = url.pathname;
      if (urlPath.startsWith('/uploads/')) {
        const filename = urlPath.replace('/uploads/', '');
        fullPath = path.join(getUploadsDir(), filename);
      } else {
        console.log(`⚠️  无法解析 URL 路径: ${filePath}`);
        return;
      }
    }
    // 如果已经是绝对路径
    else if (path.isAbsolute(filePath)) {
      fullPath = filePath;
    }
    // 相对路径
    else {
      fullPath = path.join(getUploadsDir(), filePath);
    }
    
    // 检查文件是否存在
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    console.log(`✅ 已删除文件: ${fullPath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠️  文件不存在，跳过删除: ${filePath}`);
    } else {
      console.error(`❌ 删除文件失败: ${filePath}`, error);
    }
  }
}

/**
 * PUT /api/users/me
 * 更新当前用户信息
 */
export async function updateMe(req, res, next) {
  try {
    const userId = req.user.id;
    const { username, color, oldPassword, newPassword, confirmPassword } = req.body;
    const avatarFile = req.file; // Multer 处理后的文件

    // 获取当前用户信息
    const currentUser = await userService.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
        error: 'User not found'
      });
    }

    const updateData = {};
    let oldAvatarPath = null;

    // 1. 更新用户名
    if (username !== undefined && username !== null && username !== '') {
      // 验证用户名格式（支持中文、字母、数字、下划线，2-50个字符）
      const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,50}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          message: '用户名可以包含中文、字母、数字和下划线，长度为2-50个字符',
          error: 'Invalid username format'
        });
      }

      // 检查用户名是否已被其他用户使用
      if (username !== currentUser.username) {
        const existingUser = await prisma.user.findUnique({
          where: { username }
        });
        if (existingUser && existingUser.id.toString() !== userId.toString()) {
          return res.status(400).json({
            success: false,
            message: '该用户名已被使用',
            error: 'Username already taken'
          });
        }
        updateData.username = username;
      }
    }

    // 2. 更新颜色
    if (color !== undefined && color !== null && color !== '') {
      // 验证颜色格式（HEX）
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return res.status(400).json({
          success: false,
          message: '颜色格式无效，必须是 #RRGGBB 格式',
          error: 'Invalid color format'
        });
      }
      updateData.color = color;
    }

    // 3. 更新密码
    if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
      // 验证密码长度
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: '新密码至少需要8个字符',
          error: 'Password too short'
        });
      }

      // 验证确认密码
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '新密码和确认密码不匹配',
          error: 'Passwords do not match'
        });
      }

      // 验证旧密码
      if (!oldPassword) {
        return res.status(400).json({
          success: false,
          message: '修改密码需要提供旧密码',
          error: 'Old password required'
        });
      }

      // 验证旧密码是否正确
      const isPasswordValid = await bcrypt.compare(oldPassword, currentUser.passwordHash);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '旧密码错误',
          error: 'Invalid old password'
        });
      }

      // 哈希新密码
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // 4. 更新头像
    if (avatarFile) {
      // 保存旧头像路径（用于后续删除）
      oldAvatarPath = currentUser.avatarUrl;

      // 构建新的头像路径（相对于 /uploads）
      const avatarRelativePath = `/uploads/avatars/${avatarFile.filename}`;
      updateData.avatarUrl = avatarRelativePath;
    }

    // 如果没有要更新的字段，返回错误
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段',
        error: 'No fields to update'
      });
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
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

    // 如果更新了头像，删除旧头像文件
    if (avatarFile && oldAvatarPath) {
      await safeDeleteFile(oldAvatarPath);
    }

    // 返回更新后的用户信息
    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        username: updatedUser.username,
        display_name: updatedUser.displayName,
        avatar_url: updatedUser.avatarUrl,
        color: updatedUser.color,
        created_at: updatedUser.createdAt,
        updated_at: updatedUser.updatedAt
      }
    });
  } catch (error) {
    // 如果上传了新头像但更新失败，删除已上传的文件
    if (req.file) {
      try {
        const filePath = path.join(getUploadsDir(), 'avatars', req.file.filename);
        await fs.unlink(filePath);
      } catch (deleteError) {
        console.error('删除上传失败的文件时出错:', deleteError);
      }
    }
    next(error);
  }
}
