import multer from 'multer';
import upload, { getUploadsDir } from '../config/upload.js';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 图片上传中间件（事件图片）
 * 处理 multipart/form-data 请求中的 'image' 字段
 * 
 * 使用方法：
 * router.post('/', uploadMiddleware, handleUploadError, async (req, res) => {
 *   // req.file 包含上传的文件信息（如果有）
 *   // req.body 包含其他表单字段
 * })
 */
export const uploadMiddleware = upload.single('image');

/**
 * 头像上传中间件
 * 处理 multipart/form-data 请求中的 'avatar' 字段
 * 限制文件大小为 2MB
 */
const avatarStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadsDir = getUploadsDir();
      const avatarsDir = path.join(uploadsDir, 'avatars');
      // 确保目录存在
      await fs.mkdir(avatarsDir, { recursive: true });
      cb(null, avatarsDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机字符串 + 原始扩展名
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${timestamp}-${randomStr}${ext}`;
    cb(null, filename);
  }
});

const avatarFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}。只允许: JPEG, PNG, GIF, WebP`), false);
  }
};

export const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  }
}).single('avatar');

/**
 * 上传错误处理中间件
 * 捕获 Multer 错误并提供友好的错误信息
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxSize = req.file?.fieldname === 'avatar' ? '2MB' : '5MB';
      return res.status(400).json({
        success: false,
        message: `文件大小超过限制，最大允许 ${maxSize}`,
        error: 'File too large'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      const fieldName = req.file?.fieldname === 'avatar' ? 'avatar' : 'image';
      return res.status(400).json({
        success: false,
        message: `上传字段名错误，请使用 "${fieldName}" 字段`,
        error: 'Unexpected field'
      });
    }
    return res.status(400).json({
      success: false,
      message: `上传失败: ${err.message}`,
      error: err.code
    });
  }

  if (err) {
    // 文件类型错误或其他错误
    return res.status(400).json({
      success: false,
      message: err.message || '文件上传失败',
      error: 'Upload error'
    });
  }

  next();
};