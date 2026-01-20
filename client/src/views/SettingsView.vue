<template>
  <DefaultLayout>
    <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
         <!-- Header -->
      <header class="fixed top-16 left-0 right-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
            @click="$router.back()"
              
              class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 pb-1"
            >
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 class="text-lg font-bold text-slate-800 dark:text-white tracking-wide">
                设置
              </h1>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                管理您的账户偏好与隐私设置
              </p>
            </div>
          </div>
        </div>
      </header>
       

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-6 pt-20">
          <!-- Account Settings Section -->
          <section class="rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">账户设置</h2>
            </div>

            <div class="p-4 space-y-5">
              <!-- Avatar -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-28 flex-shrink-0">
                  头像
                </label>
                <div class="flex-1 flex items-center gap-4">
                  <!-- Current Avatar Preview -->
                  <div class="relative">
                    <div
                      class="w-16 h-16 rounded-full border-2 overflow-hidden shadow-md flex items-center justify-center"
                      :style="{ borderColor: formData.color || authStore.user?.color || '#2563EB' }"
                    >
                      <img
                        v-if="avatarPreview || authStore.user?.avatar_url"
                        :src="avatarPreview || getImageUrl(authStore.user?.avatar_url)"
                        alt="Avatar"
                        class="w-full h-full object-cover"
                        @error="handleAvatarError"
                      />
                      <div
                        v-else
                        class="w-full h-full flex items-center justify-center text-white font-semibold text-lg"
                        :style="{ backgroundColor: formData.color || authStore.user?.color || '#2563EB' }"
                      >
                        {{ (formData.username || authStore.user?.username || 'U').charAt(0).toUpperCase() }}
                      </div>
                    </div>
                   
                  </div>

                  <!-- Upload Button -->
                  <div class="flex-1">
                <button
                  type="button"
                  @click="triggerAvatarFileSelect"
                  class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors cursor-pointer text-sm font-medium"
                >
                      <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                      <span>{{ avatarPreview || authStore.user?.avatar_url ? '更换头像' : '上传头像' }}</span>
                      
                    </button>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      支持 JPEG、PNG、GIF、WebP，最大 5MB
                    </p>
                  </div>
                </div>
              </div>

              <!-- Username -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label for="username" class="text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-28 flex-shrink-0">
                  用户名
                </label>
                <div class="flex-1">
                  <input
                    id="username"
                    v-model="formData.username"
                    type="text"
                    placeholder="请输入用户名"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    :class="{ 'border-red-500': errors.username }"
                  />
                  <p v-if="errors.username" class="text-xs text-red-500 mt-1">{{ errors.username }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    可以包含中文、字母、数字和下划线，长度为2-50个字符
                  </p>
                </div>
              </div>

              <!-- Color -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label for="color" class="text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-28 flex-shrink-0">
                  主题颜色
                </label>
                <div class="flex-1 flex items-center gap-3 relative">
                  <input
                    id="color"
                    v-model="formData.color"
                    type="color"
                    class="w-14 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  />
                  <input
                    v-model="formData.color"
                    type="text"
                    placeholder="#2563EB"
                    pattern="#[0-9A-Fa-f]{6}"
                    class="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all uppercase"
                    :class="{ 'border-red-500': errors.color }"
                  />
                  <p v-if="errors.color" class="text-xs text-red-500 mt-1 absolute top-full left-0">{{ errors.color }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Password Section -->
          <section class="rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">密码设置</h2>
                <button
                  type="button"
                  @click="showPasswordSection = !showPasswordSection"
                  class="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                >
                  <span>{{ showPasswordSection ? '收起' : '修改密码' }}</span>
                  <span class="material-symbols-outlined text-[16px] transition-transform" :class="{ 'rotate-180': showPasswordSection }">expand_more</span>
                </button>
              </div>
            </div>

            <div v-if="showPasswordSection" class="p-4 space-y-5">
              <!-- Old Password -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label for="oldPassword" class="text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-28 flex-shrink-0">
                  旧密码
                </label>
                <div class="flex-1">
                  <input
                    id="oldPassword"
                    v-model="formData.oldPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    :class="{ 'border-red-500': errors.oldPassword }"
                  />
                  <p v-if="errors.oldPassword" class="text-xs text-red-500 mt-1">{{ errors.oldPassword }}</p>
                </div>
              </div>

              <!-- New Password -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label for="newPassword" class="text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-28 flex-shrink-0">
                  新密码
                </label>
                <div class="flex-1">
                  <input
                    id="newPassword"
                    v-model="formData.newPassword"
                    type="password"
                    placeholder="请输入新密码（至少8个字符）"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    :class="{ 'border-red-500': errors.newPassword }"
                  />
                  <p v-if="errors.newPassword" class="text-xs text-red-500 mt-1">{{ errors.newPassword }}</p>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label for="confirmPassword" class="text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-28 flex-shrink-0">
                  确认密码
                </label>
                <div class="flex-1">
                  <input
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    :class="{ 'border-red-500': errors.confirmPassword }"
                  />
                  <p v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1">{{ errors.confirmPassword }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Footer Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="handleReset"
              class="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              重置
            </button>
            <button
              type="submit"
              :disabled="loading || !hasChanges"
              class="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>{{ loading ? '保存中...' : '保存设置' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Avatar Upload Modal -->
      <input
        ref="avatarFileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        class="hidden"
        @change="onAvatarFileChange"
      />

      <AvatarUploadModal
        :show="showAvatarUploadModal"
        :external-file="pendingAvatarFile"
        @close="closeAvatarUploadModal"
        @confirm="handleAvatarConfirm"
      />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useApi } from '@/composables/useApi'
import { getAvatarUrl } from '@/utils/imageUtils'
import AvatarUploadModal from '@/components/AvatarUploadModal.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { put } = useApi()

const loading = ref(false)
const showPasswordSection = ref(false)
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const avatarError = ref(false)
const showAvatarUploadModal = ref(false)
const avatarFileInputRef = ref<HTMLInputElement | null>(null)
const pendingAvatarFile = ref<File | null>(null)

const formData = ref({
  username: '',
  color: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({
  username: '',
  color: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 检查是否有更改
const hasChanges = computed(() => {
  const user = authStore.user
  if (!user) return false

  return (
    (formData.value.username && formData.value.username !== user.username) ||
    (formData.value.color && formData.value.color !== user.color) ||
    avatarFile.value !== null ||
    (formData.value.newPassword && formData.value.newPassword.length > 0)
  )
})

// 使用统一的图片 URL 工具函数
const getImageUrl = getAvatarUrl

// 触发本地文件选择
const triggerAvatarFileSelect = () => {
  avatarFileInputRef.value?.click()
}

const onAvatarFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  if (!file) return
  pendingAvatarFile.value = file
  showAvatarUploadModal.value = true
  // 重置 input 值，便于下次选择同一文件
  target.value = ''
}

// 处理头像上传确认
const handleAvatarConfirm = async (file: File) => {
  loading.value = true
  
  try {
    // 创建 FormData
    const formDataToSend = new FormData()
    formDataToSend.append('avatar', file)

    // 直接保存头像
    await authStore.updateUser(formDataToSend)

    // 更新本地预览
    avatarFile.value = file
    avatarError.value = false
    
    if (avatarPreview.value) {
      URL.revokeObjectURL(avatarPreview.value)
    }
    avatarPreview.value = URL.createObjectURL(file)
    
    toast.success('头像已更新', { timeout: 2000 })
  } catch (error: any) {
    // 错误已在 store 中处理
  } finally {
    loading.value = false
  }
}

// 关闭裁剪弹窗
const closeAvatarUploadModal = () => {
  showAvatarUploadModal.value = false
  pendingAvatarFile.value = null
}

// 删除头像
const removeAvatar = () => {
  avatarFile.value = null
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value)
  }
  avatarPreview.value = null
  avatarError.value = false
}

// 处理头像加载错误
const handleAvatarError = () => {
  avatarError.value = true
}

// 验证表单
const validateForm = (): boolean => {
  errors.value = {
    username: '',
    color: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  let isValid = true

  // 验证用户名
  if (formData.value.username) {
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,50}$/
    if (!usernameRegex.test(formData.value.username)) {
      errors.value.username = '用户名可以包含中文、字母、数字和下划线，长度为2-50个字符'
      isValid = false
    }
  }

  // 验证颜色
  if (formData.value.color) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.value.color)) {
      errors.value.color = '颜色格式无效，必须是 #RRGGBB 格式'
      isValid = false
    }
  }

  // 验证密码（如果填写了新密码）
  if (formData.value.newPassword) {
    if (formData.value.newPassword.length < 8) {
      errors.value.newPassword = '新密码至少需要8个字符'
      isValid = false
    }

    if (!formData.value.oldPassword) {
      errors.value.oldPassword = '修改密码需要提供旧密码'
      isValid = false
    }

    if (formData.value.newPassword !== formData.value.confirmPassword) {
      errors.value.confirmPassword = '新密码和确认密码不匹配'
      isValid = false
    }
  }

  return isValid
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (!hasChanges.value) {
    toast.info('没有更改需要保存')
    return
  }

  loading.value = true

  try {
    // 创建 FormData
    const formDataToSend = new FormData()

    // 添加字段（只添加有值的字段）
    if (formData.value.username) {
      formDataToSend.append('username', formData.value.username)
    }
    if (formData.value.color) {
      formDataToSend.append('color', formData.value.color)
    }
    if (formData.value.oldPassword) {
      formDataToSend.append('oldPassword', formData.value.oldPassword)
    }
    if (formData.value.newPassword) {
      formDataToSend.append('newPassword', formData.value.newPassword)
      formDataToSend.append('confirmPassword', formData.value.confirmPassword)
    }
    if (avatarFile.value) {
      formDataToSend.append('avatar', avatarFile.value)
    }

    // 调用 API
    await authStore.updateUser(formDataToSend)

    toast.success('设置已更新')
    
    // 重置表单
    handleReset()
  } catch (error: any) {
    // 错误已在 store 中处理
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  const user = authStore.user
  if (user) {
    formData.value = {
      username: user.username || '',
      color: user.color || '#2563EB',
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  }
  
  avatarFile.value = null
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value)
  }
  avatarPreview.value = null
  avatarError.value = false
  showPasswordSection.value = false
  
  errors.value = {
    username: '',
    color: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 初始化表单
onMounted(() => {
  handleReset()
})
</script>

<style scoped>
/* Canvas 样式 */
canvas {
  touch-action: none;
}

/* Range input 样式 */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
