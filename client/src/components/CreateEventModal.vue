<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-[720px] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <!-- Header -->
          <header class="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 px-6 pt-5 pb-3 flex items-center justify-between z-10">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {{ editingEvent ? '编辑事件' : '新建事件' }}
              </h1>
              <p class="text-slate-500 dark:text-slate-400 mt-1 text-xs">
                记录这一刻，让时间留下印记
              </p>
            </div>
            <button
              @click="$emit('close')"
              class="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-500 dark:hover:text-slate-300"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="px-6 py-4 flex flex-col gap-4">
            <!-- Type Selector (Segmented Control) -->
            <div class="px-0 pt-0 pb-1">
              <div class="flex p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg w-max mx-auto sm:mx-0">
                <label class="cursor-pointer relative">
                  <input
                    v-model="formData.event_type"
                    class="peer sr-only"
                    type="radio"
                    value="plan"
                  />
                  <div class="px-4 py-1.5 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-primary peer-checked:shadow-sm transition-all-custom flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">calendar_month</span>
                    <span>计划</span>
                  </div>
                </label>
                <label class="cursor-pointer relative">
                  <input
                    v-model="formData.event_type"
                    class="peer sr-only"
                    type="radio"
                    value="record"
                  />
                  <div class="px-4 py-1.5 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-primary peer-checked:shadow-sm transition-all-custom flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">history_edu</span>
                    <span>记录</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Title -->
            <div class="relative">
              <label class="sr-only" for="title">标题</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                placeholder="输入标题..."
                required
                class="w-full bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 px-0 py-2 text-xl font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-0 focus:border-primary focus:border-b-2 dark:text-white transition-all duration-300 focus:shadow-[0_2px_0_0_rgba(59,130,246,0.5)]"
              />
            </div>

            <!-- Mood Selector -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wider">
                此刻心情
              </label>
              <div class="flex gap-3 flex-wrap">
                <label class="cursor-pointer group" :title="getMoodDescription('happy')">
                  <input
                    v-model="formData.mood"
                    class="peer sr-only"
                    type="radio"
                    value="happy"
                  />
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary hover:border-primary/50 transition-all-custom">
                    <span class="material-symbols-outlined text-[24px]">sentiment_very_satisfied</span>
                  </div>
                </label>
                <label class="cursor-pointer group" :title="getMoodDescription('calm')">
                  <input
                    v-model="formData.mood"
                    class="peer sr-only"
                    type="radio"
                    value="calm"
                  />
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary hover:border-primary/50 transition-all-custom">
                    <span class="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
                  </div>
                </label>
                <label class="cursor-pointer group" :title="getMoodDescription('sad')">
                  <input
                    v-model="formData.mood"
                    class="peer sr-only"
                    type="radio"
                    value="sad"
                  />
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary hover:border-primary/50 transition-all-custom">
                    <span class="material-symbols-outlined text-[24px]">sentiment_dissatisfied</span>
                  </div>
                </label>
                <label class="cursor-pointer group" :title="getMoodDescription('excited')">
                  <input
                    v-model="formData.mood"
                    class="peer sr-only"
                    type="radio"
                    value="excited"
                  />
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary hover:border-primary/50 transition-all-custom">
                    <span class="material-symbols-outlined text-[24px]">rocket_launch</span>
                  </div>
                </label>
                <label class="cursor-pointer group" :title="getMoodDescription('tired')">
                  <input
                    v-model="formData.mood"
                    class="peer sr-only"
                    type="radio"
                    value="tired"
                  />
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary hover:border-primary/50 transition-all-custom">
                    <span class="material-symbols-outlined text-[24px]">bedtime</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Date & Time -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  日期
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-[18px] text-slate-400 group-focus-within:text-primary">event</span>
                  </div>
                  <input
                    id="dateInput"
                    v-model="dateInput"
                    type="date"
                    required
                    class="block w-full pl-9 pr-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all-custom"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  时间
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-[18px] text-slate-400 group-focus-within:text-primary">schedule</span>
                  </div>
                  <input
                    id="timeInput"
                    v-model="timeInput"
                    type="time"
                    required
                    class="block w-full pl-9 pr-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all-custom"
                  />
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                内容
              </label>
              <textarea
                id="contentTextarea"
                v-model="formData.content"
                placeholder="写下你的想法..."
                required
                rows="3"
                class="block w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all-custom"
              ></textarea>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                图片 (可选)
              </label>
              <div class="flex gap-3 overflow-x-auto pb-1">
                <!-- Upload Button -->
                <label
                  class="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all-custom group"
                >
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    class="hidden"
                    @change="handleFileChange"
                  />
                  <span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-xl mb-0.5">add_photo_alternate</span>
                  <span class="text-[9px] text-slate-400 group-hover:text-primary font-medium">
                    {{ (existingImageUrl || selectedImageFile) ? '替换图片' : '添加图片' }}
                  </span>
                </label>

                <!-- Image Preview -->
                <div v-if="imagePreview" class="flex-shrink-0 w-20 h-20 rounded-lg relative group overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      @click="removeImage"
                      class="text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center w-6 h-6 rounded-full"
                    >
                      <span class="material-symbols-outlined text-[14px] leading-none">close</span>
                    </button>
                  </div>
                </div>
              </div>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                支持 JPEG、PNG、GIF、WebP，最大 5MB
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 py-2.5 px-4 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading">处理中...</span>
                <span v-else>{{ editingEvent ? '保存' : '创建' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import type { Event } from '@/types/api'
import { useEventStore } from '@/stores/event'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { compressImage, shouldCompress } from '@/composables/useImageCompress'

interface Props {
  show: boolean
  event?: Event | null
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  event: null
})

const emit = defineEmits<{
  close: []
  created: [event: Event]
  updated: [event: Event]
}>()

const eventStore = useEventStore()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const imagePreview = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const existingImageUrl = ref<string | null>(null)
const isImageRemoved = ref(false) // 标记图片是否被用户手动删除

// 表单数据
const formData = reactive({
  title: '',
  content: '',
  image_url: '',
  event_type: 'record' as 'plan' | 'record',
  mood: null as 'happy' | 'calm' | 'sad' | 'excited' | 'tired' | null
})

// 日期和时间输入（分离以便使用原生 input）
const dateInput = ref('')
const timeInput = ref('')

// 是否为编辑模式
const editingEvent = computed(() => !!props.event)

// 心情说明映射
const moodDescriptions: { [key: string]: string } = {
  happy: '开心 - 感到快乐和满足',
  calm: '平静 - 感到宁静和放松',
  sad: '难过 - 感到沮丧或伤心',
  excited: '兴奋 - 感到激动和兴奋',
  tired: '疲惫 - 感到疲劳和困倦'
}

// 获取心情说明
const getMoodDescription = (mood: string): string => {
  return moodDescriptions[mood] || mood
}

// 获取完整图片 URL
const getImageUrl = (imagePath?: string | null): string | null => {
  if (!imagePath) return null
  // 如果已经是完整 URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // 如果是相对路径（如 /uploads/xxx.jpg），拼接 API URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return `${apiUrl}${imagePath}`
}

// 初始化表单数据
const initForm = () => {
  if (props.event) {
    // 编辑模式：填充现有数据
    formData.title = props.event.title
    formData.content = props.event.content
    formData.image_url = props.event.image_url || ''
    formData.event_type = props.event.event_type || 'record'
    formData.mood = props.event.mood || null
    
    const eventDate = dayjs(props.event.event_date)
    dateInput.value = eventDate.format('YYYY-MM-DD')
    timeInput.value = eventDate.format('HH:mm')
    
    // 如果有旧图片，使用完整 URL 显示预览
    if (props.event.image_url) {
      existingImageUrl.value = props.event.image_url
      imagePreview.value = getImageUrl(props.event.image_url) || null
    } else {
      existingImageUrl.value = null
      imagePreview.value = null
    }
    selectedImageFile.value = null
    isImageRemoved.value = false // 重置删除标志
  } else {
    // 新建模式：使用当前时间
    const now = dayjs()
    dateInput.value = now.format('YYYY-MM-DD')
    timeInput.value = now.format('HH:mm')
    
    formData.title = ''
    formData.content = ''
    formData.image_url = ''
    formData.event_type = 'record'
    formData.mood = null
    imagePreview.value = null
    selectedImageFile.value = null
    existingImageUrl.value = null
    isImageRemoved.value = false // 重置删除标志
  }
  
  // 重置文件输入
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 监听 show 变化，重置表单
watch(() => props.show, (newVal) => {
  if (newVal) {
    initForm()
  }
})

onMounted(() => {
  if (props.show) {
    initForm()
  }
})

// 处理文件选择
const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    return
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    toast.error('不支持的文件类型，只支持 JPEG、PNG、GIF、WebP')
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  // 验证文件大小（5MB = 5 * 1024 * 1024 字节）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    toast.error('文件大小超过限制，最大允许 5MB')
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  try {
    // 如果文件大于 500KB，进行压缩
    let processedFile = file
    if (shouldCompress(file, 500 * 1024)) {
      loading.value = true
      toast.info('正在压缩图片...', { timeout: 2000 })
      
      processedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        outputFormat: 'image/jpeg',
        maxSize: 2 * 1024 * 1024 // 压缩后最大 2MB
      })
      
      const originalSize = (file.size / 1024 / 1024).toFixed(2)
      const compressedSize = (processedFile.size / 1024 / 1024).toFixed(2)
      toast.success(`图片已压缩：${originalSize}MB → ${compressedSize}MB`, { timeout: 3000 })
    }

    // 保存文件
    selectedImageFile.value = processedFile
    
    // 创建预览 URL
    imagePreview.value = URL.createObjectURL(processedFile)
    
    // 清除旧图片 URL（如果正在编辑）
    existingImageUrl.value = null
    isImageRemoved.value = false // 选择了新文件，清除删除标志
  } catch (error: any) {
    toast.error(error.message || '图片处理失败')
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } finally {
    loading.value = false
  }
}

