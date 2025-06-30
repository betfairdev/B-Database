<template>
  <transition-group name="toast-fade" tag="div" class="fixed z-50 top-4 right-4 space-y-2">
    <div v-for="toast in toasts" :key="toast.id" :class="[
      'flex items-center px-4 py-3 rounded shadow-lg text-white',
      toast.type === 'success' ? 'bg-green-600' : '',
      toast.type === 'error' ? 'bg-red-600' : '',
      toast.type === 'info' ? 'bg-blue-600' : '',
      toast.type === 'warning' ? 'bg-yellow-500 text-black' : ''
    ]">
      <span class="mr-2">
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else-if="toast.type === 'info'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
        </svg>
        <svg v-else-if="toast.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      </span>
      <span class="flex-1">{{ toast.message }}</span>
      <button @click="removeToast(toast.id)"
        class="ml-4 text-white hover:text-gray-200 focus:outline-none">&times;</button>
    </div>
  </transition-group>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
