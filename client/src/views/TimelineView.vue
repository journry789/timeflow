<template>
  <DefaultLayout>
    <div class="flex-1 overflow-y-auto relative bg-background-light dark:bg-background-dark">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative min-h-full">
        <!-- Timeline Container -->
        <TimelineAxis>
          <!-- Daily Summaries & Events -->
          <div class="space-y-12">
            <div
              v-for="(group, groupIndex) in groupedEvents"
              :key="group.date"
              class="relative"
            >
              <!-- Daily Summary Card -->
              <div class="relative w-full flex justify-center z-20 mb-8">
                <div class="bg-surface-light dark:bg-surface-dark w-full max-w-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                  <div class="p-5 flex items-start sm:items-center justify-between cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 gap-3" @click="toggleSummary(group.date)">
                    <div class="flex items-start sm:items-center gap-3 sm:gap-5 flex-1 min-w-0">
                      <!-- Date Display -->
                      <div class="bg-primary/10 dark:bg-primary/20 text-primary rounded-xl p-3 flex flex-col items-center justify-center min-w-[4rem] shadow-sm">
                        <span class="text-[10px] font-bold uppercase tracking-wider opacity-80">{{ formatDateDisplay(group.date).month }}</span>
                        <span class="text-2xl font-bold leading-none">{{ formatDateDisplay(group.date).day }}</span>
                      </div>
                      
                      <!-- Summary Info -->
                      <div class="flex flex-col flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span class="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 whitespace-nowrap">每日摘要</span>
                         
                          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 whitespace-nowrap">
                            <span class="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0"></span>
                            <span class="hidden sm:inline">{{ group.summary.planCount }} 个计划</span>
                            <span class="sm:hidden">{{ group.summary.planCount }}计划</span>
                          </span>
                          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 whitespace-nowrap">
                            <span class="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></span>
                            <span class="hidden sm:inline">{{ group.summary.recordCount }} 个记录</span>
                            <span class="sm:hidden">{{ group.summary.recordCount }}记录</span>
                          </span>
                          <span v-if="group.summary.mood" class="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-200 dark:border-slate-700 whitespace-nowrap">
                            <span class="material-symbols-outlined text-[16px] flex-shrink-0" :class="getMoodColor(group.summary.mood)" style="font-variation-settings: 'FILL' 1">{{ getMoodIcon(group.summary.mood) }}</span>
                            <span class="text-slate-600 dark:text-slate-300">{{ group.summary.moodLabel }}</span>
                          </span>
                        </div>
                        <h3 class="font-bold text-slate-800 dark:text-white text-base break-words">{{ group.summary.encouragement }}</h3>
                      </div>
                    </div>
                    
                    <!-- Expand Button -->
                    <button class="size-9 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 group-hover:bg-primary group-hover:text-white group-hover:border-primary text-slate-400 transition-all duration-300 flex-shrink-0 mt-0.5 sm:mt-0">
                      <span class="material-symbols-outlined transition-transform duration-300" :class="{ 'rotate-180': expandedSummaries.has(group.date) }">expand_more</span>
                    </button>
                  </div>
                  
                  <!-- Expanded Content -->
                  <div 
                    class="grid transition-[grid-template-rows] duration-500 ease-in-out"
                    :class="expandedSummaries.has(group.date) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
                  >
                    <div class="overflow-hidden">
                      <div class="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700 bg-surface-light dark:bg-surface-dark">
                        <div class="pt-4 flex flex-col gap-4">

                          <!-- Event Titles List -->
                          <div v-if="group.events.length > 0" class="flex flex-col gap-2">
                            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              事件列表
                            </div>
                            <div class="flex flex-col gap-1.5">
                              <button
                                v-for="event in group.events"
                                :key="event.id"
                                @click="scrollToEvent(event.id)"
                                class="text-left text-sm text-slate-700 dark:text-slate-300 hover:text-primary hover:underline transition-colors flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                <span class="material-symbols-outlined text-[16px]" :class="event.event_type === 'plan' ? 'text-amber-500' : 'text-blue-500'">
                                  {{ event.event_type === 'plan' ? 'calendar_month' : 'history_edu' }}
                                </span>
                                <span class="flex-1">{{ event.title }}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Events for this date -->
              <div class="space-y-10">
                <div
                  v-for="(event, eventIndex) in group.events"
                  :key="event.id"
                  :id="`event-${event.id}`"
                  class="relative group scroll-mt-20"
                >
                  <!-- Timeline Dot with Glow Effect -->
                  <div
                    class="absolute left-1/2 top-6 w-4 h-4 rounded-full border-2 border-surface-light dark:border-surface-dark transform -translate-x-1/2 z-20 shadow-lg transition-all duration-300 hover:scale-125 group-hover:shadow-xl"
                    :style="getTimelineDotStyle(event)"
                  ></div>

                  <!-- Event Card (Alternating left/right on desktop) -->
                  <div
                    class="w-full md:w-5/12 relative z-10"
                    :class="getCardPosition(event, groupIndex, eventIndex)"
                  >
                    <EventCard
                      :event="event"
                      :color="authStore.user?.color || '#2563EB'"
                      :show-actions="true"
                      :is-left-side="isCardOnLeftSide(event, groupIndex, eventIndex)"
                      @edit="handleEdit"
                      @click="handleCardClick"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!eventStore.loading && eventStore.events.length === 0" class="text-center py-20">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <span class="material-symbols-outlined text-4xl text-slate-400">event_available</span>
              </div>
              <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                还没有事件
              </h3>
              <p class="text-slate-500 dark:text-slate-400 mb-6">
                点击右下角按钮创建你的第一个事件
              </p>
              <button
                @click="showCreateModal = true"
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <span class="material-symbols-outlined">add</span>
                创建事件
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="eventStore.loading" class="text-center py-20">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p class="mt-4 text-slate-500 dark:text-slate-400">加载中...</p>
            </div>
          </div>
        </TimelineAxis>

        <!-- Floating Add Button (Desktop only) -->
        <button
          @click="showCreateModal = true"
          class="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover hover:shadow-xl transition-all duration-200 items-center justify-center z-40"
          title="创建新事件"
        >
          <span class="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </div>

    <!-- Create/Edit Event Modal -->
    <CreateEventModal
      :show="showCreateModal || showEditModal"
      :event="editingEvent"
      @close="closeModal"
      @created="handleCreated"
      @updated="handleUpdated"
    />

    <!-- Event Detail Modal -->
    <EventDetailModal
      :show="showDetailModal"
      :event="viewingEvent"
      :show-actions="true"
      @close="closeModal"
      @edit="handleEdit"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import dayjs from 'dayjs'
