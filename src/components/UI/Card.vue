<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
      paddingClasses[padding],
      { 'hover:shadow-md transition-shadow cursor-pointer': clickable }
    ]"
    @click="clickable && $emit('click')"
  >
    <div v-if="$slots.header" class="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <slot name="header" />
    </div>
    
    <slot />
    
    <div v-if="$slots.footer" class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  clickable: false
})

defineEmits<{
  click: []
}>()

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}
</script>