// 移除图片
const removeImage = () => {
  // 释放预览 URL 的内存
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  
  imagePreview.value = null
  selectedImageFile.value = null
  
  // 如果原来有图片（编辑模式下），标记为已删除
  if (existingImageUrl.value) {
    isImageRemoved.value = true
  }
  
  existingImageUrl.value = null
  
  // 重置文件输入
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 提交表单
const handleSubmit = async () => {
  loading.value = true

  try {
    // 组合日期和时间
    const eventDate = dayjs(`${dateInput.value} ${timeInput.value}`).toISOString()

    if (editingEvent.value && props.event) {
      // 更新事件
      const updateData: any = {
        event_date: eventDate,
        title: formData.title,
        content: formData.content,
        event_type: formData.event_type,
        mood: formData.mood || undefined
      }
      
      // 如果图片被手动删除（原来有图片，现在没有了，且没有选择新文件）
      if (isImageRemoved.value && !selectedImageFile.value) {
        updateData.remove_image = true
      }
      
      const updated = await eventStore.updateEvent(
        props.event.id,
        updateData,
        selectedImageFile.value // 传递文件，如果为 null 则保持原图或删除
      )
      emit('updated', updated)
    } else {
      // 创建事件
      const created = await eventStore.createEvent(
        {
          event_date: eventDate,
          title: formData.title,
          content: formData.content,
          event_type: formData.event_type,
          mood: formData.mood || undefined
        },
        selectedImageFile.value // 传递文件
      )
      emit('created', created)
    }

    // 清理预览 URL
    if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview.value)
    }

    emit('close')
  } catch (error) {
    // 错误已在 store 中处理
    console.error('Submit error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .max-w-\[720px\],
.modal-leave-active .max-w-\[720px\] {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .max-w-\[720px\],
.modal-leave-to .max-w-\[720px\] {
  transform: scale(0.95);
  opacity: 0;
}

/* 移除标题输入框的默认 outline 和不需要的边框，但保留动态效果 */
input#title {
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}

input#title:focus {
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  /* 保留动态效果：下边框颜色和阴影 */
}

input#title:active {
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

/* 针对不同浏览器的兼容性处理 */
input#title::-webkit-outer-spin-button,
input#title::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input#title::-webkit-search-decoration,
input#title::-webkit-search-cancel-button,
input#title::-webkit-search-results-button,
input#title::-webkit-search-results-decoration {
  -webkit-appearance: none;
}

