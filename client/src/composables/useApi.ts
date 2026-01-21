import axios, { AxiosInstance, AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const toast = useToast()

/**
 * 创建 axios 实例
 */
function createAxiosInstance(): AxiosInstance {
  // API 基础 URL 配置
  // 开发环境：使用 Vite 代理，通过相对路径 /api
  // 生产环境：直接使用环境变量 VITE_API_BASE_URL 配置的后端地址
  // 如果未设置环境变量，开发环境使用相对路径 /api，生产环境需要设置环境变量
  let baseURL: string
  
  if (import.meta.env.DEV) {
    // 开发环境：使用相对路径，通过 Vite 代理转发
    baseURL = '/api'
  } else {
    // 生产环境：使用环境变量配置的后端地址
    // 注意：如果没有设置环境变量，会回退到相对路径（需要配合反向代理）
    baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  }
  
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 请求拦截器：自动添加 token
  instance.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器：统一处理错误
  instance.interceptors.response.use(
    (response) => {
      const data = response.data as ApiResponse
      
      // 如果后端返回 success: false，当作错误处理
      if (data.success === false) {
        const message = data.message || data.error || '请求失败'
        toast.error(message)
        return Promise.reject(new Error(message))
      }
      
      return response
    },
    (error: AxiosError<ApiResponse>) => {
      const authStore = useAuthStore()
      
      // 处理 HTTP 错误
      if (error.response) {
        const { status, data } = error.response
        
        // 401 未授权：清除 token 并跳转登录
        if (status === 401) {
          authStore.logout()
          toast.error('登录已过期，请重新登录')
          window.location.href = '/login'
          return Promise.reject(error)
        }
        
        // 显示错误消息
        const message = data?.message || data?.error || error.message || '请求失败'
        toast.error(message)
      } else if (error.request) {
        toast.error('网络错误，请检查网络连接')
      } else {
        toast.error(error.message || '请求失败')
      }
      
      return Promise.reject(error)
    }
  )

  return instance
}

// 导出单例实例
export const api = createAxiosInstance()

/**
 * API 请求封装
 */
export const useApi = () => {
  return {
    api,
    /**
     * GET 请求
     */
    async get<T = any>(url: string, params?: any): Promise<T> {
      const response = await api.get<ApiResponse<T>>(url, { params })
      return response.data.data as T
    },

    /**
     * POST 请求
     */
    async post<T = any>(url: string, data?: any): Promise<T> {
      // 如果 data 是 FormData，删除默认的 Content-Type，让浏览器自动设置（包含 boundary）
      const config = data instanceof FormData
        ? { headers: { 'Content-Type': undefined } }
        : {}
      
      const response = await api.post<ApiResponse<T>>(url, data, config)
      return response.data.data as T
    },

    /**
     * PUT 请求
     */
    async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
      // 如果 data 是 FormData，删除默认的 Content-Type，让浏览器自动设置（包含 boundary）
      const requestConfig = data instanceof FormData
        ? { ...config, headers: { ...config?.headers, 'Content-Type': undefined } }
        : config || {}
      
      const response = await api.put<ApiResponse<T>>(url, data, requestConfig)
      return response.data.data as T
    },

    /**
     * 上传文件（FormData）
     */
    async upload<T = any>(url: string, formData: FormData): Promise<T> {
      const response = await api.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': undefined // 让浏览器自动设置
        }
      })
      return response.data.data as T
    },

    /**
     * DELETE 请求
     */
    async delete<T = any>(url: string): Promise<T> {
      const response = await api.delete<ApiResponse<T>>(url)
      return response.data.data as T
    }
  }
}