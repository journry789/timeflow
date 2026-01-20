import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Event } from '@/types/api'
import { useApi } from '@/composables/useApi'
import { useToast } from 'vue-toastification'

interface CreateEventData {
  event_date: string
  title: string
  content: string
  image_url?: string
  event_type?: 'plan' | 'record'
  mood?: 'happy' | 'calm' | 'sad' | 'excited' | 'tired'
}

interface UpdateEventData extends Partial<CreateEventData> {
  remove_image?: boolean // 用于指示是否移除图片
}

export const useEventStore = defineStore('event', () => {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性：按日期排序的事件列表（降序）
  const sortedEvents = computed(() => {
    return [...events.value].sort((a, b) => {
      return new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    })
  })

  /**
   * 获取所有事件
   */
  const fetchEvents = async () => {
    loading.value = true
    error.value = null

    try {
      const { get } = useApi()
      const response = await get<Event[]>('/api/events')
      events.value = response
    } catch (err: any) {
      error.value = err.message || '获取事件列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单个事件
   */
  const fetchEventById = async (id: string) => {
    try {
      const { get } = useApi()
      return await get<Event>(`/api/events/${id}`)
    } catch (err) {
      throw err
    }
  }

  /**
   * 创建事件（支持文件上传）
   */
  const createEvent = async (data: CreateEventData, file?: File | null) => {
    const toast = useToast()

    try {
      const { post } = useApi()
      let newEvent: Event

      // 如果有文件，使用 FormData
      if (file) {
        const formData = new FormData()
        formData.append('event_date', data.event_date)
        formData.append('title', data.title)
        formData.append('content', data.content)
        if (data.event_type) {
          formData.append('event_type', data.event_type)
        }
        if (data.mood) {
          formData.append('mood', data.mood)
        }
        formData.append('image', file)

        newEvent = await post<Event>('/api/events', formData)
      } else {
        // 没有文件，使用 JSON
        newEvent = await post<Event>('/api/events', {
          event_date: data.event_date,
          title: data.title,
          content: data.content,
          image_url: data.image_url,
          event_type: data.event_type,
          mood: data.mood
        })
      }

      // 添加到列表开头
      events.value.unshift(newEvent)

      toast.success('事件创建成功')
      return newEvent
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 更新事件（支持文件上传）
   */
  const updateEvent = async (id: string, data: UpdateEventData, file?: File | null) => {
    const toast = useToast()

    try {
      const { put } = useApi()
      let updatedEvent: Event

      // 如果有文件或需要删除图片，使用 FormData
      if (file || data.remove_image) {
        const formData = new FormData()
        if (data.event_date) {
          formData.append('event_date', data.event_date)
        }
        if (data.title) {
          formData.append('title', data.title)
        }
        if (data.content) {
          formData.append('content', data.content)
        }
        if (data.event_type) {
          formData.append('event_type', data.event_type)
        }
        if (data.mood !== undefined) {
          formData.append('mood', data.mood || '')
        }
        if (file) {
          formData.append('image', file)
        }
        if (data.remove_image) {
          formData.append('remove_image', 'true')
        }

        updatedEvent = await put<Event>(`/api/events/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        // 没有文件，使用 JSON
        updatedEvent = await put<Event>(`/api/events/${id}`, data)
      }

      // 更新列表中的事件
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }

      toast.success('事件更新成功')
      return updatedEvent
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 删除事件
   */
  const deleteEvent = async (id: string) => {
    const toast = useToast()

    try {
      const { delete: del } = useApi()
      await del(`/api/events/${id}`)

      // 从列表中移除
      events.value = events.value.filter(e => e.id !== id)

      toast.success('事件删除成功')
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 清空事件列表
   */
  const clearEvents = () => {
    events.value = []
  }

  return {
    events,
    loading,
    error,
    sortedEvents,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    clearEvents
  }
})