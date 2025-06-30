<template>
  <button
    @click="$emit('click')"
    :class="[
      'flex flex-col items-center p-4 rounded-lg transition-colors',
      colorClass
    ]"
  >
    <component :is="icon" class="w-8 h-8 mb-2" />
    <span class="text-sm font-medium">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: any
  text: string
  color?: 'primary' | 'green' | 'blue' | 'yellow' | 'red' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary'
})

defineEmits<{
  click: []
}>()

const colorClasses = {
  primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30',
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',
  gray: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
}

const colorClass = colorClasses[props.color]
</script>