<template>
  <div
    class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative cursor-pointer"
    :class="cardBorderClass"
    :style="getCardBorderStyle()"
    @click="handleCardClick"
  >
    <div class="p-5 pt-4 relative">
      <!-- Publisher Avatar (Mobile only, top-right) -->
      <div
        v-if="publisherColor"
        class="md:hidden absolute top-2 right-2 z-20"
      >
        <div
          class="w-7 h-7 rounded-full border-2 overflow-hidden shadow-md flex items-center justify-center"
          :style="{ borderColor: publisherColor }"
        >
          <img
            v-if="publisherAvatar && !showAvatarFallback"
            :src="getAvatarUrl(publisherAvatar)"
            :alt="publisherUsername || 'Publisher'"
            class="w-full h-full object-cover"
            @error="handleAvatarError"
          />
          <div
            v-if="!publisherAvatar || showAvatarFallback"
            class="w-full h-full flex items-center justify-center text-white font-semibold text-[10px]"
            :style="{ backgroundColor: publisherColor }"
          >
            {{ (publisherUsername || 'U').charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>

      <!-- Header: Date, Mood & Actions -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <!-- Date -->
          <span class="text-xs font-semibold uppercase tracking-wider" :style="{ color: themeColor }">
            {{ formattedDate }}
          </span>
          <!-- Mood Icon -->
          <div
            v-if="event.mood"
            class="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 border border-white dark:border-slate-700"
            :class="moodBgClass"
            :title="moodLabel"
          >
            <span class="material-symbols-outlined text-[20px]" :class="moodIconClass">
              {{ moodIcon }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="showActions"
            @click="$emit('edit', event)"
            class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="编辑"
          >
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            v-if="showActions"
            @click="handleDelete"
            class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="删除"
          >
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
        {{ event.title }}
      </h3>

      <!-- Content -->
      <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
        {{ event.content }}
      </p>

      <!-- Image -->
      <div v-if="event.image_url" class="mb-4 rounded-lg overflow-hidden group/image">
        <div 
          class="w-full rounded-lg overflow-hidden transition-all duration-500"
          :class="isPortraitImage ? 'h-48 group-hover/image:h-auto group-hover/image:max-h-[500px]' : 'h-48'"
        >
          <img
            ref="imageRef"
            :src="getImageUrl(event.image_url)"
            :alt="event.title"
            :class="[
              'w-full rounded-lg transition-all duration-500',
              isPortraitImage 
                ? 'h-full object-cover object-top group-hover/image:object-contain group-hover/image:h-auto' 
                : 'h-full object-cover hover:scale-105'
            ]"
            @load="handleImageLoad"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Footer: Time & Type Badge -->
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span class="material-symbols-outlined text-[14px]">schedule</span>
          <span>{{ formattedTime }}</span>
        </div>
        <!-- Type Badge -->
        <div
          class="px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1"
          :class="typeBadgeClass"
        >
          <span class="material-symbols-outlined text-[14px]">{{ typeIcon }}</span>
          <span>{{ typeLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Dialog -->
    <DeleteConfirmDialog
      :show="showDeleteDialog"
      :message="`确定要删除「${event.title}」吗？此操作无法撤销。`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import type { Event } from '@/types/api'
import { useEventStore } from '@/stores/event'
import { useToast } from 'vue-toastification'
import DeleteConfirmDialog from './DeleteConfirmDialog.vue'
import { getAvatarUrl } from '@/utils/imageUtils'

interface Props {
  event: Event
  color?: string
  showActions?: boolean
  isLeftSide?: boolean // 是否在时间轴左侧（true=左侧，false=右侧）
  publisherAvatar?: string // 发布者头像URL
  publisherColor?: string // 发布者颜色
  publisherUsername?: string // 发布者用户名
}

const props = withDefaults(defineProps<Props>(), {
  color: '#2563EB',
  showActions: false,
  isLeftSide: false,
  publisherAvatar: undefined,
  publisherColor: undefined,
  publisherUsername: undefined
})

const emit = defineEmits<{
  edit: [event: Event]
  click: [event: Event]
}>()

const eventStore = useEventStore()
const toast = useToast()

const showDeleteDialog = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)
const isPortraitImage = ref(false)

// 获取完整图片 URL
const getImageUrl = (imagePath?: string | null): string => {
  if (!imagePath) return ''
  // 如果已经是完整 URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // 如果是相对路径（如 /uploads/xxx.jpg），拼接 API URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return `${apiUrl}${imagePath}`
}

// 图片加载处理：检测是否为竖向图片
const handleImageLoad = (e: Event) => {
  const target = e.target as HTMLImageElement
  const naturalWidth = target.naturalWidth
  const naturalHeight = target.naturalHeight
  
  // 判断是否为竖向图片（高度大于宽度）
  if (naturalHeight > naturalWidth) {
    isPortraitImage.value = true
  } else {
    isPortraitImage.value = false
  }
}

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// 处理头像加载错误
const showAvatarFallback = ref(false)
const handleAvatarError = () => {
  showAvatarFallback.value = true
}

// 监听图片 URL 变化，重置竖向图片状态
watch(() => props.event.image_url, () => {
  isPortraitImage.value = false
  if (imageRef.value && imageRef.value.complete) {
    handleImageLoad({ target: imageRef.value } as Event)
  }
})

// 格式化日期
const formattedDate = computed(() => {
  return dayjs(props.event.event_date).format('YYYY年 M月 D日')
})

// 格式化时间
const formattedTime = computed(() => {
  return dayjs(props.event.event_date).format('HH:mm')
})

// 事件类型配置
const eventType = computed(() => props.event.event_type || 'record')

// 心情颜色映射
const moodColors: { [key: string]: string } = {
  happy: '#FBBF24',    // 黄色 - 开心
  calm: '#34D399',     // 绿色 - 平静
  sad: '#60A5FA',      // 蓝色 - 难过
  excited: '#F472B6',  // 粉色 - 兴奋
  tired: '#A78BFA'     // 紫色 - 疲惫
}

// 主题颜色（优先根据心情，其次根据事件类型）
const themeColor = computed(() => {
  // 如果有心情，使用心情颜色
  if (props.event.mood && moodColors[props.event.mood]) {
    return moodColors[props.event.mood]
  }
  // 如果没有心情，根据事件类型设置
  if (eventType.value === 'plan') {
    return '#F59E0B' // 琥珀色 - 计划
  }
  return props.color // 记录使用用户颜色
})

// 卡片边框样式（根据位置设置不同的边）
const cardBorderClass = computed(() => {
  // 根据卡片位置设置边框
  if (props.isLeftSide) {
    // 时间轴左侧：设置右边、上边、下边（左边通过内联样式设置）
    return 'border-r border-t border-b border-slate-200 dark:border-slate-700'
  } else {
    // 时间轴右侧：设置左边、上边、下边（右边通过内联样式设置）
    return 'border-l border-t border-b border-slate-200 dark:border-slate-700'
  }
})

// 获取卡片边框样式（动态设置颜色条位置）
const getCardBorderStyle = () => {
  const baseStyle: Record<string, string> = {
    boxShadow: props.event.event_type === 'plan' 
      ? '0 1px 3px 0 rgba(245, 158, 11, 0.1)' 
      : undefined
  }
  
  if (props.isLeftSide) {
    // 时间轴左侧：颜色条在左边（外侧）
    baseStyle.borderLeftColor = themeColor.value
    baseStyle.borderLeftWidth = '4px'
    baseStyle.borderLeftStyle = 'solid'
  } else {
    // 时间轴右侧：颜色条在右边（外侧）
    baseStyle.borderRightColor = themeColor.value
    baseStyle.borderRightWidth = '4px'
    baseStyle.borderRightStyle = 'solid'
  }
  
  return baseStyle
}

// 类型标签样式
const typeBadgeClass = computed(() => {
  if (eventType.value === 'plan') {
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
  }
  return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
})

// 类型图标
const typeIcon = computed(() => {
  return eventType.value === 'plan' ? 'calendar_month' : 'history_edu'
})

// 类型标签文本
const typeLabel = computed(() => {
  return eventType.value === 'plan' ? '计划' : '记录'
})

// 心情配置
const moodConfig = computed(() => {
  const moods: Record<string, { icon: string; label: string; bg: string; iconClass: string }> = {
    happy: {
      icon: 'sentiment_very_satisfied',
      label: '开心',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconClass: 'text-yellow-600 dark:text-yellow-400'
    },
    calm: {
      icon: 'sentiment_satisfied',
      label: '平静',
      bg: 'bg-green-100 dark:bg-green-900/30',
      iconClass: 'text-green-600 dark:text-green-400'
    },
    sad: {
      icon: 'sentiment_dissatisfied',
      label: '难过',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-600 dark:text-blue-400'
    },
    excited: {
      icon: 'rocket_launch',
      label: '兴奋',
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      iconClass: 'text-pink-600 dark:text-pink-400'
    },
    tired: {
      icon: 'bedtime',
      label: '疲惫',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      iconClass: 'text-purple-600 dark:text-purple-400'
    }
  }
  return props.event.mood ? moods[props.event.mood] : null
})

// 心情图标
const moodIcon = computed(() => moodConfig.value?.icon || '')

// 心情标签
const moodLabel = computed(() => moodConfig.value?.label || '')

// 心情背景样式（添加边框和阴影）
const moodBgClass = computed(() => {
  const base = moodConfig.value?.bg || ''
  return `${base} shadow-sm`
})

// 心情图标样式
const moodIconClass = computed(() => moodConfig.value?.iconClass || '')

// 点击卡片
const handleCardClick = (e: MouseEvent) => {
  // 如果点击的是按钮，不触发卡片点击
  const target = e.target as HTMLElement
  if (target.closest('button')) {
    return
  }
  emit('click', props.event)
}

// 删除事件
const handleDelete = () => {
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  showDeleteDialog.value = false
  
  try {
    await eventStore.deleteEvent(props.event.id)
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 取消删除
const cancelDelete = () => {
  showDeleteDialog.value = false
}
</script>