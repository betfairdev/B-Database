<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
    <div class="flex items-center space-x-3">
      <div :class="[
        'w-10 h-10 rounded-lg flex items-center justify-center',
        iconBgClass
      ]">
        <component :is="icon" :class="['w-5 h-5', iconClass]" />
      </div>
      <div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ value }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ label }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: any
  value: string | number
  label: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'primary'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900',
    icon: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900',
    icon: 'text-red-600 dark:text-red-400'
  },
  primary: {
    bg: 'bg-primary-100 dark:bg-primary-900',
    icon: 'text-primary-600 dark:text-primary-400'
  }
}

const iconBgClass = colorClasses[props.color].bg
const iconClass = colorClasses[props.color].icon
</script>