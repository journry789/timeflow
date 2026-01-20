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
  
  // 如果已经是完整的 URL（http:// 或 https://），直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // 如果是相对路径，添加服务器地址
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  // 确保路径以 / 开头
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${apiUrl}${path}`
}

/**
 * 获取头像 URL（别名，与 getImageUrl 功能相同）
 */
export function getAvatarUrl(avatarPath?: string | null): string {
  return getImageUrl(avatarPath)
}
