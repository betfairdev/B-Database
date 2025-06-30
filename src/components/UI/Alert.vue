<template>
  <div
    :class="[
      'rounded-lg p-4 mb-4 flex items-start space-x-3',
      alertClasses[type]
    ]"
    role="alert"
  >
    <component
      :is="alertIcons[type]"
      class="w-5 h-5 shrink-0 mt-0.5"
    />
    <div class="flex-1">
      <h3 v-if="title" class="font-medium mb-1">{{ title }}</h3>
      <div class="text-sm">
        <slot>{{ message }}</slot>
      </div>
    </div>
    <button
      v-if="dismissible"
      @click="$emit('dismiss')"
      class="shrink-0 ml-auto"
    >
      <XMarkIcon class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  type?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message?: string
  dismissible?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: true
})

defineEmits<{
  dismiss: []
}>()

const alertClasses = {
  success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800',
  error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
}

const alertIcons = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon
}
</script>
