<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="show"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleCancel"></div>

        <!-- Dialog -->
        <div class="relative bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md transform transition-all duration-300">
          <!-- Icon Animation Container -->
          <div class="flex items-center justify-center pt-8 pb-4">
            <div class="relative">
              <!-- Pulsing Ring -->
              <div class="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
              <!-- Icon Circle -->
              <div class="relative w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span class="material-symbols-outlined text-3xl text-red-600 dark:text-red-400 animate-bounce">
                  warning
                </span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 pb-6 text-center">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
              确认删除
            </h3>
            <p class="text-slate-600 dark:text-slate-400 mb-6">
              {{ message || '确定要删除这个事件吗？此操作无法撤销。' }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="handleCancel"
                class="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 font-medium"
              >
                取消
              </button>
              <button
                @click="handleConfirm"
                class="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[20px]">delete</span>
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  message: ''
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

// 阻止背景滚动
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* Dialog Animation */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-active > div:last-child,
.dialog-leave-active > div:last-child {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div:last-child,
.dialog-leave-to > div:last-child {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

/* Ping Animation */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Bounce Animation */
@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
