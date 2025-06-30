<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses[size],
      variantClasses[variant],
      {
        'opacity-50 cursor-not-allowed': disabled,
        'w-full': fullWidth
      }
    ]"
    @click="$emit('click', $event)"
  >
    <component
      v-if="iconLeft"
      :is="iconLeft"
      :class="iconSizeClasses[size]"
      class="mr-2"
    />
    
    <slot />
    
    <component
      v-if="iconRight"
      :is="iconRight"
      :class="iconSizeClasses[size]"
      class="ml-2"
    />
    
    <div v-if="loading" class="flex items-center">
      <div :class="[
        'animate-spin rounded-full border-b-2',
        loadingSpinnerClasses[variant],
        iconSizeClasses[size]
      ]"></div>
      <span v-if="loadingText" class="ml-2">{{ loadingText }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
  iconLeft?: any
  iconRight?: any
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  sm: 'px-3 py-2 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg'
}

const variantClasses = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:ring-gray-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
  outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-gray-500'
}

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

const loadingSpinnerClasses = {
  primary: 'border-white',
  secondary: 'border-gray-600 dark:border-gray-300',
  danger: 'border-white',
  ghost: 'border-gray-600 dark:border-gray-300',
  outline: 'border-gray-600 dark:border-gray-300'
}
</script>