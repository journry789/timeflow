/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 用户信息
 */
export interface User {
  id: string
  email: string
  username: string
  display_name?: string
  avatar_url?: string
  color: string
  created_at?: string
  updated_at?: string
}

/**
 * 事件
 */
export interface Event {
  id: string
  user_id: string
  event_date: string
  title: string
  content: string
  image_url?: string
  event_type?: 'plan' | 'record'
  mood?: 'happy' | 'calm' | 'sad' | 'excited' | 'tired'
  created_at: string
  updated_at: string
}

/**
 * 好友关系
 */
export interface Friend {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  color: string
  friendship_id?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'blocked'
  is_sender?: boolean
  requested_at?: string
}

/**
 * 好友请求
 */
export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  requested_at: string
  updated_at: string
  friend?: Friend
  user?: Friend
}

/**
 * 合并时间线数据
 */
export interface MergeTimeline {
  me: {
    username: string
    color: string
    avatar_url?: string
    events: Event[]
  }
  friend: {
    username: string
    color: string
    avatar_url?: string
    events: Event[]
  }
}