import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Friend, Friendship } from '@/types/api'
import { useApi } from '@/composables/useApi'
import { useToast } from 'vue-toastification'

export const useFriendStore = defineStore('friend', () => {
  const friends = ref<Friend[]>([])
  const pendingRequests = ref<Friendship[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取好友列表（accepted 状态）
   */
  const fetchFriends = async () => {
    loading.value = true
    error.value = null

    try {
      const { get } = useApi()
      const response = await get<Friend[]>('/friends')
      friends.value = response
    } catch (err: any) {
      error.value = err.message || '获取好友列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 发送好友请求
   */
  const sendFriendRequest = async (username: string) => {
    const toast = useToast()

    try {
      const { post } = useApi()
      await post('/friends/request', { username })
      toast.success(`已向 ${username} 发送好友请求`)
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 获取待处理的好友请求（接收到的请求）
   */
  const fetchPendingRequests = async () => {
    loading.value = true
    error.value = null

    try {
      const { get } = useApi()
      const response = await get<Friendship[]>('/friends/requests')
      pendingRequests.value = response
    } catch (err: any) {
      error.value = err.message || '获取好友请求失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 接受好友请求
   */
  const acceptFriendRequest = async (friendshipId: string) => {
    const toast = useToast()

    try {
      const { post } = useApi()
      const response = await post<Friendship>('/friends/accept', { friendshipId })
      
      toast.success('好友请求已接受')
      
      // 刷新好友列表和待处理请求
      await Promise.all([
        fetchFriends(),
        fetchPendingRequests()
      ])
      
      return response
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 拒绝好友请求
   */
  const rejectFriendRequest = async (friendshipId: string) => {
    const toast = useToast()

    try {
      const { post } = useApi()
      await post('/friends/reject', { friendshipId })
      
      toast.success('好友请求已拒绝')
      
      // 刷新待处理请求列表
      await fetchPendingRequests()
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 检查是否为好友
   */
  const isFriend = (username: string): boolean => {
    return friends.value.some(f => f.username === username)
  }

  /**
   * 根据用户名获取好友信息
   */
  const getFriendByUsername = (username: string): Friend | undefined => {
    return friends.value.find(f => f.username === username)
  }

  /**
   * 删除好友
   */
  const deleteFriend = async (username: string) => {
    const toast = useToast()

    try {
      const { delete: del } = useApi()
      await del(`/friends/${username}`)
      
      toast.success('好友已删除')
      
      // 刷新好友列表
      await fetchFriends()
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 删除好友请求（通过 friendshipId）
   */
  const deleteFriendRequest = async (friendshipId: string) => {
    const toast = useToast()

    try {
      const { delete: del } = useApi()
      await del(`/friends/request/${friendshipId}`)
      
      toast.success('请求已删除')
      
      // 刷新好友列表
      await fetchFriends()
    } catch (err: any) {
      throw err
    }
  }

  /**
   * 清空好友列表
   */
  const clearFriends = () => {
    friends.value = []
    pendingRequests.value = []
  }

  return {
    friends,
    pendingRequests,
    loading,
    error,
    fetchFriends,
    fetchPendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriend,
    deleteFriendRequest,
    isFriend,
    getFriendByUsername,
    clearFriends
  }
})