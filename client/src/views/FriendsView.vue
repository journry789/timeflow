<template>
  <DefaultLayout>
    <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- Header -->
        <div class="mb-8 flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">好友列表</h1>
            <p class="text-slate-500 dark:text-slate-400">管理和查看你的好友</p>
          </div>
          <button
            @click="showSearchModal = true"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2"
          >
            <span class="material-symbols-outlined">person_add</span>
            <span>添加好友</span>
          </button>
        </div>

        <!-- Search Friends -->
        <div class="mb-6">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-slate-400">search</span>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索好友..."
              class="block w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <!-- Friends List -->
        <div v-if="!friendStore.loading" class="space-y-6">
          <!-- Pending Requests (Received) -->
          <div v-if="friendStore.pendingRequests.length > 0" class="space-y-3">
            <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              待处理的好友请求 ({{ friendStore.pendingRequests.length }})
            </h2>
            <div class="space-y-2">
              <div
                v-for="request in friendStore.pendingRequests"
                :key="request.id"
                class="bg-surface-light dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <!-- Avatar -->
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                    :style="{ backgroundColor: request.user?.color || '#2563EB' }"
                  >
                    <span v-if="request.user?.avatar_url">
                      <img :src="getAvatarUrl(request.user.avatar_url)" :alt="request.user.username" class="w-full h-full rounded-full object-cover" />
                    </span>
                    <span v-else class="text-lg">
                      {{ request.user?.username?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                  
                  <!-- User Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-slate-900 dark:text-white truncate">
                      {{ request.user?.username }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      {{ formatRequestTime(request.requested_at) }}
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    @click="handleAcceptRequest(request.id)"
                    :disabled="processingRequest === request.id"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="processingRequest === request.id">处理中...</span>
                    <span v-else>同意</span>
                  </button>
                  <button
                    @click="handleRejectRequest(request.id)"
                    :disabled="processingRequest === request.id"
                    class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sent Requests (Pending) -->
          <div v-if="sentRequests.length > 0">
            <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              已发出的好友请求 ({{ sentRequests.length }})
            </h2>
            <div class="space-y-2">
              <FriendItem
                v-for="friend in sentRequests"
                :key="friend.id"
                :friend="friend"
                :status="friend.status"
              />
            </div>
          </div>

          <!-- Accepted Friends -->
          <div v-if="acceptedFriends.length > 0">
            <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              我的好友 ({{ acceptedFriends.length }})
            </h2>
            <div class="space-y-2">
              <FriendItem
                v-for="friend in acceptedFriends"
                :key="friend.id"
                :friend="friend"
                :status="friend.status"
                @merge="handleMerge"
                @delete="handleDeleteFriend"
              />
            </div>
          </div>

          <!-- Rejected Requests -->
          <div v-if="rejectedRequests.length > 0">
            <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              被拒绝的好友请求 ({{ rejectedRequests.length }})
            </h2>
            <div class="space-y-2">
              <FriendItem
                v-for="friend in rejectedRequests"
                :key="friend.id"
                :friend="friend"
                :status="friend.status"
                :friendship-id="friend.friendship_id"
                @resend-request="handleResendRequest"
                @delete-request="handleDeleteRequest"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="acceptedFriends.length === 0 && sentRequests.length === 0 && rejectedRequests.length === 0 && friendStore.pendingRequests.length === 0" class="text-center py-20">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <span class="material-symbols-outlined text-4xl text-slate-400">group</span>
            </div>
            <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {{ searchQuery ? '没有找到好友' : '还没有好友' }}
            </h3>
            <p class="text-slate-500 dark:text-slate-400">
              {{ searchQuery ? '尝试使用其他关键词搜索' : '添加好友开始合并时间线' }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="mt-4 text-slate-500 dark:text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- Search User Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showSearchModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            @click.self="closeSearchModal"
          >
            <div class="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
              <!-- Modal Header -->
              <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">搜索用户</h2>
                <button
                  @click="closeSearchModal"
                  class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <!-- Search Input -->
              <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="material-symbols-outlined text-slate-400">search</span>
                    </div>
                    <input
                      v-model="searchUserQuery"
                      type="text"
                      placeholder="输入用户名或邮箱..."
                      class="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      @keyup.enter="handleSearchUsers"
                    />
                  </div>
                  <button
                    @click="handleSearchUsers"
                    :disabled="!searchUserQuery.trim() || searchingUsers"
                    class="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="searchingUsers">搜索中...</span>
                    <span v-else>搜索</span>
                  </button>
                </div>
              </div>

              <!-- Search Results -->
              <div class="flex-1 overflow-y-auto p-6">
                <div v-if="searchingUsers" class="text-center py-8">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p class="mt-4 text-slate-500 dark:text-slate-400">搜索中...</p>
                </div>

                <div v-else-if="searchUserQuery && searchResults.length === 0" class="text-center py-8">
                  <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">person_search</span>
                  <p class="text-slate-500 dark:text-slate-400">未找到用户</p>
                </div>

                <div v-else-if="!searchUserQuery" class="text-center py-8">
                  <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">search</span>
                  <p class="text-slate-500 dark:text-slate-400">输入用户名或邮箱进行搜索</p>
                </div>

                <div v-else class="space-y-2">
                  <div
                    v-for="user in searchResults"
                    :key="user.id"
                    class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <!-- Avatar -->
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                      :style="{ backgroundColor: user.color || '#2563EB' }"
                    >
                      <img
                        v-if="user.avatar_url"
                        :src="getAvatarUrl(user.avatar_url)"
                        :alt="user.username"
                        class="w-full h-full rounded-full object-cover"
                      />
                      <span v-else class="text-sm">
                        {{ user.username?.charAt(0).toUpperCase() || '?' }}
                      </span>
                    </div>

                    <!-- User Info -->
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-slate-900 dark:text-white truncate">
                        {{ user.username }}
                      </p>
                      <p v-if="user.display_name" class="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {{ user.display_name }}
                      </p>
                    </div>

                    <!-- Add Button -->
                    <button
                      @click="handleAddFriendFromSearch(user.username)"
                      :disabled="sendingRequestTo === user.username || friendStore.isFriend(user.username)"
                      class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span v-if="sendingRequestTo === user.username">发送中...</span>
                      <span v-else-if="friendStore.isFriend(user.username)">已是好友</span>
                      <span v-else>添加</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Delete Friend Confirm Dialog -->
      <DeleteConfirmDialog
        :show="showDeleteDialog"
        :message="deleteConfirmMessage"
        @confirm="confirmDeleteFriend"
        @cancel="cancelDeleteFriend"
      />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Teleport, Transition } from 'vue'
import { useFriendStore } from '@/stores/friend'
import { useToast } from 'vue-toastification'
import { useApi } from '@/composables/useApi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import FriendItem from '@/components/FriendItem.vue'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue'
import type { Friend, User } from '@/types/api'
import { getAvatarUrl } from '@/utils/imageUtils'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const friendStore = useFriendStore()
const toast = useToast()
const { get } = useApi()

const searchQuery = ref('')
const processingRequest = ref<string | null>(null)

// Search Modal
const showSearchModal = ref(false)
const searchUserQuery = ref('')
const searchingUsers = ref(false)
const searchResults = ref<User[]>([])
const sendingRequestTo = ref<string | null>(null)

// Delete Friend Dialog
const showDeleteDialog = ref(false)
const friendToDelete = ref<Friend | null>(null)
const deleteConfirmMessage = computed(() => {
  if (friendToDelete.value) {
    return `删除好友后双方不能相互合并时间线，确实要删除 ${friendToDelete.value.username} 吗？`
  }
  return '删除好友后双方不能相互合并时间线，确实要删除吗？'
})

// 过滤后的好友列表
const filteredFriends = computed(() => {
  if (!searchQuery.value) {
    return friendStore.friends
  }
  
  const query = searchQuery.value.toLowerCase()
  return friendStore.friends.filter(friend => 
    friend.username.toLowerCase().includes(query) ||
    (friend.display_name && friend.display_name.toLowerCase().includes(query))
  )
})

// 按状态分组的好友列表
const acceptedFriends = computed(() => {
  return filteredFriends.value.filter(f => f.status === 'accepted')
})

const sentRequests = computed(() => {
  return filteredFriends.value.filter(f => 
    f.status === 'pending' && f.is_sender
  )
})

const rejectedRequests = computed(() => {
  return filteredFriends.value.filter(f => 
    f.status === 'rejected'
  )
})

// 搜索用户
const handleSearchUsers = async () => {
  if (!searchUserQuery.value.trim()) return

  searchingUsers.value = true
  searchResults.value = []

  try {
    const response = await get<User[]>(`/api/users/search?q=${encodeURIComponent(searchUserQuery.value.trim())}`)
    searchResults.value = response
  } catch (error: any) {
    toast.error(error.message || '搜索失败')
    searchResults.value = []
  } finally {
    searchingUsers.value = false
  }
}

// 从搜索结果添加好友
const handleAddFriendFromSearch = async (username: string) => {
  sendingRequestTo.value = username

  try {
    await friendStore.sendFriendRequest(username)
    // 刷新好友列表
    await friendStore.fetchFriends()
    // 从搜索结果中移除已添加的好友
    searchResults.value = searchResults.value.filter(u => u.username !== username)
  } catch (error) {
    // 错误已在 store 中处理
  } finally {
    sendingRequestTo.value = null
  }
}

// 关闭搜索模态框
const closeSearchModal = () => {
  showSearchModal.value = false
  searchUserQuery.value = ''
  searchResults.value = []
  sendingRequestTo.value = null
}

// 合并时间线
const handleMerge = (friend: Friend) => {
  router.push(`/merge/${friend.username}`)
}

// 删除好友
const handleDeleteFriend = (friend: Friend) => {
  friendToDelete.value = friend
  showDeleteDialog.value = true
}

const confirmDeleteFriend = async () => {
  if (!friendToDelete.value) return

  try {
    await friendStore.deleteFriend(friendToDelete.value.username)
    showDeleteDialog.value = false
    friendToDelete.value = null
  } catch (error) {
    // 错误已在 store 中处理
  }
}

const cancelDeleteFriend = () => {
  showDeleteDialog.value = false
  friendToDelete.value = null
}

// 重新发送好友请求（针对被拒绝的请求）
const handleResendRequest = async (friend: Friend) => {
  try {
    await friendStore.sendFriendRequest(friend.username)
    // 刷新好友列表
    await friendStore.fetchFriends()
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 删除被拒绝的好友请求
const handleDeleteRequest = async (friendshipId: string) => {
  try {
    await friendStore.deleteFriendRequest(friendshipId)
    // 刷新好友列表
    await friendStore.fetchFriends()
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 格式化请求时间
const formatRequestTime = (time: string) => {
  return dayjs(time).fromNow()
}

// 接受好友请求
const handleAcceptRequest = async (friendshipId: string) => {
  processingRequest.value = friendshipId
  try {
    await friendStore.acceptFriendRequest(friendshipId)
    // 刷新好友列表
    await friendStore.fetchFriends()
  } catch (error) {
    // 错误已在 store 中处理
  } finally {
    processingRequest.value = null
  }
}

// 拒绝好友请求
const handleRejectRequest = async (friendshipId: string) => {
  processingRequest.value = friendshipId
  try {
    await friendStore.rejectFriendRequest(friendshipId)
    // 刷新好友列表
    await friendStore.fetchFriends()
  } catch (error) {
    // 错误已在 store 中处理
  } finally {
    processingRequest.value = null
  }
}

// 加载好友列表和待处理请求
onMounted(async () => {
  await Promise.all([
    friendStore.fetchFriends(),
    friendStore.fetchPendingRequests()
  ])
})
</script>