import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/api'
import { useApi } from '@/composables/useApi'
import { useToast } from 'vue-toastification'
import router from '@/router'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  password: string
}

interface AuthResponse {
  user: User
  token: string
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(localStorage.getItem('token'))
    const user = ref<User | null>(null)

    // 计算属性：是否已认证
    const isAuthenticated = computed(() => !!token.value && !!user.value)

    /**
     * 登录
     */
    const login = async (data: LoginData) => {
      const { post } = useApi()
      const toast = useToast()

      try {
        const response = await post<AuthResponse>('/api/auth/login', data)
        
        token.value = response.token
        user.value = response.user
        
        // 保存到 localStorage
        localStorage.setItem('token', response.token)
        
        toast.success('登录成功')
        
        // 跳转到 timeline 或重定向页面
        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || '/timeline')
      } catch (error: any) {
        throw error
      }
    }

    /**
     * 注册
     */
    const register = async (data: RegisterData) => {
      const { post } = useApi()
      const toast = useToast()

      try {
        const response = await post<AuthResponse>('/api/auth/register', data)
        
        token.value = response.token
        user.value = response.user
        
        // 保存到 localStorage
        localStorage.setItem('token', response.token)
        
        toast.success('注册成功')
        
        router.push('/timeline')
      } catch (error: any) {
        throw error
      }
    }

    /**
     * 登出
     */
    const logout = () => {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      router.push('/login')
    }

    /**
     * 获取当前用户信息
     */
    const fetchCurrentUser = async () => {
      if (!token.value) return

      const { get } = useApi()

      try {
        const response = await get<User>('/api/users/me')
        user.value = response
      } catch (error) {
        // 如果获取失败，清除 token
        logout()
      }
    }

    /**
     * 更新用户信息
     */
    const updateUser = async (formData: FormData) => {
      const { put } = useApi()

      try {
        const response = await put<any>('/api/users/me', formData)
        
        // 更新本地用户信息（后端返回的字段名可能是 snake_case 或 camelCase）
        user.value = {
          id: response.id,
          email: response.email || user.value?.email || '',
          username: response.username,
          display_name: response.display_name || response.displayName,
          avatar_url: response.avatar_url || response.avatarUrl,
          color: response.color,
          created_at: response.created_at || response.createdAt,
          updated_at: response.updated_at || response.updatedAt
        }
        
        return response
      } catch (error: any) {
        throw error
      }
    }

    /**
     * 初始化：如果有 token 但没有用户信息，则获取用户信息
     */
    const init = async () => {
      if (token.value && !user.value) {
        await fetchCurrentUser()
      }
    }

    return {
      token,
      user,
      isAuthenticated,
      login,
      register,
      logout,
      fetchCurrentUser,
      updateUser,
      init
    }
  },
  {
    // Pinia 持久化配置
    persist: {
      key: 'auth-store',
      storage: localStorage,
      paths: ['token', 'user']
    }
  }
)