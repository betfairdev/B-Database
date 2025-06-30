<template>
  <div v-if="isVisible" class="fixed inset-0 bg-primary-600 flex items-center justify-center z-[100]">
    <div class="text-center">
      <!-- App Logo -->
      <div class="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
        <div class="text-6xl">📊</div>
      </div>
      
      <!-- App Name -->
      <h1 class="text-3xl font-bold text-white mb-2">
        Database Manager
      </h1>
      <p class="text-primary-100 text-lg mb-8">
        Organize your data with ease
      </p>
      
      <!-- Loading Animation -->
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
      
      <!-- Version -->
      <div class="absolute bottom-8 left-0 right-0 text-center">
        <p class="text-primary-200 text-sm">
          Version 1.0.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000
})

const emit = defineEmits<{
  hidden: []
}>()

const isVisible = ref(true)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = false
    emit('hidden')
  }, props.duration)
})
</script>