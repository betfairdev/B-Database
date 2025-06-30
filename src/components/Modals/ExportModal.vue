<template>
  <Modal size="md">
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Export Data
      </h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseSelect
        id="format"
        v-model="exportOptions.format"
        label="Export Format"
        :options="formatOptions"
      />

      <div v-if="database.tables.length > 1">
        <label class="form-label">Tables to Export</label>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <label
            v-for="table in database.tables"
            :key="table.id"
            class="flex items-center space-x-2"
          >
            <input
              v-model="selectedTables"
              :value="table.id"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-white">
              {{ table.name }} ({{ table.records?.length || 0 }} records)
            </span>
          </label>
        </div>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="toggleAllTables"
          class="mt-2"
        >
          {{ selectedTables.length === database.tables.length ? 'Deselect All' : 'Select All' }}
        </BaseButton>
      </div>

      <div class="space-y-3">
        <label class="flex items-center space-x-2">
          <input
            v-model="exportOptions.includeMetadata"
            type="checkbox"
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
          />
          <span class="text-sm text-gray-900 dark:text-white">Include metadata</span>
        </label>

        <label class="flex items-center space-x-2">
          <input
            v-model="exportOptions.includeRelationships"
            type="checkbox"
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
          />
          <span class="text-sm text-gray-900 dark:text-white">Include relationships</span>
        </label>
      </div>

      <Card padding="sm">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <div class="font-medium mb-1">Export Summary:</div>
          <div>Format: {{ exportOptions.format.toUpperCase() }}</div>
          <div>Tables: {{ selectedTables.length }} of {{ database.tables.length }}</div>
          <div>Total Records: {{ getTotalRecords() }}</div>
          <div v-if="estimatedSize" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Estimated size: {{ estimatedSize }}
          </div>
        </div>
      </Card>

      <!-- Progress Bar -->
      <div v-if="isExporting" class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Exporting...</span>
          <span class="text-gray-600 dark:text-gray-400">{{ exportProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${exportProgress}%` }"
          ></div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <BaseButton
          variant="secondary"
          :disabled="isExporting"
          @click="$emit('close')"
        >
          {{ isExporting ? 'Exporting...' : 'Cancel' }}
        </BaseButton>
        <BaseButton
          variant="primary"
          :disabled="selectedTables.length === 0 || isExporting"
          :loading="isExporting"
          loading-text="Exporting..."
          @click="handleSubmit"
        >
          Export
        </BaseButton>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Database, ExportOptions } from '@/types/database'
import Modal from '@/components/UI/Modal.vue'
import BaseSelect from '@/components/UI/BaseSelect.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import Card from '@/components/UI/Card.vue'

interface Props {
  database: Database
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  export: [options: ExportOptions]
}>()

const selectedTables = ref<string[]>([])
const isExporting = ref(false)
const exportProgress = ref(0)

const exportOptions = reactive<ExportOptions>({
  format: 'json',
  includeMetadata: true,
  includeRelationships: false,
  tables: []
})

const formatOptions = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'html', label: 'HTML Table' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'docx', label: 'Word Document' },
  { value: 'sql', label: 'SQL Dump' }
]

const getTotalRecords = () => {
  return props.database.tables
    .filter(table => selectedTables.value.includes(table.id))
    .reduce((total, table) => total + (table.records?.length || 0), 0)
}

const estimatedSize = computed(() => {
  const records = getTotalRecords()
  if (records === 0) return null
  
  // Rough estimation based on format and record count
  const baseSize = records * 100 // 100 bytes per record estimate
  const multiplier = {
    json: 1.5,
    csv: 0.8,
    html: 2.0,
    pdf: 3.0,
    docx: 2.5,
    sql: 1.2
  }[exportOptions.format] || 1
  
  const sizeInBytes = baseSize * multiplier
  return formatBytes(sizeInBytes)
})

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const toggleAllTables = () => {
  if (selectedTables.value.length === props.database.tables.length) {
    selectedTables.value = []
  } else {
    selectedTables.value = props.database.tables.map(table => table.id)
  }
}

const handleSubmit = async () => {
  isExporting.value = true
  exportProgress.value = 0
  
  // Simulate export progress
  const progressInterval = setInterval(() => {
    exportProgress.value += Math.random() * 20
    if (exportProgress.value >= 100) {
      exportProgress.value = 100
      clearInterval(progressInterval)
    }
  }, 200)
  
  try {
    exportOptions.tables = selectedTables.value
    
    // Wait for progress to complete
    await new Promise(resolve => {
      const checkProgress = () => {
        if (exportProgress.value >= 100) {
          resolve(void 0)
        } else {
          setTimeout(checkProgress, 100)
        }
      }
      checkProgress()
    })
    
    emit('export', { ...exportOptions })
  } finally {
    isExporting.value = false
    exportProgress.value = 0
    clearInterval(progressInterval)
  }
}

onMounted(() => {
  // Select all tables by default
  selectedTables.value = props.database.tables.map(table => table.id)
})
</script>