<template>
  <Modal size="sm">
    <template #header>
      <div class="flex items-center">
        <div class="shrink-0">
          <ExclamationTriangleIcon class="w-8 h-8 text-red-600" />
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ title }}
          </h3>
        </div>
      </div>
    </template>
    
    <div class="mb-6">
      <p class="text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          :class="confirmClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'

interface Props {
  title: string
  message: string
  confirmText?: string
  confirmClass?: string
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  confirmClass: 'btn-primary'
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>