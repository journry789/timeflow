<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
        <div class="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <!-- Header -->
          <header class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">上传头像</h2>
            <button
              @click="$emit('close')"
              class="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-500"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          <!-- Content -->
          <div class="flex-1 p-6 flex flex-col overflow-y-auto">
            <!-- Upload Section (if no image selected) -->
            <div v-if="!imageUrl" class="flex-1 flex flex-col items-center justify-center">
              <div 
                class="w-48 h-48 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                @click="triggerFileInput"
              >
                <span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-5xl mb-3">photo_camera</span>
                <span class="text-sm text-slate-500 dark:text-slate-400 group-hover:text-primary font-medium">点击上传头像</span>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                class="hidden"
                @change="handleFileSelect"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 text-center">
                支持 JPEG、PNG、GIF、WebP，最大 5MB
              </p>
            </div>

            <!-- Cropper Section (if image selected) -->
            <div v-else class="flex-1 flex flex-col">
              <!-- Cropper -->
              <div class="w-full max-w-xs mx-auto rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-lg mb-4" style="width: 300px; height: 300px; position: relative;">
                <VuePictureCropper
                  v-if="imageUrl"
                  :key="imageUrl"
                  :boxStyle="{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent'
                  }"
                  :img="imageUrl"
                  :options="{
                    viewMode: 1,
                    dragMode: 'move',
                    aspectRatio: 1,
                    autoCrop: true,
                    autoCropArea: 0.8,
                    restore: false,
                    guides: false,
                    center: true,
                    highlight: false,
                    cropBoxMovable: false,
                    cropBoxResizable: false,
                    toggleDragModeOnDblclick: false
                  }"
                  @ready="onCropperReady"
                />
              </div>

              <!-- Controls -->
              <div class="space-y-4">
                <!-- Zoom Control -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    缩放控制
                  </label>
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      @click.stop="zoomOut"
                      :disabled="!cropperReady"
                      class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <button
                      type="button"
                      @click.stop="zoomIn"
                      :disabled="!cropperReady"
                      class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="material-symbols-outlined text-[18px]">add</span>
                    </button>
                    <button
                      type="button"
                      @click.stop="rotateLeft"
                      :disabled="!cropperReady"
                      class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    >
                      <span class="material-symbols-outlined text-[18px]">rotate_left</span>
                    </button>
                    <button
                      type="button"
                      @click.stop="rotateRight"
                      :disabled="!cropperReady"
                      class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="material-symbols-outlined text-[18px]">rotate_right</span>
                    </button>
                  </div>
                </div>

                <!-- Preview -->
                <div class="flex items-center justify-center gap-4">
                  <div class="text-center">
                    <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 mx-auto mb-2">
                      <img :src="previewUrl" alt="Preview" class="w-full h-full object-cover" v-if="previewUrl" />
                      <div v-else class="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span class="text-xs text-slate-400">预览</span>
                      </div>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">预览</p>
                  </div>
                </div>

                <!-- Replace Image Button -->
                <button
                  type="button"
                  @click="handleReplaceImage"
                  class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <span class="material-symbols-outlined text-[18px]">image</span>
                  <span>重新选择图片</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <footer class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              @click="$emit('close')"
              class="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              取消
            </button>
            <button
              v-if="imageUrl"
              @click="handleConfirm"
              :disabled="loading || !cropperReady"
              class="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>{{ loading ? '处理中...' : '确认' }}</span>
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Teleport, Transition } from 'vue'
import { useToast } from 'vue-toastification'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import { compressImage, shouldCompress } from '@/composables/useImageCompress'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [file: File]
}>()

const toast = useToast()
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageUrl = ref('')
const previewUrl = ref('')
const loading = ref(false)
const cropperReady = ref(false)

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    toast.error('不支持的文件类型，请选择 JPEG、PNG、GIF 或 WebP 格式')
    return
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    toast.error('文件大小超过限制，最大允许 5MB')
    return
  }

  try {
    loading.value = true
    cropperReady.value = false
    
    // 先进行基本压缩（如果文件太大）
    let processedFile = file
    if (shouldCompress(file, 200 * 1024)) {
      toast.info('正在处理图片...', { timeout: 2000 })
      processedFile = await compressImage(file, {
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 0.9,
        outputFormat: 'image/jpeg',
        maxSize: 5 * 1024 * 1024
      })
    }

    // 使用 Promise 包装 FileReader
    const imageDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          resolve(result)
        } else {
          reject(new Error('图片读取失败'))
        }
      }
      reader.onerror = () => {
        reject(new Error('图片读取失败'))
      }
      reader.readAsDataURL(processedFile)
    })

    // 设置图片 URL
    imageUrl.value = imageDataUrl
    cropperReady.value = false
    
    // 等待 DOM 更新，确保组件已渲染
    await nextTick()
    
    loading.value = false
  } catch (error: any) {
    toast.error(error.message || '图片处理失败')
    loading.value = false
    imageUrl.value = ''
    cropperReady.value = false
  }
}

