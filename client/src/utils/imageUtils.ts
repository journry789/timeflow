/**
 * 图片 URL 工具函数
 */

/**
 * 获取完整的图片 URL
 * 如果是相对路径，会自动添加服务器地址
 * @param imagePath 图片路径（可以是相对路径或完整 URL）
 * @returns 完整的图片 URL
 */
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return ''
  
  // 如果已经是完整的 URL（http:// 或 https://）
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // 检查当前页面是否有端口号，如果 URL 缺少端口号，则补上
    if (typeof window !== 'undefined' && window.location.port) {
      try {
        const url = new URL(imagePath)
        // 如果 URL 没有端口号，但当前页面有端口号，且域名匹配，则添加端口号
        if (!url.port && url.hostname === window.location.hostname) {
          url.port = window.location.port
          return url.toString()
        }
      } catch (e) {
        // URL 解析失败，返回原值
      }
    }
    return imagePath
  }
  
  // 图片路径处理
  // 开发环境：使用相对路径，通过 Vite 代理转发
  // 生产环境：如果设置了 VITE_API_BASE_URL，则拼接完整 URL；否则使用当前页面的 origin（包含端口号）
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  if (import.meta.env.DEV) {
    // 开发环境：使用相对路径
    return path
  } else {
    // 生产环境：如果设置了环境变量，拼接完整 URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    if (apiBaseUrl) {
      // 确保 URL 拼接正确：移除 apiBaseUrl 末尾的斜杠，确保 path 以斜杠开头
      const baseUrl = apiBaseUrl.replace(/\/+$/, '') // 移除末尾的斜杠
      return `${baseUrl}${path}`
    }
    
    // 未设置环境变量：使用当前页面的 origin（包含协议、域名和端口号）
    // 这样可以确保相对路径包含端口号
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`
    }
    
    // 如果 window 不存在（SSR 环境），回退到相对路径
    return path
  }
}

/**
 * 获取头像 URL（别名，与 getImageUrl 功能相同）
 */
export function getAvatarUrl(avatarPath?: string | null): string {
  return getImageUrl(avatarPath)
}
