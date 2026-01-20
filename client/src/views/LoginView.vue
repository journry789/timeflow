<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <!-- Decorative Background -->
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Card -->
    <div class="w-full max-w-[480px] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
      <!-- Top Gradient Line -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>

      <div class="p-8 sm:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
            <span class="material-symbols-outlined text-[28px]">
              {{ isRegisterMode ? 'person_add' : 'login' }}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {{ isRegisterMode ? '注册账号' : '欢迎回来' }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            {{ isRegisterMode ? '记录生活，分享此刻，从这里开始' : '登录以继续使用 TimeFlow' }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Username (仅注册模式) -->
          <div v-if="isRegisterMode" class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="username">
              用户名
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span class="material-symbols-outlined text-[20px]">person</span>
              </div>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                placeholder="请输入用户名"
                required
                class="block w-full pl-10 pr-3 py-3 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-primary focus:ring-1 sm:text-sm transition-all duration-200"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="email">
              电子邮箱
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span class="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="name@example.com"
                required
                class="block w-full pl-10 pr-3 py-3 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-primary focus:ring-1 sm:text-sm transition-all duration-200"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="password">
              密码
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span class="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="isRegisterMode ? '设置您的密码' : '请输入密码'"
                required
                class="block w-full pl-10 pr-10 py-3 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-primary focus:ring-1 sm:text-sm transition-all duration-200"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              处理中...
            </span>
            <span v-else>
              {{ isRegisterMode ? '立即注册' : '登录' }}
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
        </div>

        <!-- Switch Mode -->
        <div class="text-center">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ isRegisterMode ? '已有账号？' : '还没有账号？' }}
            <button
              @click="isRegisterMode = !isRegisterMode"
              class="font-medium text-primary hover:text-primary-hover hover:underline"
            >
              {{ isRegisterMode ? '立即登录' : '立即注册' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const isRegisterMode = ref(false)
const showPassword = ref(false)
const loading = ref(false)

const formData = reactive({
  email: '',
  username: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true

  try {
    if (isRegisterMode.value) {
      await authStore.register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      })
    } else {
      await authStore.login({
        email: formData.email,
        password: formData.password
      })
    }
  } catch (error: any) {
    // 错误已在 store 中处理，这里只重置状态
    console.error('Auth error:', error)
  } finally {
    loading.value = false
  }
}
</script>