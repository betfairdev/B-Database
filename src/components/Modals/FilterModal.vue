<template>
  <Modal size="lg">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Filter Records
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
    </template>

    <div class="space-y-4">
      <div
        v-for="(filter, index) in localFilters"
        :key="index"
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter {{ index + 1 }}
          </span>
          <button
            @click="removeFilter(index)"
            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="form-label text-xs">Field</label>
            <select
              v-model="filter.fieldId"
              class="form-input text-sm"
            >
              <option value="">Select field</option>
              <option
                v-for="field in table.fields"
                :key="field.id"
                :value="field.id"
              >
                {{ field.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="form-label text-xs">Operator</label>
            <select
              v-model="filter.operator"
              class="form-input text-sm"
            >
              <option value="equals">Equals</option>
              <option value="not_equals">Not Equals</option>
              <option value="contains">Contains</option>
              <option value="not_contains">Does Not Contain</option>
              <option value="starts_with">Starts With</option>
              <option value="ends_with">Ends With</option>
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
              <option value="greater_equal">Greater or Equal</option>
              <option value="less_equal">Less or Equal</option>
              <option value="is_empty">Is Empty</option>
              <option value="is_not_empty">Is Not Empty</option>
            </select>
          </div>

          <div v-if="!['is_empty', 'is_not_empty'].includes(filter.operator)">
            <label class="form-label text-xs">Value</label>
            <input
              v-model="filter.value"
              :type="getInputType(filter.fieldId)"
              class="form-input text-sm"
              :placeholder="getPlaceholder(filter.fieldId)"
            />
          </div>
        </div>
      </div>

      <button
        @click="addFilter"
        class="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <PlusIcon class="w-5 h-5 mx-auto mb-1" />
        Add Filter
      </button>

      <div v-if="localFilters.length > 1" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <div class="flex items-center space-x-3">
          <span class="text-sm font-medium text-blue-900 dark:text-blue-200">
            Combine filters with:
          </span>
          <div class="flex space-x-2">
            <label class="flex items-center space-x-1">
              <input
                v-model="filterLogic"
                value="AND"
                type="radio"
                class="w-4 h-4 text-primary-600"
              />
              <span class="text-sm text-blue-900 dark:text-blue-200">AND</span>
            </label>
            <label class="flex items-center space-x-1">
              <input
                v-model="filterLogic"
                value="OR"
                type="radio"
                class="w-4 h-4 text-primary-600"
              />
              <span class="text-sm text-blue-900 dark:text-blue-200">OR</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <button
          @click="clearAllFilters"
          class="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Clear All Filters
        </button>
        
        <div class="flex space-x-3">
          <button
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="applyFilters"
            class="btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Table } from '@/types/database'
import { FieldType } from '@/types/database'
import {
  XMarkIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'

interface Props {
  table: Table
  filters: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  apply: [filters: any[]]
}>()

const localFilters = ref([...props.filters])
const filterLogic = ref('AND')

const addFilter = () => {
  localFilters.value.push({
    fieldId: '',
    operator: 'equals',
    value: ''
  })
}

const removeFilter = (index: number) => {
  localFilters.value.splice(index, 1)
}

const clearAllFilters = () => {
  localFilters.value = []
}

const getInputType = (fieldId: string) => {
  const field = props.table.fields.find(f => f.id === fieldId)
  if (!field) return 'text'
  
  switch (field.type) {
    case FieldType.NUMBER:
    case FieldType.CURRENCY:
      return 'number'
    case FieldType.DATE:
      return 'date'
    case FieldType.TIME:
      return 'time'
    case FieldType.DATETIME:
      return 'datetime-local'
    case FieldType.EMAIL:
      return 'email'
    case FieldType.URL:
      return 'url'
    case FieldType.PHONE:
      return 'tel'
    case FieldType.COLOR:
      return 'color'
    default:
      return 'text'
  }
}

const getPlaceholder = (fieldId: string) => {
  const field = props.table.fields.find(f => f.id === fieldId)
  if (!field) return 'Enter value'
  
  switch (field.type) {
    case FieldType.EMAIL:
      return 'user@example.com'
    case FieldType.PHONE:
      return '+1234567890'
    case FieldType.URL:
      return 'https://example.com'
    case FieldType.COLOR:
      return '#000000'
    default:
      return `Enter ${field.name.toLowerCase()}`
  }
}

const applyFilters = () => {
  const validFilters = localFilters.value.filter(filter => 
    filter.fieldId && filter.operator && 
    (['is_empty', 'is_not_empty'].includes(filter.operator) || filter.value !== '')
  )
  
  emit('apply', validFilters)
}

// Initialize with one empty filter if none exist
if (localFilters.value.length === 0) {
  addFilter()
}
</script>