import { useEventStore } from '@/stores/event'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import TimelineAxis from '@/components/TimelineAxis.vue'
import EventCard from '@/components/EventCard.vue'
import CreateEventModal from '@/components/CreateEventModal.vue'
import EventDetailModal from '@/components/EventDetailModal.vue'
import type { Event } from '@/types/api'

const eventStore = useEventStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)

// 提供打开创建事件模态框的函数给子组件使用
provide('openCreateEventModal', () => {
  showCreateModal.value = true
})
const showEditModal = ref(false)
const showDetailModal = ref(false)
const editingEvent = ref<Event | null>(null)
const viewingEvent = ref<Event | null>(null)
const expandedSummaries = ref<Set<string>>(new Set())

// 按日期分组事件
interface DateGroup {
  date: string // YYYY-MM-DD
  events: Event[]
  summary: {
    eventCount: number
    planCount: number
    recordCount: number
    mood: 'happy' | 'calm' | 'sad' | 'excited' | 'tired' | null
    moodLabel: string
    encouragement: string
  }
}

const groupedEvents = computed<DateGroup[]>(() => {
  const groups: { [key: string]: DateGroup } = {}
  
  eventStore.sortedEvents.forEach(event => {
    const date = dayjs(event.event_date).format('YYYY-MM-DD')
    
    if (!groups[date]) {
      groups[date] = {
        date,
        events: [],
        summary: {
          eventCount: 0,
          planCount: 0,
          recordCount: 0,
          mood: null,
          moodLabel: '',
          encouragement: ''
        }
      }
    }
    
    groups[date].events.push(event)
  })
  
  // 计算每个日期组的摘要信息
  Object.values(groups).forEach(group => {
    group.summary.eventCount = group.events.length
    
    // 统计计划和记录数量
    group.summary.planCount = group.events.filter(e => e.event_type === 'plan').length
    group.summary.recordCount = group.events.filter(e => e.event_type === 'record').length
    
    // 根据心情图表计算心情分数
    // 开心2分，平静0分，难过-2分，兴奋1分，疲惫-1分
    const moodScores: { [key: string]: number } = {
      happy: 2,
      calm: 0,
      sad: -2,
      excited: 1,
      tired: -1
    }
    
    const moods = group.events.map(e => e.mood).filter(Boolean) as string[]
    if (moods.length > 0) {
      // 计算所有心情的总分
      const totalScore = moods.reduce((sum, mood) => {
        return sum + (moodScores[mood] || 0)
      }, 0)
      
      // 根据总分确定心情
      let calculatedMood: 'happy' | 'calm' | 'sad' | 'excited' | 'tired' | null = null
      if (totalScore >= 2) {
        calculatedMood = 'happy'
      } else if (totalScore <= -2) {
        calculatedMood = 'sad'
      } else if (totalScore === 0) {
        calculatedMood = 'calm'
      } else if (totalScore === 1) {
        calculatedMood = 'excited'
      } else if (totalScore === -1) {
        calculatedMood = 'tired'
      }
      
      group.summary.mood = calculatedMood
      
      // 心情标签
      const moodLabels: { [key: string]: string } = {
        happy: '开心',
        calm: '平静',
        sad: '难过',
        excited: '兴奋',
        tired: '疲惫'
      }
      group.summary.moodLabel = calculatedMood ? moodLabels[calculatedMood] : ''
    }
    
    // 根据心情生成鼓励语句
    group.summary.encouragement = getEncouragement(group.summary.mood)
  })
  
  return Object.values(groups).sort((a, b) => {
    return dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  })
})

