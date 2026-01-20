<template>
  <div class="flex items-center gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-primary/50 transition-all relative">
    <!-- Avatar -->
    <div
      class="w-12 h-12 rounded-full flex-shrink-0 ring-2 ring-transparent hover:ring-primary/50 transition-all overflow-hidden"
      :style="{ borderColor: friend.color, borderWidth: '2px' }"
    >
      <img v-if="friend.avatar_url" :src="getAvatarUrl(friend.avatar_url)" :alt="friend.username" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-white font-semibold" :style="{ backgroundColor: friend.color }">
        {{ friend.username.charAt(0).toUpperCase() }}
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-slate-900 dark:text-white truncate">
        {{ friend.display_name || friend.username }}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
        @{{ friend.username }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <!-- Accepted: Show merge button and delete dropdown -->
      <template v-if="friendStatus === 'accepted'">
        <button
          @click="$emit('merge', friend)"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          合并时间线
        </button>
        
        <!-- Dropdown Button -->
        <div class="relative" ref="dropdownRef">
          <button
            @click.stop="showDropdown = !showDropdown"
            class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <span class="material-symbols-outlined text-[20px]">arrow_drop_down</span>
          </button>

          <!-- Dropdown Menu -->
          <Transition name="dropdown">
            <div
              v-if="showDropdown"
              class="absolute right-0 mt-2 w-40 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
              @click.stop
            >
              <button
                @click="handleDeleteClick"
                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">delete</span>
                <span>删除好友</span>
              </button>
            </div>
          </Transition>
        </div>
      </template>

      <!-- Sent Request (Pending): Show status text -->
      <template v-else-if="friendStatus === 'pending' && friend.is_sender">
        <span class="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
          已发出请求
        </span>
      </template>

      <!-- Rejected Request: Show message and action buttons -->
      <template v-else-if="friendStatus === 'rejected'">
        <span class="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-medium mr-2">
          请求已被对方拒绝
        </span>
        <button
          @click="handleResendRequest"
          :disabled="processing"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="processing">处理中...</span>
          <span v-else>请求好友</span>
        </button>
        <button
          @click="handleDeleteRequest"
          :disabled="processing"
          class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          删除请求
        </button>
      </template>

      <button
        v-if="showActions"
        @click="$emit('action', friend)"
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <span class="material-symbols-outlined text-[20px]">more_vert</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Friend } from '@/types/api'
import { getAvatarUrl } from '@/utils/imageUtils'

interface Props {
  friend: Friend
  status?: 'pending' | 'accepted' | 'rejected' | 'blocked'
  friendshipId?: string
  showMergeButton?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'accepted',
  friendshipId: '',
  showMergeButton: true,
  showActions: false
})

const emit = defineEmits<{
  merge: [friend: Friend]
  action: [friend: Friend]
  delete: [friend: Friend]
  resendRequest: [friend: Friend]
  deleteRequest: [friendshipId: string]
}>()

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const processing = ref(false)

const friendStatus = computed(() => {
  return props.status || props.friend.status || 'accepted'
})

const handleDeleteClick = () => {
  showDropdown.value = false
  emit('delete', props.friend)
}

const handleResendRequest = () => {
  processing.value = true
  emit('resendRequest', props.friend)
  setTimeout(() => {
    processing.value = false
  }, 1000)
}

const handleDeleteRequest = () => {
  if (props.friendshipId) {
    processing.value = true
    emit('deleteRequest', props.friendshipId)
    setTimeout(() => {
      processing.value = false
    }, 1000)
  }
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>