/* Firefox 移除默认边框 */
input#title::-moz-focus-inner {
  border: 0;
  padding: 0;
}

/* IE/Edge 移除默认边框 */
input#title::-ms-clear {
  display: none;
}

/* 日期和时间输入框样式处理 */
input#dateInput,
input#timeInput {
  outline: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}

input#dateInput:focus,
input#timeInput:focus {
  outline: none !important;
  /* 保留动态效果：边框颜色和 ring */
}

input#dateInput:active,
input#timeInput:active {
  outline: none !important;
}

/* WebKit 浏览器的日期/时间选择器样式 */
input#dateInput::-webkit-calendar-picker-indicator,
input#timeInput::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

input#dateInput::-webkit-calendar-picker-indicator:hover,
input#timeInput::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

input#dateInput::-webkit-inner-spin-button,
input#timeInput::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input#dateInput::-webkit-outer-spin-button,
input#timeInput::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

/* Firefox 移除默认边框 */
input#dateInput::-moz-focus-inner,
input#timeInput::-moz-focus-inner {
  border: 0;
  padding: 0;
}

/* 内容文本域样式处理 */
textarea#contentTextarea {
  outline: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}

textarea#contentTextarea:focus {
  outline: none !important;
  /* 保留动态效果：边框颜色和 ring */
}

textarea#contentTextarea:active {
  outline: none !important;
}

/* Firefox 移除默认边框 */
textarea#contentTextarea::-moz-focus-inner {
  border: 0;
  padding: 0;
}

/* 移除文本域的默认调整大小按钮样式 */
textarea#contentTextarea::-webkit-resizer {
  display: none;
}
</style>