import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// 获取当前文件的目录路径（ESM 方式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取上传目录路径
 */
export function getUploadsDir() {
  const uploadsDir = process.env.UPLOADS_DIR || './uploads';
  // 如果是相对路径，转换为绝对路径（相对于项目根目录，即 server 目录的父目录）
  return path.isAbsolute(uploadsDir) 
    ? uploadsDir 
    : path.resolve(__dirname, '../', uploadsDir);
}

/**
 * 确保上传目录存在
 */
async function ensureUploadsDir() {
  const uploadsDir = getUploadsDir();
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    // 目录不存在，创建它
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log(`✅ 上传目录已创建: ${uploadsDir}`);
  }
  
  // 确保 avatars 子目录存在
  const avatarsDir = path.join(uploadsDir, 'avatars');
  try {
    await fs.access(avatarsDir);
  } catch (error) {
    await fs.mkdir(avatarsDir, { recursive: true });
    console.log(`✅ 头像目录已创建: ${avatarsDir}`);
  }
  
  return uploadsDir;
}

/**
 * 配置 Multer storage
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadsDir = await ensureUploadsDir();
      // 如果是头像上传（字段名为 'avatar'），保存到 avatars 子目录
      if (file.fieldname === 'avatar') {
        const avatarsDir = path.join(uploadsDir, 'avatars');
        cb(null, avatarsDir);
      } else {
        // 其他文件保存到根目录
        cb(null, uploadsDir);
      }
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

/**
 * 文件过滤器：只允许图片
 */
const fileFilter = (req, file, cb) => {
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

/**
 * 创建 Multer 实例
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

/**
 * 初始化上传目录（应用启动时调用）
 */
export async function initUploadsDir() {
  await ensureUploadsDir();
}

/**
 * 导出 Multer 实例
 */
export default upload;