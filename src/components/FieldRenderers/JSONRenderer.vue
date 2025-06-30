<template>
  <div class="json-renderer">
    <div v-if="readonly" class="json-renderer-display">
      <div v-if="value" class="space-y-2">
        <div v-if="compact" class="text-sm text-gray-900 dark:text-white font-mono">
          {{ getCompactJson(value) }}
        </div>
        <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
          <pre class="text-xs text-gray-900 dark:text-white font-mono whitespace-pre-wrap overflow-x-auto">{{ formatJsonDisplay(value) }}</pre>
        </div>
        <div v-if="!compact" class="flex items-center space-x-2">
          <button
            @click="copyJson"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy JSON
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="validateJson"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Validate
          </button>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="json-renderer-input">
      <div class="space-y-3">
        <div class="relative">
          <textarea
            :value="jsonText"
            @input="updateValue"
            @blur="validateAndFormat"
            :placeholder="field.name || 'Enter JSON data'"
            :required="field.isRequired"
            rows="6"
            class="form-input font-mono text-sm resize-none"
          />
          <div class="absolute top-2 right-2 flex items-center space-x-1">
            <button
              @click="formatEditorJson"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Format JSON"
            >
              <CodeBracketIcon class="w-4 h-4" />
            </button>
            <button
              @click="minifyJson"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Minify JSON"
            >
              <MinusIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <button
              @click="insertTemplate('object')"
              class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Object
            </button>
            <span class="text-xs text-gray-400">•</span>
            <button
              @click="insertTemplate('array')"
              class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Array
            </button>
            <span class="text-xs text-gray-400">•</span>
            <button
              @click="clearJson"
              class="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Clear
            </button>
          </div>
          
          <div v-if="jsonError" class="text-xs text-red-600 dark:text-red-400">
            {{ jsonError }}
          </div>
          <div v-else-if="isValidJson" class="text-xs text-green-600 dark:text-green-400">
            Valid JSON
          </div>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Enter valid JSON data. Use the format and minify buttons to clean up your JSON.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  CodeBracketIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: any
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: any]
}>()

const jsonText = ref('')
const jsonError = ref('')

const isValidJson = computed(() => {
  try {
    if (jsonText.value.trim()) {
      JSON.parse(jsonText.value)
      return true
    }
    return false
  } catch {
    return false
  }
})

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  jsonText.value = target.value
  jsonError.value = ''
}

const validateAndFormat = () => {
  try {
    if (jsonText.value.trim()) {
      const parsed = JSON.parse(jsonText.value)
      emit('update:value', parsed)
      jsonError.value = ''
    } else {
      emit('update:value', null)
    }
  } catch (error) {
    jsonError.value = 'Invalid JSON format'
  }
}

const formatEditorJson = () => {
  try {
    if (jsonText.value.trim()) {
      const parsed = JSON.parse(jsonText.value)
      jsonText.value = JSON.stringify(parsed, null, 2)
      jsonError.value = ''
    }
  } catch (error) {
    jsonError.value = 'Cannot format invalid JSON'
  }
}

const minifyJson = () => {
  try {
    if (jsonText.value.trim()) {
      const parsed = JSON.parse(jsonText.value)
      jsonText.value = JSON.stringify(parsed)
      jsonError.value = ''
    }
  } catch (error) {
    jsonError.value = 'Cannot minify invalid JSON'
  }
}

const insertTemplate = (type: 'object' | 'array') => {
  const templates = {
    object: '{\n  "key": "value"\n}',
    array: '[\n  "item1",\n  "item2"\n]'
  }
  jsonText.value = templates[type]
}

const clearJson = () => {
  jsonText.value = ''
  emit('update:value', null)
  jsonError.value = ''
}

const getCompactJson = (value: any) => {
  if (!value) return '-'
  const str = JSON.stringify(value)
  return str.length > 50 ? str.substring(0, 50) + '...' : str
}

const formatJsonDisplay = (value: any) => {
  if (!value) return ''
  return JSON.stringify(value, null, 2)
}

const copyJson = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(props.value, null, 2))
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy JSON:', error)
    }
  }
}

const validateJson = () => {
  try {
    JSON.parse(JSON.stringify(props.value))
    alert('JSON is valid!')
  } catch (error) {
    alert('JSON is invalid: ' + error)
  }
}

// Initialize jsonText with formatted value
if (props.value && !props.readonly) {
  jsonText.value = JSON.stringify(props.value, null, 2)
}
</script>