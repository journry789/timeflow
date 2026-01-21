<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
          <!-- Header -->
          <header class="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 px-6 pt-5 pb-4 flex items-center justify-between z-10 backdrop-blur-sm bg-surface-light/95 dark:bg-surface-dark/95">
            <div class="flex items-center gap-3">
              <!-- Date Badge -->
              <div class="bg-primary/10 dark:bg-primary/20 text-primary rounded-xl px-4 py-2 flex flex-col items-center justify-center shadow-sm">
                <span class="text-[10px] font-bold uppercase tracking-wider opacity-80">{{ formattedMonth }}</span>
                <span class="text-xl font-bold leading-none">{{ formattedDay }}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-1">
                  <!-- Type Badge -->
                  <span
                    class="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1"
                    :class="typeBadgeClass"
                  >
                    <span class="material-symbols-outlined text-[14px]">{{ typeIcon }}</span>
                    <span>{{ typeLabel }}</span>
                  </span>
                  <!-- Mood Badge -->
                  <span
                    v-if="event && event.mood"
                    class="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1"
                    :class="moodBadgeClass"
                  >
                    <span class="material-symbols-outlined text-[14px]">{{ moodIcon }}</span>
                    <span>{{ moodLabel }}</span>
                  </span>
                </div>
                <span v-if="event" class="text-xs text-slate-500 dark:text-slate-400">{{ formattedTime }}</span>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-500 dark:hover:text-slate-300"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          <!-- Content (Scrollable) -->
          <div class="flex-1 overflow-y-auto">
            <!-- Title -->
            <div v-if="event" class="px-6 pt-6 pb-4">
              <h1 class="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {{ event.title }}
              </h1>
            </div>

            <!-- Image -->
            <div v-if="event && event.image_url" class="px-6 pb-4">
              <div class="rounded-xl overflow-hidden">
                <img
                  :src="getImageUrl(event.image_url)"
                  :alt="event.title"
                  class="w-full max-h-[500px] object-contain rounded-xl shadow-lg"
                  @error="(e: globalThis.Event) => handleImageError(e)"
                />
              </div>
            </div>

            <!-- Content -->
            <div v-if="event" class="px-6 pb-6">
              <div class="prose prose-slate dark:prose-invert max-w-none">
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {{ event.content }}
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <footer
            v-if="showActions"
            class="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50"
          >
            <button
              @click="handleEdit"
              class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">edit</span>
              编辑
            </button>
            <button
              @click="handleDelete"
              class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium text-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
              删除
            </button>
          </footer>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirm Dialog -->
    <DeleteConfirmDialog
      v-if="event"
      :show="showDeleteDialog"
      :message="`确定要删除「${event.title}」吗？此操作无法撤销。`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import type { Event } from '@/types/api'
import { useEventStore } from '@/stores/event'
import DeleteConfirmDialog from './DeleteConfirmDialog.vue'

interface Props {
  show: boolean
  event: Event | null
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  event: null,
  showActions: false
})

const emit = defineEmits<{
  close: []
  edit: [event: Event]
}>()

const eventStore = useEventStore()

// 获取完整图片 URL
const getImageUrl = (imagePath?: string | null): string => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return `${apiUrl}${imagePath}`
}

// 图片加载错误处理
const handleImageError = (e: globalThis.Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// 格式化日期
const formattedMonth = computed(() => {
  if (!props.event) return ''
  return dayjs(props.event.event_date).format('M月')
})

const formattedDay = computed(() => {
  if (!props.event) return ''
  return dayjs(props.event.event_date).format('D')
})

const formattedTime = computed(() => {
  if (!props.event) return ''
  return dayjs(props.event.event_date).format('YYYY年 M月 D日 HH:mm')
})

// 事件类型配置
const eventType = computed(() => props.event?.event_type || 'record')

const typeIcon = computed(() => {
  return eventType.value === 'plan' ? 'calendar_month' : 'history_edu'
})

const typeLabel = computed(() => {
  return eventType.value === 'plan' ? '计划' : '记录'
})

const typeBadgeClass = computed(() => {
  if (eventType.value === 'plan') {
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
  }
  return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
})

// 心情配置
const moodConfig = computed(() => {
  if (!props.event?.mood) return null
  
  const moods: Record<string, { icon: string; label: string; bg: string; text: string }> = {
    happy: {
      icon: 'sentiment_very_satisfied',
      label: '开心',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300'
    },
    calm: {
      icon: 'sentiment_satisfied',
      label: '平静',
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300'
    },
    sad: {
      icon: 'sentiment_dissatisfied',
      label: '难过',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300'
    },
    excited: {
      icon: 'rocket_launch',
      label: '兴奋',
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      text: 'text-pink-700 dark:text-pink-300'
    },
    tired: {
      icon: 'bedtime',
      label: '疲惫',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300'
    }
  }
  return props.event.mood ? moods[props.event.mood] : null
})

const moodIcon = computed(() => moodConfig.value?.icon || '')
const moodLabel = computed(() => moodConfig.value?.label || '')
const moodBadgeClass = computed(() => {
  if (!moodConfig.value) return ''
  return `${moodConfig.value.bg} ${moodConfig.value.text} border border-slate-200 dark:border-slate-700`
})

// 编辑事件
const handleEdit = () => {
  if (props.event) {
    emit('edit', props.event)
    // 不在这里关闭，让父组件处理关闭逻辑
  }
}

// 删除事件
const showDeleteDialog = ref(false)

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  showDeleteDialog.value = false
  if (props.event) {
    try {
      await eventStore.deleteEvent(props.event.id)
      emit('close')
    } catch (error) {
      // 错误已在 store 中处理
    }
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}
</script>

<style scoped>
/* Modal Animation - 生动的弹出效果 */
.modal-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.85) translateY(30px) rotateX(5deg);
  opacity: 0;
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #475569;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
