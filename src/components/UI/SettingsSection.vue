<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>