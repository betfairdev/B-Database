<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div 
      :class="[
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full flex flex-col',
        sizeClasses[size]
      ]"
      @click.stop
      style="max-height: 90vh;"
    >
      <!-- Fixed Header -->
      <div v-if="$slots.header" class="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-lg">
        <slot name="header" />
      </div>
      
      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <slot />
      </div>
      
      <!-- Fixed Footer -->
      <div v-if="$slots.footer" class="shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-lg">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl'
}
</script>