// 重新选择图片
const handleReplaceImage = () => {
  imageUrl.value = ''
  previewUrl.value = ''
  cropperReady.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Cropper 准备就绪事件
const onCropperReady = () => {
  console.log('vue-picture-cropper 准备就绪')
  cropperReady.value = true
  updatePreview()
}

// 更新预览
const updatePreview = () => {
  if (!cropperReady.value) {
    return
  }
  
  try {
    const dataURL = cropper.getDataURL({
      width: 200,
      height: 200,
      imageMime: 'image/jpeg',
      imageQuality: 0.9
    })
    if (dataURL) {
      previewUrl.value = dataURL
    }
  } catch (error) {
    console.error('更新预览失败:', error)
  }
}

// 缩放控制
const zoomIn = () => {
  if (!cropperReady.value) {
    return
  }
  
  try {
    cropper.zoom(0.1)
    setTimeout(() => {
      updatePreview()
    }, 100)
  } catch (error: any) {
    console.error('放大失败:', error)
    toast.error('放大失败')
  }
}

const zoomOut = () => {
  if (!cropperReady.value) {
    return
  }
  
  try {
    cropper.zoom(-0.1)
    setTimeout(() => {
      updatePreview()
    }, 100)
  } catch (error: any) {
    console.error('缩小失败:', error)
    toast.error('缩小失败')
  }
}

// 旋转控制
const rotateLeft = () => {
  if (!cropperReady.value) {
    return
  }
  
  try {
    cropper.rotate(-90)
    setTimeout(() => {
      updatePreview()
    }, 100)
  } catch (error: any) {
    console.error('旋转失败:', error)
  }
}

const rotateRight = () => {
  if (!cropperReady.value) {
    return
  }
  
  try {
    cropper.rotate(90)
    setTimeout(() => {
      updatePreview()
    }, 100)
  } catch (error: any) {
    console.error('旋转失败:', error)
  }
}

// 确认裁剪
const handleConfirm = async () => {
  if (!imageUrl || !cropperReady.value) {
    return
  }

  loading.value = true

  try {
    // 使用 vue-picture-cropper 的 getBlob 方法（返回 Promise）
    const blob = await cropper.getBlob({
      width: 800,
      height: 800,
      imageMime: 'image/jpeg',
      imageQuality: 0.85
    })

    if (!blob) {
      loading.value = false
      toast.error('无法获取裁剪后的图片')
      return
    }

    // 转换为 File
    const file = new File(
      [blob],
      'avatar.jpg',
      {
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    )

    // 对裁剪后的图片进行最终压缩
    try {
      const compressedFile = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        outputFormat: 'image/jpeg',
        maxSize: 500 * 1024
      })
      
      emit('confirm', compressedFile)
      emit('close')
      loading.value = false
    } catch (error) {
      console.error('图片压缩失败:', error)
      // 即使压缩失败，也使用原始文件
      emit('confirm', file)
      emit('close')
      loading.value = false
    }
  } catch (error: any) {
    console.error('确认裁剪失败:', error)
    toast.error(error.message || '头像处理失败')
    loading.value = false
  }
}

// 监听 show 变化，重置状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 打开时重置所有状态
    imageUrl.value = ''
    previewUrl.value = ''
    cropperReady.value = false
    loading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } else {
    // 关闭时清理预览 URL
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
    if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl.value)
      imageUrl.value = ''
    }
  }
})
</script>

<style scoped>
/* Modal 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .max-w-md,
.modal-leave-active .max-w-md {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .max-w-md,
.modal-leave-to .max-w-md {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

/* vue-picture-cropper 样式覆盖 */
:deep(.vue-picture-cropper) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.cropper-container) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.cropper-view-box) {
  border-radius: 50% !important;
  outline: none !important;
}

:deep(.cropper-face) {
  border-radius: 50% !important;
}

:deep(.cropper-drag-box) {
  border-radius: 50% !important;
}

:deep(.cropper-line) {
  display: none !important;
}

:deep(.cropper-point) {
  display: none !important;
}
</style>
