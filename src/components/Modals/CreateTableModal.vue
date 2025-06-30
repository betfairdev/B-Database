<template>
  <Modal size="sm">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ table ? 'Edit Table' : 'Create Table' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="name" class="form-label">Table Name</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="form-input"
          placeholder="Enter table name"
        />
      </div>

      <ThumbnailPicker v-model="formData.thumbnail" />
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="btn-primary"
        >
          {{ table ? 'Update' : 'Create' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import type { Table } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'
import ThumbnailPicker from '@/components/Database/ThumbnailPicker.vue'

interface Props {
  databaseId: string
  table?: Table | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const formData = reactive({
  name: '',
  thumbnail: ''
})

const handleSubmit = () => {
  emit('save', { ...formData })
}

onMounted(() => {
  if (props.table) {
    formData.name = props.table.name
    formData.thumbnail = props.table.thumbnail || ''
  }
})
</script>