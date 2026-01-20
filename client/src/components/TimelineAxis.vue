<template>
  <div class="relative w-full py-8">
    <!-- Vertical Line with Gradient -->
    <div class="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 z-0">
      <div class="absolute inset-0 bg-gradient-to-b from-blue-300 via-amber-300 to-purple-300 dark:from-blue-600 dark:via-amber-600 dark:to-purple-600 opacity-30 rounded-full"></div>
      <div class="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
    </div>
    
    <!-- Content Slot -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// TimelineAxis 组件：提供垂直时间轴视觉线（带渐变效果）
</script>