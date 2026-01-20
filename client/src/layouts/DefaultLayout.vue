<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/timeline" class="flex items-center gap-2">
          <div class="bg-primary text-white rounded-lg p-1.5">
            <span class="material-symbols-outlined text-[20px]">schedule</span>
          </div>
          <h1 class="font-bold text-lg tracking-tight text-slate-800 dark:text-white">TimeFlow</h1>
        </router-link>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <router-link
            to="/timeline"
            class="flex items-center gap-2 font-medium py-5 transition-colors"
            :class="$route.name === 'timeline' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
          >
            <span class="material-symbols-outlined text-[20px]" :class="$route.name === 'timeline' ? 'fill' : ''">timeline</span>
            <span>我的时间线</span>
          </router-link>
          <router-link
            to="/friends"
            class="flex items-center gap-2 font-medium py-5 transition-colors relative"
            :class="$route.name === 'friends' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
          >
            <span class="material-symbols-outlined text-[20px] relative" :class="$route.name === 'friends' ? 'fill' : ''">
            
              <!-- 待处理请求数量标签（红色小圆点） -->
              <span
                v-if="pendingRequestsCount > 0"
                class="absolute top-full left-1/2 -translate-x-1/2  w-2 h-2 bg-red-500 rounded-full"
                :title="`有 ${pendingRequestsCount} 个待处理的好友请求`"
              ></span>
              group
            </span>
            <span>好友</span>
          </router-link>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 pb-1"
            :title="isDark ? '切换到浅色模式' : '切换到暗黑模式'"
          >
            <span class="material-symbols-outlined">
              {{ isDark ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>

          <!-- User Avatar -->
          <div class="relative">
            <div
              class="w-8 h-8 rounded-full bg-primary cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all overflow-hidden flex items-center justify-center text-white font-semibold text-sm"
              :style="avatarStyle"
              @click="showUserMenu = !showUserMenu"
            >
              <img v-if="authStore.user?.avatar_url" :src="getAvatarUrl(authStore.user.avatar_url)" alt="Avatar" class="w-full h-full object-cover" />
              <span v-else>{{ avatarInitial }}</span>
            </div>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-[9999] overflow-hidden"
            >
              <div class="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ authStore.user?.username }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ authStore.user?.email }}</p>
              </div>
             
              <button
                @click="openSettings"
                class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 flex items-center gap-2 group"
              >
                <span class="material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">settings</span>
                <span class="group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">设置</span>
              </button>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center gap-2 group"
              >
                <span class="material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200">logout</span>
                <span class="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200">退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 pb-20 md:pb-0">
      <slot />
    </main>

    <!-- Avatar Upload Modal -->
    <AvatarUploadModal
      :show="showAvatarUploadModal"
      @close="closeAvatarUploadModal"
      @confirm="handleAvatarConfirm"
    />

    <!-- Mobile Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 md:hidden">
      <div class="flex items-center justify-around h-16">
        <!-- 我的时间线 -->
        <router-link
          to="/timeline"
          class="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
          :class="$route.name === 'timeline' 
            ? 'text-primary' 
            : 'text-slate-500 dark:text-slate-400'"
        >
          <span class="material-symbols-outlined text-[24px]" :class="$route.name === 'timeline' ? 'fill' : ''">timeline</span>
          <span class="text-xs font-medium">我的时间线</span>
        </router-link>

        <!-- 创建事件按钮（仅在时间线页面显示） -->
        <button
          v-if="$route.name === 'timeline'"
          @click="handleCreateEvent"
          class="flex items-center justify-center w-14 h-14 -mt-6 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-all duration-200 z-10"
          title="创建新事件"
        >
          <span class="material-symbols-outlined text-3xl">add</span>
        </button>
        <div v-else class="w-14"></div>

        <!-- 好友 -->
        <router-link
          to="/friends"
          class="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative"
          :class="$route.name === 'friends' 
            ? 'text-primary' 
            : 'text-slate-500 dark:text-slate-400'"
        >
          <span class="material-symbols-outlined text-[24px] relative" :class="$route.name === 'friends' ? 'fill' : ''">
            <!-- 待处理请求数量标签（红色小圆点） -->
            <span
              v-if="pendingRequestsCount > 0"
              class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
              :title="`有 ${pendingRequestsCount} 个待处理的好友请求`"
            ></span>
            group
          </span>
          <span class="text-xs font-medium">好友</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFriendStore } from '@/stores/friend'
import { useRouter } from 'vue-router'
import AvatarUploadModal from '@/components/AvatarUploadModal.vue'
import { getAvatarUrl } from '@/utils/imageUtils'
import { useToast } from 'vue-toastification'
import { useApi } from '@/composables/useApi'

const authStore = useAuthStore()
const friendStore = useFriendStore()
const router = useRouter()
const toast = useToast()
const { put } = useApi()

const showUserMenu = ref(false)
const isDark = ref(false)
const showAvatarUploadModal = ref(false)

// 注入打开创建事件模态框的函数（如果存在）
const openCreateEventModal = inject<(() => void) | undefined>('openCreateEventModal')

// 处理创建事件按钮点击
const handleCreateEvent = () => {
  if (openCreateEventModal) {
    openCreateEventModal()
  }
}

// 打开设置页面
const openSettings = () => {
  showUserMenu.value = false
  router.push('/settings')
}



// 关闭头像上传 Modal
const closeAvatarUploadModal = () => {
  showAvatarUploadModal.value = false
}

// 处理头像上传确认
const handleAvatarConfirm = async (file: File) => {
  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('avatar', file)

    // 调用 API 更新头像（updateUser 会自动更新 user.value，头像会立即刷新）
    await authStore.updateUser(formData)

    toast.success('头像已更新')
    closeAvatarUploadModal()
  } catch (error: any) {
    // 错误已在 store 中处理
  }
}

// 待处理请求数量
const pendingRequestsCount = computed(() => {
  return friendStore.pendingRequests.length
})

// 计算头像首字符
const avatarInitial = computed(() => {
  if (!authStore.user?.username) return '?'
  // 获取用户名的第一个字符（支持中文和英文）
  return authStore.user.username.charAt(0).toUpperCase()
})

// 计算头像样式
const avatarStyle = computed(() => {
  if (authStore.user?.avatar_url) return {}
  return {
    backgroundColor: authStore.user?.color || '#2563EB'
  }
})

// 切换暗黑模式
const toggleDarkMode = () => {
  const html = document.documentElement
  isDark.value = !isDark.value
  html.classList.toggle('dark', isDark.value)
  localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light')
}

// 初始化暗黑模式状态
onMounted(async () => {
  isDark.value = document.documentElement.classList.contains('dark')
  
  // 加载待处理的好友请求
  if (authStore.isAuthenticated) {
    await friendStore.fetchPendingRequests()
  }
  
  // 点击外部关闭菜单
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// 退出登录
const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
}
</script>