// 格式化日期显示
const formatDateDisplay = (date: string) => {
  return {
    month: dayjs(date).format('M月'),
    day: dayjs(date).format('D')
  }
}

// 切换摘要展开状态
const toggleSummary = (date: string) => {
  if (expandedSummaries.value.has(date)) {
    expandedSummaries.value.delete(date)
  } else {
    expandedSummaries.value.add(date)
  }
}

// 心情图标映射
const getMoodIcon = (mood: string | null) => {
  const icons: { [key: string]: string } = {
    happy: 'sentiment_very_satisfied',
    calm: 'sentiment_satisfied',
    sad: 'sentiment_dissatisfied',
    excited: 'rocket_launch',
    tired: 'bedtime'
  }
  return mood ? icons[mood] || 'sentiment_satisfied' : 'sentiment_satisfied'
}

// 心情颜色（CSS 类）
const getMoodColor = (mood: string | null) => {
  const colors: { [key: string]: string } = {
    happy: 'text-yellow-500',
    calm: 'text-green-500',
    sad: 'text-blue-500',
    excited: 'text-pink-500',
    tired: 'text-purple-500'
  }
  return mood ? colors[mood] || 'text-amber-500' : 'text-amber-500'
}

// 心情颜色（十六进制，用于时间线点）
const moodColors: { [key: string]: string } = {
  happy: '#FBBF24',    // 黄色 - 开心
  calm: '#34D399',     // 绿色 - 平静
  sad: '#60A5FA',      // 蓝色 - 难过
  excited: '#F472B6',  // 粉色 - 兴奋
  tired: '#A78BFA'     // 紫色 - 疲惫
}

// 获取时间线点样式（根据心情或事件类型）
const getTimelineDotStyle = (event: Event) => {
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
    backgroundColor = authStore.user?.color || '#2563EB'
    shadowColor = 'rgba(37, 99, 235, 0.15)'
    shadowColorAlpha = 'rgba(37, 99, 235, 0.3)'
  }

  return {
    backgroundColor,
    boxShadow: `0 0 0 4px ${shadowColor}, 0 4px 6px -1px ${shadowColorAlpha}`
  }
}

