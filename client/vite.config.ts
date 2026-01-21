import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  // 从环境变量获取 API 基础 URL，默认为 http://localhost:3000
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  // 检测是否为 Electron 构建
  const isElectron = process.env.ELECTRON_BUILD === 'true'
  
  return {
    // Electron 应用需要使用相对路径
    base: isElectron ? './' : '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      proxy: {
        // API 请求代理
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true
        },
        // 静态文件（图片）代理，避免暴露真实后端地址
        '/uploads': {
          target: apiBaseUrl,
          changeOrigin: true
        }
      }
    }
  }
})