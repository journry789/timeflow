<template>
  <DefaultLayout>
    <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative">
      <!-- Header -->
      <header class="fixed top-16 left-0 right-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <router-link
              to="/friends"
              class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 pb-1"
            >
              <span class="material-symbols-outlined">arrow_back</span>
            </router-link>
            <div>
              <h1 class="text-lg font-bold text-slate-800 dark:text-white tracking-wide">
                与 {{ mergeData?.friend.username || friendUsername }} 的合并时间线
              </h1>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                共记录 {{ totalEvents }} 个瞬间
              </p>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 relative min-h-full">
        <!-- Timeline Container -->
        <TimelineAxis>

        <!-- Single User Info Pill at top (Desktop only) -->
        <div v-if="mergeData" class="hidden md:flex justify-center mb-8">
          <div class="relative w-full max-w-lg">
            <div class="relative flex items-center bg-surface-light dark:bg-surface-dark rounded-full shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <!-- Left Avatar: Friend -->
              <div class="absolute left-2 z-10">
                <div
                  class="w-8 h-8 rounded-full border-2 overflow-hidden shadow-sm flex items-center justify-center"
                  :style="{ borderColor: mergeData?.friend.color || '#E879F9' }"
                >
                  <img
                    v-if="mergeData?.friend?.avatar_url"
                    :src="getAvatarUrl(mergeData.friend.avatar_url)"
                    alt="Friend"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-white font-semibold text-xs"
                    :style="{ backgroundColor: mergeData?.friend?.color || '#E879F9' }"
                  >
                    {{ (mergeData?.friend?.username || friendUsername || 'F').charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>

              <!-- Center Content: Usernames -->
              <div class="flex-1 flex items-center justify-between px-12 py-2.5">
                <div class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate text-left flex-1">
                  {{ mergeData?.friend?.username || friendUsername }}
                </div>
                <div class="w-[1px] h-6 bg-slate-300 dark:bg-slate-600 mx-2 flex-shrink-0"></div>
                <div class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate text-right flex-1">
                  我
                </div>
              </div>

              <!-- Right Avatar: Me -->
              <div class="absolute right-2 z-10">
                <div
                  class="w-8 h-8 rounded-full border-2 overflow-hidden shadow-sm flex items-center justify-center"
                  :style="{ borderColor: mergeData?.me?.color || '#2563EB' }"
                >
                  <img
                    v-if="mergeData?.me?.avatar_url"
                    :src="getAvatarUrl(mergeData.me.avatar_url)"
                    alt="Me"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-white font-semibold text-xs"
                    :style="{ backgroundColor: mergeData?.me?.color || '#2563EB' }"
                  >
                    {{ (authStore.user?.username || 'M').charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-4 text-slate-500 dark:text-slate-400">加载中...</p>
        </div>

        <!-- Timeline Events -->
        <div v-else-if="mergedEvents.length > 0" class="space-y-12">
          <div
            v-for="(dateGroup, _dateIndex) in groupedEvents"
            :key="dateGroup.date"
            class="relative"
          >
            <!-- Date Label -->
            <div class="flex justify-center mb-10">
              <span class="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full shadow-md border border-slate-200 dark:border-slate-700">
                {{ formatDateLabel(dateGroup.date) }}
              </span>
            </div>

            <!-- Events for this date -->
            <div class="space-y-10">
              <div
                v-for="(event, _eventIndex) in dateGroup.events"
                :key="event.id"
                :id="`event-${event.id}`"
                class="relative group scroll-mt-20"
              >
                <!-- Timeline Dot with Glow Effect -->
                <div
                  class="absolute left-1/2 top-6 w-4 h-4 rounded-full border-2 border-surface-light dark:border-surface-dark transform -translate-x-1/2 z-20 shadow-lg transition-all duration-300 hover:scale-125 group-hover:shadow-xl"
                  :style="getTimelineDotStyle(event, event.owner)"
                ></div>

                <!-- Event Card (Alternating left/right based on owner) -->
                <div
                  class="w-full md:w-5/12 relative z-10"
                  :class="event.owner === 'friend' ? 'md:ml-auto' : 'md:mr-auto'"
                >
                  <EventCard
                    :event="event"
                    :color="event.owner === 'friend' ? (mergeData?.friend.color || '#E879F9') : (mergeData?.me.color || '#2563EB')"
                    :show-actions="false"
                    :is-left-side="event.owner === 'friend'"
                    :publisher-avatar="event.owner === 'friend' ? getAvatarUrl(mergeData?.friend.avatar_url) : getAvatarUrl(mergeData?.me.avatar_url)"
                    :publisher-color="event.owner === 'friend' ? (mergeData?.friend.color || '#E879F9') : (mergeData?.me.color || '#2563EB')"
                    :publisher-username="event.owner === 'friend' ? (mergeData?.friend.username || friendUsername) : (authStore.user?.username || '我')"
                    @click="handleCardClick"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <span class="material-symbols-outlined text-4xl text-slate-400">timeline</span>
          </div>
          <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            没有事件
          </h3>
          <p class="text-slate-500 dark:text-slate-400">
            你们还没有创建任何事件
          </p>
        </div>
        </TimelineAxis>
      </main>

      <!-- Event Detail Modal -->
      <EventDetailModal
        :show="showDetailModal"
        :event="viewingEvent"
        :show-actions="false"
        @close="closeDetailModal"
      />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import type { Event, MergeTimeline } from '@/types/api'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import TimelineAxis from '@/components/TimelineAxis.vue'
import EventCard from '@/components/EventCard.vue'
import EventDetailModal from '@/components/EventDetailModal.vue'
import { getAvatarUrl } from '@/utils/imageUtils'

const route = useRoute()
const authStore = useAuthStore()

const friendUsername = computed(() => route.params.username as string)
const loading = ref(false)
const mergeData = ref<MergeTimeline | null>(null)
const showDetailModal = ref(false)
const viewingEvent = ref<Event | null>(null)

// 合并所有事件并按日期分组
const mergedEvents = computed(() => {
  if (!mergeData.value) return []
  
  const allEvents: (Event & { owner: 'me' | 'friend' })[] = [
    ...mergeData.value.me.events.map(e => ({ ...e, owner: 'me' as const })),
    ...mergeData.value.friend.events.map(e => ({ ...e, owner: 'friend' as const }))
  ]
  
  return allEvents.sort((a, b) => {
    return new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  })
})

// 按日期分组事件，并在每个日期内按时间排序
interface DateGroup {
  date: string
  events: (Event & { owner: 'me' | 'friend' })[]
}

const groupedEvents = computed<DateGroup[]>(() => {
  const groups: { [key: string]: DateGroup } = {}
  
  mergedEvents.value.forEach(event => {
    const date = dayjs(event.event_date).format('YYYY-MM-DD')
    
    if (!groups[date]) {
      groups[date] = {
        date,
        events: []
      }
    }
    
    groups[date].events.push(event)
  })
  
  // 对每个日期组内的事件按时间排序（降序）
  Object.values(groups).forEach(group => {
    group.events.sort((a, b) => {
      return new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    })
  })
  
  return Object.values(groups).sort((a, b) => {
    return dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  })
})

// 总事件数
const totalEvents = computed(() => {
  return mergedEvents.value.length
})

// 格式化日期标签
const formatDateLabel = (date: string) => {
  return dayjs(date).format('YYYY年 M月 D日')
}

// 格式化事件时间 - 未使用但保留以备将来使用
// const formatEventTime = (date: string) => {
//   return dayjs(date).format('M月D日 • HH:mm')
// }

// 心情颜色（十六进制，用于时间线点）
const moodColors: { [key: string]: string } = {
  happy: '#FBBF24',    // 黄色 - 开心
  calm: '#34D399',     // 绿色 - 平静
  sad: '#60A5FA',      // 蓝色 - 难过
  excited: '#F472B6',  // 粉色 - 兴奋
  tired: '#A78BFA'     // 紫色 - 疲惫
}

// 获取时间线点样式（根据心情或事件类型）
const getTimelineDotStyle = (event: Event, owner: 'me' | 'friend') => {
  // 如果有心情，使用心情颜色
  let backgroundColor: string
  let shadowColor: string
  let shadowColorAlpha: string

  if (event.mood && moodColors[event.mood]) {
    backgroundColor = moodColors[event.mood]
    // 根据心情生成对应的阴影颜色
    const shadowColors: { [key: string]: { light: string; dark: string } } = {
      happy: { light: 'rgba(251, 191, 36, 0.15)', dark: 'rgba(251, 191, 36, 0.3)' },
      calm: { light: 'rgba(52, 211, 153, 0.15)', dark: 'rgba(52, 211, 153, 0.3)' },
      sad: { light: 'rgba(96, 165, 250, 0.15)', dark: 'rgba(96, 165, 250, 0.3)' },
      excited: { light: 'rgba(244, 114, 182, 0.15)', dark: 'rgba(244, 114, 182, 0.3)' },
      tired: { light: 'rgba(167, 139, 250, 0.15)', dark: 'rgba(167, 139, 250, 0.3)' }
    }
    const colors = shadowColors[event.mood] || { light: 'rgba(148, 163, 184, 0.15)', dark: 'rgba(148, 163, 184, 0.3)' }
    shadowColor = colors.light
    shadowColorAlpha = colors.dark
  } else if (event.event_type === 'plan') {
    // 计划类型使用琥珀色
    backgroundColor = '#F59E0B'
    shadowColor = 'rgba(245, 158, 11, 0.15)'
    shadowColorAlpha = 'rgba(245, 158, 11, 0.3)'
  } else {
    // 记录类型使用用户颜色
    if (owner === 'friend') {
      backgroundColor = mergeData.value?.friend.color || '#E879F9'
      shadowColor = 'rgba(232, 121, 249, 0.15)'
      shadowColorAlpha = 'rgba(232, 121, 249, 0.3)'
    } else {
      backgroundColor = mergeData.value?.me.color || '#2563EB'
      shadowColor = 'rgba(37, 99, 235, 0.15)'
      shadowColorAlpha = 'rgba(37, 99, 235, 0.3)'
    }
  }

  return {
    backgroundColor,
    boxShadow: `0 0 0 4px ${shadowColor}, 0 4px 6px -1px ${shadowColorAlpha}`
  }
}

// 点击卡片查看详情
const handleCardClick = (event: Event) => {
  viewingEvent.value = event
  showDetailModal.value = true
}

// 关闭详情 Modal
const closeDetailModal = () => {
  showDetailModal.value = false
  viewingEvent.value = null
}

// 获取完整图片 URL - 未使用但保留以备将来使用
// const getImageUrl = (imagePath?: string | null): string => {
//   if (!imagePath) return ''
//   // 如果已经是完整 URL，直接返回
//   if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//     return imagePath
//   }
//   // 如果是相对路径（如 /uploads/xxx.jpg），拼接 API URL
//   const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
//   return `${apiUrl}${imagePath}`
// }

// 图片加载错误处理 - 未使用但保留以备将来使用
// const handleImageError = (e: globalThis.Event) => {
//   const target = e.target as HTMLImageElement
//   target.style.display = 'none'
// }

// 加载合并时间线数据
const loadMergeData = async () => {
  loading.value = true
  
  try {
    const { get } = useApi()
    const data = await get<MergeTimeline>(`/api/merge/${friendUsername.value}`)
    mergeData.value = data
  } catch (error) {
    console.error('Failed to load merge data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMergeData()
})
</script>

<style scoped>
/* 事件高亮动画效果 - 与 TimelineView 一致 */
:deep(.highlight-event) {
  animation: highlightPulse 2.5s ease-in-out;
  position: relative;
  z-index: 10;
}

:deep(.highlight-event::before) {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 1rem;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.5) 0%,
    rgba(147, 51, 234, 0.5) 25%,
    rgba(236, 72, 153, 0.5) 50%,
    rgba(147, 51, 234, 0.5) 75%,
    rgba(59, 130, 246, 0.5) 100%
  );
  background-size: 200% 200%;
  z-index: -1;
  animation: highlightGlow 2.5s ease-in-out, gradientShift 3s ease-in-out infinite;
  filter: blur(8px);
  opacity: 0;
}

@keyframes highlightPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4),
                0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  20% {
    transform: scale(1.03);
    box-shadow: 0 0 25px 10px rgba(59, 130, 246, 0.6),
                0 0 50px 20px rgba(147, 51, 234, 0.4),
                0 8px 16px -4px rgba(0, 0, 0, 0.2);
  }
  40% {
    transform: scale(1.01);
    box-shadow: 0 0 15px 6px rgba(59, 130, 246, 0.5),
                0 0 30px 12px rgba(236, 72, 153, 0.3),
                0 6px 12px -3px rgba(0, 0, 0, 0.15);
  }
  60% {
    transform: scale(1.02);
    box-shadow: 0 0 20px 8px rgba(147, 51, 234, 0.5),
                0 0 40px 16px rgba(59, 130, 246, 0.3),
                0 7px 14px -3px rgba(0, 0, 0, 0.18);
  }
  80% {
    transform: scale(1.01);
    box-shadow: 0 0 10px 4px rgba(236, 72, 153, 0.4),
                0 5px 10px -2px rgba(0, 0, 0, 0.12);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0),
                0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
}

@keyframes highlightGlow {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  20% {
    opacity: 0.9;
    transform: scale(1.08);
  }
  40% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  60% {
    opacity: 0.5;
    transform: scale(1.03);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>