<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
        <div class="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <!-- Header -->
          <header class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">编辑头像</h2>
            <button
              @click="$emit('close')"
              class="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-500"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          <!-- Content -->
          <div class="flex-1 p-6 flex flex-col">
            <!-- Upload Section (if no image selected) -->
            <div v-if="!selectedImage" class="flex-1 flex flex-col items-center justify-center">
              <div class="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group" @click="triggerFileInput">
                <span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-4xl mb-2">photo_camera</span>
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
                支持 JPEG、PNG、GIF、WebP，最大 2MB
              </p>
            </div>

            <!-- Cropper Section (if image selected) -->
            <div v-else class="flex-1 flex flex-col">
              <!-- Cropper Canvas -->
              <div class="relative w-full max-w-xs mx-auto aspect-square rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-lg mb-4">
                <canvas
                  ref="canvasRef"
                  class="w-full h-full cursor-move"
                  @mousedown="handleMouseDown"
                  @mousemove="handleMouseMove"
                  @mouseup="handleMouseUp"
                  @mouseleave="handleMouseUp"
                  @wheel.prevent="handleWheel"
                ></canvas>
              </div>

              <!-- Controls -->
              <div class="space-y-4">
                <!-- Zoom Control -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    缩放: {{ Math.round(scale * 100) }}%
                  </label>
                  <input
                    v-model.number="scale"
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    @input="updateCanvas"
                  />
                </div>

                <!-- Preview -->
                <div class="flex items-center justify-center gap-4">
                  <div class="text-center">
                    <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 mx-auto mb-2">
                      <img :src="previewUrl" alt="Preview" class="w-full h-full object-cover" />
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">预览</p>
                  </div>
                </div>

                <!-- Replace Image Button -->
                <button
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
              v-if="selectedImage"
              @click="handleConfirm"
              class="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
            >
              确认
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { Teleport, Transition } from 'vue'
import { useToast } from 'vue-toastification'
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
const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedImage = ref<File | null>(null)
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const previewUrl = ref('')

let image: HTMLImageElement | null = null

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

  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    toast.error('文件大小超过限制，最大允许 2MB')
    return
  }

  try {
    // 先进行基本压缩（如果文件太大）
    let processedFile = file
    if (shouldCompress(file, 200 * 1024)) {
      toast.info('正在处理图片...', { timeout: 2000 })
      
      processedFile = await compressImage(file, {
        maxWidth: 1200, // 裁剪前保持较大尺寸，方便裁剪
        maxHeight: 1200,
        quality: 0.9,
        outputFormat: 'image/jpeg',
        maxSize: 2 * 1024 * 1024
      })
    }

    selectedImage.value = processedFile
    await nextTick()
    loadImage(processedFile)
  } catch (error: any) {
    toast.error(error.message || '图片处理失败')
  }
}

// 重新选择图片
const handleReplaceImage = () => {
  selectedImage.value = null
  image = null
  previewUrl.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 加载图片
const loadImage = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      image = img
      // 计算初始缩放和位置，使图片填满圆形裁剪区域
      const canvas = canvasRef.value
      if (!canvas) return

      const size = canvas.width
      const imgAspect = img.width / img.height
      
      // 计算适合圆形的尺寸
      const fitSize = Math.max(img.width, img.height)
      scale.value = size / fitSize * 1.2 // 稍微放大一点，方便调整
      
      // 居中
      offsetX.value = (size - img.width * scale.value) / 2
      offsetY.value = (size - img.height * scale.value) / 2

      updateCanvas()
      updatePreview()
    }
    img.onerror = () => {
      toast.error('图片加载失败')
    }
    img.src = e.target?.result as string
  }
  reader.onerror = () => {
    toast.error('文件读取失败')
  }
  reader.readAsDataURL(file)
}

// 更新画布
const updateCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas || !image) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = canvas.width

  // 清空画布
  ctx.clearRect(0, 0, size, size)

  // 创建圆形裁剪路径
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()

  // 绘制图片
  const scaledWidth = image.width * scale.value
  const scaledHeight = image.height * scale.value

  ctx.drawImage(
    image,
    offsetX.value,
    offsetY.value,
    scaledWidth,
    scaledHeight
  )
}

// 更新预览
const updatePreview = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 创建预览 canvas
  const previewCanvas = document.createElement('canvas')
  previewCanvas.width = 200
  previewCanvas.height = 200
  const previewCtx = previewCanvas.getContext('2d')
  if (!previewCtx) return

  // 绘制圆形裁剪
  previewCtx.beginPath()
  previewCtx.arc(100, 100, 100, 0, Math.PI * 2)
  previewCtx.clip()

  // 绘制缩放后的图片
  previewCtx.drawImage(canvas, 0, 0, 200, 200)

  previewUrl.value = previewCanvas.toDataURL('image/jpeg', 0.9)
}

// 鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  dragStartX.value = e.clientX - offsetX.value
  dragStartY.value = e.clientY - offsetY.value
}

// 鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  offsetX.value = e.clientX - rect.left - dragStartX.value
  offsetY.value = e.clientY - rect.top - dragStartY.value

  updateCanvas()
  updatePreview()
}

// 鼠标释放
const handleMouseUp = () => {
  isDragging.value = false
}

// 滚轮缩放
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(0.5, Math.min(3, scale.value + delta))
  updateCanvas()
  updatePreview()
}

// 确认裁剪
const handleConfirm = async () => {
  const canvas = canvasRef.value
  if (!canvas || !selectedImage.value) return

  // 创建最终输出的 canvas
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = 800 // 头像尺寸
  outputCanvas.height = 800
  const outputCtx = outputCanvas.getContext('2d')
  if (!outputCtx) return

  // 创建圆形裁剪路径
  outputCtx.beginPath()
  outputCtx.arc(400, 400, 400, 0, Math.PI * 2)
  outputCtx.clip()

  // 绘制缩放后的图片
  if (image) {
    const scaledWidth = image.width * scale.value
    const scaledHeight = image.height * scale.value
    
    // 计算在输出 canvas 中的位置
    const outputX = (800 - scaledWidth) / 2 + (offsetX.value / canvas.width) * 800
    const outputY = (800 - scaledHeight) / 2 + (offsetY.value / canvas.height) * 800

    outputCtx.drawImage(
      image,
      outputX,
      outputY,
      scaledWidth,
      scaledHeight
    )
  }

  // 转换为 Blob
  outputCanvas.toBlob(async (blob) => {
    if (!blob) return

    let file = new File(
      [blob],
      selectedImage.value?.name || 'avatar.jpg',
      {
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    )

    // 对裁剪后的图片进行最终压缩
    if (shouldCompress(file, 100 * 1024)) {
      toast.info('正在优化头像...', { timeout: 2000 })
      
      file = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        outputFormat: 'image/jpeg',
        maxSize: 500 * 1024 // 最终最大 500KB
      })
    }

    emit('confirm', file)
    emit('close')
  }, 'image/jpeg', 0.9)
}

// 初始化 canvas
onMounted(() => {
  if (canvasRef.value) {
    const size = 400
    canvasRef.value.width = size
    canvasRef.value.height = size
    canvasRef.value.style.width = '100%'
    canvasRef.value.style.height = '100%'
  }
})

// 监听 show 变化，重置状态
watch(() => props.show, (newVal) => {
  if (!newVal) {
    // 关闭时重置
    selectedImage.value = null
    image = null
    previewUrl.value = ''
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
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
