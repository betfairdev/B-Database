<template>
  <Modal size="md">
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Import Data
      </h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-4">
        <!-- File Upload -->
        <div>
          <label class="form-label">Select File</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            <div class="space-y-1 text-center">
              <DocumentArrowUpIcon class="mx-auto h-12 w-12 text-gray-400" />
              <div class="flex text-sm text-gray-600 dark:text-gray-400">
                <label for="file-upload" class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    ref="fileInput"
                    type="file"
                    accept=".json,.csv,.sql"
                    @change="handleFileChange"
                    class="sr-only"
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                JSON, CSV, or SQL files up to 10MB
              </p>
            </div>
          </div>
        </div>

        <!-- Selected File Info -->
        <div v-if="selectedFile" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <DocumentTextIcon class="w-8 h-8 text-gray-400" />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ selectedFile.name }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatFileSize(selectedFile.size) }} • {{ getFileType(selectedFile.name) }}
              </div>
            </div>
            <button
              @click="clearFile"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Format Selection -->
        <BaseSelect
          id="format"
          v-model="importOptions.format"
          label="Format"
          :options="formatOptions"
          :disabled="!selectedFile"
        />

        <!-- Import Options -->
        <div class="space-y-3">
          <label class="flex items-center space-x-2">
            <input
              v-model="importOptions.createTable"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-gray-300">
              Create new table if needed
            </span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              v-model="importOptions.updateExisting"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-gray-300">
              Update existing records
            </span>
          </label>
        </div>

        <!-- Preview -->
        <div v-if="previewData" class="space-y-2">
          <label class="form-label">Preview</label>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-40 overflow-auto">
            <pre class="text-xs text-gray-700 dark:text-gray-300">{{ previewData }}</pre>
          </div>
        </div>

        <!-- Progress Bar -->
        <div v-if="isImporting" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">{{ importStatus }}</span>
            <span class="text-gray-600 dark:text-gray-400">{{ importProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${importProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- Import Results -->
        <div v-if="importResults" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <CheckCircleIcon class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <div class="font-medium text-green-800 dark:text-green-200 text-sm">
                Import Completed Successfully
              </div>
              <div class="text-green-700 dark:text-green-300 text-sm mt-1">
                {{ importResults.recordsImported }} records imported
                {{ importResults.recordsSkipped ? `, ${importResults.recordsSkipped} skipped` : '' }}
                {{ importResults.recordsUpdated ? `, ${importResults.recordsUpdated} updated` : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <BaseButton
          variant="secondary"
          :disabled="isImporting"
          @click="$emit('close')"
        >
          {{ isImporting ? 'Importing...' : 'Cancel' }}
        </BaseButton>
        <BaseButton
          variant="primary"
          :disabled="!selectedFile || isImporting"
          :loading="isImporting"
          loading-text="Importing..."
          @click="handleSubmit"
        >
          Import
        </BaseButton>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { ImportOptions } from '@/types/database'
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'
import BaseSelect from '@/components/UI/BaseSelect.vue'
import BaseButton from '@/components/UI/BaseButton.vue'

const emit = defineEmits<{
  close: []
  import: [file: File, options: ImportOptions]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const previewData = ref('')
const isImporting = ref(false)
const importProgress = ref(0)
const importStatus = ref('')
const importResults = ref<{
  recordsImported: number
  recordsSkipped?: number
  recordsUpdated?: number
} | null>(null)

const importOptions = reactive<ImportOptions>({
  format: 'json',
  createTable: true,
  updateExisting: false
})

const formatOptions = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'sql', label: 'SQL' }
]

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    
    // Auto-detect format from file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension && ['json', 'csv', 'sql'].includes(extension)) {
      importOptions.format = extension as 'json' | 'csv' | 'sql'
    }
    
    // Generate preview
    generatePreview(file)
  }
}

const generatePreview = async (file: File) => {
  try {
    const text = await file.text()
    const maxLength = 500
    previewData.value = text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text
  } catch (error) {
    console.error('Failed to generate preview:', error)
    previewData.value = 'Unable to preview file'
  }
}

const clearFile = () => {
  selectedFile.value = null
  previewData.value = ''
  importResults.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileType = (filename: string) => {
  const extension = filename.split('.').pop()?.toUpperCase()
  return extension || 'FILE'
}

const handleSubmit = async () => {
  if (!selectedFile.value) return
  
  isImporting.value = true
  importProgress.value = 0
  importStatus.value = 'Preparing import...'
  importResults.value = null
  
  // Simulate import progress
  const progressSteps = [
    { progress: 20, status: 'Reading file...' },
    { progress: 40, status: 'Validating data...' },
    { progress: 60, status: 'Processing records...' },
    { progress: 80, status: 'Saving to database...' },
    { progress: 100, status: 'Import complete!' }
  ]
  
  for (const step of progressSteps) {
    await new Promise(resolve => setTimeout(resolve, 500))
    importProgress.value = step.progress
    importStatus.value = step.status
  }
  
  try {
    // Simulate import results
    const recordCount = Math.floor(Math.random() * 100) + 10
    importResults.value = {
      recordsImported: recordCount,
      recordsSkipped: Math.floor(Math.random() * 5),
      recordsUpdated: importOptions.updateExisting ? Math.floor(Math.random() * 10) : 0
    }
    
    // Emit the import event
    emit('import', selectedFile.value, { ...importOptions })
  } finally {
    isImporting.value = false
  }
}

watch(() => selectedFile.value, (newFile) => {
  if (!newFile) {
    importResults.value = null
  }
})
</script>