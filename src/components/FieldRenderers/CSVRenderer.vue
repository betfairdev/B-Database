<template>
  <div class="csv-renderer">
    <div v-if="readonly" class="csv-renderer-display">
      <div v-if="parsedData && parsedData.length > 0" class="space-y-2">
        <div class="text-sm font-medium text-gray-900 dark:text-white">
          {{ parsedData.length }} rows, {{ Object.keys(parsedData[0] || {}).length }} columns
        </div>
        <div v-if="!compact" class="overflow-x-auto">
          <table class="min-w-full text-xs border border-gray-200 dark:border-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  v-for="(header, index) in headers"
                  :key="index"
                  class="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in displayRows"
                :key="rowIndex"
                class="border-b border-gray-200 dark:border-gray-700"
              >
                <td
                  v-for="(header, colIndex) in headers"
                  :key="colIndex"
                  class="px-2 py-1 text-gray-900 dark:text-white"
                >
                  {{ row[header] || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="parsedData.length > 5" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Showing first 5 rows of {{ parsedData.length }}
          </div>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="csv-renderer-input">
      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.txt"
            @change="handleFileUpload"
            class="hidden"
          />
          <button
            @click="$refs.fileInput?.click()"
            class="btn-secondary flex items-center"
          >
            <DocumentTextIcon class="w-4 h-4 mr-2" />
            Upload CSV
          </button>
          
          <button
            @click="showTextInput = !showTextInput"
            class="btn-secondary"
          >
            {{ showTextInput ? 'Hide' : 'Paste' }} Text
          </button>
          
          <button
            v-if="parsedData && parsedData.length > 0"
            @click="downloadTemplate"
            class="btn-secondary flex items-center"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
        
        <div v-if="showTextInput" class="space-y-2">
          <textarea
            v-model="csvText"
            placeholder="Paste CSV data here..."
            rows="6"
            class="form-input font-mono text-sm resize-none"
            @input="parseCSVText"
          />
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2">
              <input
                v-model="hasHeaders"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">First row contains headers</span>
            </label>
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-700 dark:text-gray-300">Delimiter:</label>
              <select
                v-model="delimiter"
                @change="parseCSVText"
                class="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div v-if="parsedData && parsedData.length > 0" class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              Preview: {{ parsedData.length }} rows, {{ headers.length }} columns
            </div>
            <button
              @click="clearData"
              class="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Clear
            </button>
          </div>
          
          <div class="overflow-x-auto max-h-64 border border-gray-200 dark:border-gray-700 rounded">
            <table class="min-w-full text-xs">
              <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th
                    v-for="(header, index) in headers"
                    :key="index"
                    class="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in parsedData.slice(0, 10)"
                  :key="rowIndex"
                  class="border-b border-gray-200 dark:border-gray-700"
                >
                  <td
                    v-for="(header, colIndex) in headers"
                    :key="colIndex"
                    class="px-2 py-1 text-gray-900 dark:text-white"
                  >
                    {{ row[header] || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="parsedData.length > 10" class="text-xs text-gray-500 dark:text-gray-400">
            Showing first 10 rows of {{ parsedData.length }}
          </div>
        </div>
        
        <div v-if="csvError" class="text-xs text-red-600 dark:text-red-400">
          {{ csvError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: any[]
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: any[]]
}>()

const csvText = ref('')
const showTextInput = ref(false)
const hasHeaders = ref(true)
const delimiter = ref(',')
const csvError = ref('')
const parsedData = ref<any[]>(props.value || [])

const headers = computed(() => {
  if (parsedData.value && parsedData.value.length > 0) {
    return Object.keys(parsedData.value[0])
  }
  return []
})

const displayRows = computed(() => {
  return parsedData.value.slice(0, 5)
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      csvText.value = text
      parseCSVText()
    }
    reader.readAsText(file)
  }
}

const parseCSVText = () => {
  if (!csvText.value.trim()) {
    parsedData.value = []
    emit('update:value', [])
    return
  }
  
  try {
    const lines = csvText.value.trim().split('\n')
    const result: any[] = []
    
    let headers: string[] = []
    let startIndex = 0
    
    if (hasHeaders.value && lines.length > 0) {
      headers = parseCSVLine(lines[0])
      startIndex = 1
    } else {
      // Generate column headers
      const firstLine = parseCSVLine(lines[0])
      headers = firstLine.map((_, index) => `Column ${index + 1}`)
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      result.push(row)
    }
    
    parsedData.value = result
    emit('update:value', result)
    csvError.value = ''
  } catch (error) {
    csvError.value = 'Failed to parse CSV data'
    console.error('CSV parsing error:', error)
  }
}

const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter.value && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

const downloadTemplate = () => {
  if (parsedData.value.length === 0) return
  
  const csvContent = convertToCSV(parsedData.value)
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.field.name || 'data'}.csv`
  a.click()
  
  URL.revokeObjectURL(url)
}

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || ''
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

const clearData = () => {
  csvText.value = ''
  parsedData.value = []
  emit('update:value', [])
  csvError.value = ''
}
</script>