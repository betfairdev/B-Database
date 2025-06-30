<template>
  <div class="text-center py-12">
    <component
      :is="icon"
      class="w-16 h-16 text-gray-400 mx-auto mb-4"
    />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {{ description }}
    </p>
    <slot name="actions">
      <button
        v-if="actionText"
        @click="$emit('action')"
        class="btn-primary"
      >
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: any
  title: string
  description: string
  actionText?: string
}

defineProps<Props>()

defineEmits<{
  action: []
}>()
</script>