// 根据心情生成鼓励语句
const getEncouragement = (mood: 'happy' | 'calm' | 'sad' | 'excited' | 'tired' | null): string => {
  const encouragements: { [key: string]: string[] } = {
    happy: [
      '✨ 今天真是美好的一天！继续保持这份快乐的心情！',
      '🌟 你的笑容是今天最美的风景，继续保持！',
      '💫 看到你这么开心，生活都变得更加美好！',
      '☀️ 保持这份阳光般的心情，你会越来越棒！',
      '🎉 今天过得很精彩，明天会更好！'
    ],
    excited: [
      '🚀 你的热情感染了周围的人，继续保持这份活力！',
      '⚡ 充满活力的你，就像一颗闪耀的星星！',
      '💪 保持这份激情，没有什么能阻挡你前进！',
      '🎊 兴奋的你充满了无限可能，加油！',
      '🔥 你的能量让人眼前一亮，继续保持！'
    ],
    calm: [
      '🌿 平静的心态是最好的礼物，保持这份宁静！',
      '🧘 你的内心平静如水，这是难能可贵的品质！',
      '🌸 保持这份从容，让每一天都如此美好！',
      '🍃 平静的日子也很珍贵，享受当下的美好！',
      '💚 你的平和心态让生活更加舒适，继续保持！'
    ],
    sad: [
      '💙 难过的时候不要一个人扛，记得有我们在你身边！',
      '🤗 今天的阴霾会过去，明天会有新的希望！',
      '💪 每个人都会有低谷，但你一定能够重新站起来！',
      '🌙 难过也是生活的一部分，给自己一点时间，你会好起来的！',
      '✨ 即使今天不够好，明天依然充满无限可能，加油！'
    ],
    tired: [
      '😴 累了就好好休息，身体是革命的本钱！',
      '🌙 疲惫的时候记得停下来，给自己充电！',
      '💤 休息是为了更好地出发，别太勉强自己！',
      '🧸 今天辛苦了，好好放松，明天又是新的一天！',
      '💙 疲惫时给自己一点温柔，你值得被好好对待！'
    ]
  }

  // 如果没有心情，返回默认语句
  if (!mood) {
    const defaultMessages = [
      '📝 记录下今天的点滴，让时间留下印记！',
      '🎯 每一天都是新的开始，继续努力！',
      '💫 生活因记录而更美好，保持这份习惯！'
    ]
    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
  }

  // 根据心情随机选择一句鼓励语
  const messages = encouragements[mood] || []
  return messages[Math.floor(Math.random() * messages.length)]
}

// 滚动到指定事件
const scrollToEvent = (eventId: string) => {
  const element = document.getElementById(`event-${eventId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    // 添加生动的高亮效果
    const cardElement = element.querySelector('.bg-surface-light, .bg-surface-dark')
    if (cardElement) {
      // 添加脉冲动画和发光效果
      cardElement.classList.add('highlight-event')
      
      // 2.5秒后移除高亮效果
      setTimeout(() => {
        cardElement.classList.remove('highlight-event')
      }, 2500)
    }
  }
}

// 判断卡片是否在时间轴左侧
const isCardOnLeftSide = (_event: Event, groupIndex: number, eventIndex: number): boolean => {
  // 根据日期组和事件索引计算全局索引（用于交替显示）
  // 计算前面所有日期组的事件总数 + 当前组内索引
  const previousEventsCount = groupedEvents.value
    .slice(0, groupIndex)
    .reduce((sum, g) => sum + g.events.length, 0)
  const totalIndex = previousEventsCount + eventIndex
  // 偶数索引在左侧（时间轴左侧），奇数索引在右侧（时间轴右侧）
  return totalIndex % 2 === 0
}

// 获取卡片位置（交替显示）
const getCardPosition = (event: Event, groupIndex: number, eventIndex: number) => {
  // 手机端全部靠右，桌面端交替显示
  return isCardOnLeftSide(event, groupIndex, eventIndex) ? 'md:ml-auto' : 'md:mr-auto'
}

// 点击卡片查看详情
const handleCardClick = (event: Event) => {
  viewingEvent.value = event
  showDetailModal.value = true
}

// 编辑事件
const handleEdit = (event: Event) => {
  editingEvent.value = event
  showEditModal.value = true
  showDetailModal.value = false
}

// 关闭模态框
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showDetailModal.value = false
  editingEvent.value = null
  viewingEvent.value = null
}

// 事件创建成功
const handleCreated = () => {
  // 事件已在 store 中添加，无需额外操作
  closeModal()
}

// 事件更新成功
const handleUpdated = () => {
  // 事件已在 store 中更新，无需额外操作
  closeModal()
}

// 加载事件列表
onMounted(async () => {
  if (eventStore.events.length === 0) {
    await eventStore.fetchEvents()
  }
})
</script>

<style scoped>
/* 事件高亮动画效果 - 更生动的视觉反馈 */
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