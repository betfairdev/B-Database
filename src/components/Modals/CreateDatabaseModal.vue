<template>
  <Modal size="sm">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ database ? 'Edit Database' : 'Create Database' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Database Name
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter database name"
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Describe your database..."
        ></textarea>
      </div>

      <ThumbnailPicker v-model="formData.thumbnail" />

      <div class="flex items-center">
        <input
          id="encrypted"
          v-model="formData.isEncrypted"
          type="checkbox"
          class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label for="encrypted" class="ml-2 text-sm text-gray-900 dark:text-gray-300">
          Enable encryption
        </label>
      </div>
    </form>

    <template #footer>
      <div class="flex space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          {{ database ? 'Update' : 'Create' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import type { Database } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'
import ThumbnailPicker from '@/components/Database/ThumbnailPicker.vue'

interface Props {
  database?: Database | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const formData = reactive({
  name: '',
  description: '',
  thumbnail: '',
  isEncrypted: false
})

const handleSubmit = () => {
  emit('save', { ...formData })
}

onMounted(() => {
  if (props.database) {
    formData.name = props.database.name
    formData.description = props.database.description || ''
    formData.thumbnail = props.database.thumbnail || ''
    formData.isEncrypted = props.database.isEncrypted
  }
})
</script>