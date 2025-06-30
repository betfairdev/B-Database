<template>
  <div class="w-full">
    <div v-if="label" class="flex justify-between text-sm mb-1">
      <span class="text-gray-700 dark:text-gray-300">{{ label }}</span>
      <span class="text-gray-500 dark:text-gray-400">{{ value }}{{ unit }}</span>
    </div>
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        :class="[
          'h-2 rounded-full transition-all duration-300',
          colorClasses[color]
        ]"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max: number
  label?: string
  unit?: string
  color?: 'primary' | 'success' | 'warning' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  unit: ''
})

const percentage = computed(() => {
  return Math.min((props.value / props.max) * 100, 100)
})

const colorClasses = {
  primary: 'bg-primary-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600'
}
</script>