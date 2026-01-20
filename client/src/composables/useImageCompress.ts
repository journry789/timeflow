/**
 * 图片压缩工具函数
 */

export interface CompressOptions {
  /** 最大宽度（像素），默认 1920 */
  maxWidth?: number
  /** 最大高度（像素），默认 1920 */
  maxHeight?: number
  /** 压缩质量（0-1），默认 0.8 */
  quality?: number
  /** 输出格式，默认 'image/jpeg' */
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'
  /** 最大文件大小（字节），如果压缩后仍超过此大小，会进一步降低质量 */
  maxSize?: number
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns Promise<File> 压缩后的文件
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    outputFormat = 'image/jpeg',
    maxSize
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // 计算新尺寸（保持宽高比）
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // 创建 canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        // 绘制图片
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // 压缩函数（递归降低质量直到满足大小要求）
        const compress = (currentQuality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'))
                return
              }

              // 如果设置了最大文件大小且当前文件超过限制，降低质量重试
              if (maxSize && blob.size > maxSize && currentQuality > 0.1) {
                compress(Math.max(0.1, currentQuality - 0.1))
                return
              }

              // 创建压缩后的文件
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '') + 
                  (outputFormat === 'image/jpeg' ? '.jpg' : 
                   outputFormat === 'image/png' ? '.png' : '.webp'),
                {
                  type: outputFormat,
                  lastModified: Date.now()
                }
              )

              resolve(compressedFile)
            },
            outputFormat,
            currentQuality
          )
        }

        compress(quality)
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * 检查文件是否需要压缩
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节），默认 1MB
 * @returns boolean 是否需要压缩
 */
export function shouldCompress(file: File, maxSize: number = 1024 * 1024): boolean {
  return file.size > maxSize
}
