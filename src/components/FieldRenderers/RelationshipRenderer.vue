<template>
  <div class="relationship-renderer">
    <div v-if="readonly" class="relationship-renderer-display">
      <div v-if="displayValue" class="space-y-2">
        <div v-if="isMultiple" class="space-y-1">
          <div
            v-for="item in displayValue"
            :key="item.id"
            class="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md text-sm mr-1 mb-1"
          >
            <component
              :is="getRelationshipIcon()"
              class="w-3 h-3 mr-1"
            />
            {{ item.display }}
          </div>
        </div>
        <div v-else class="flex items-center space-x-2">
          <component
            :is="getRelationshipIcon()"
            class="w-4 h-4 text-gray-400"
          />
          <span class="text-sm text-gray-900 dark:text-white">
            {{ displayValue.display }}
          </span>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    
    <div v-else class="relationship-renderer-input">
      <div class="space-y-3">
        <div v-if="isMultiple">
          <label class="form-label">{{ field.name }}</label>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-1 min-h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              <div
                v-for="item in selectedItems"
                :key="item.id"
                class="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md text-sm"
              >
                {{ item.display }}
                <button
                  @click="removeItem(item.id)"
                  class="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                >
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <select
              v-model="selectedNewItem"
              @change="addItem"
              class="form-input"
            >
              <option value="">Add related record...</option>
              <option
                v-for="option in availableOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.display }}
              </option>
            </select>
          </div>
        </div>
        
        <div v-else>
          <label class="form-label">{{ field.name }}</label>
          <select
            :value="value"
            @change="updateSingleValue"
            class="form-input"
            :required="field.isRequired"
          >
            <option value="">{{ field.isRequired ? 'Select a record' : 'None' }}</option>
            <option
              v-for="option in relatedRecords"
              :key="option.id"
              :value="option.id"
            >
              {{ option.display }}
            </option>
          </select>
        </div>

        <div v-if="relatedRecords.length === 0" class="text-xs text-gray-500 dark:text-gray-400">
          No related records available. Create records in the target table first.
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="showCreateModal = true"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Create New Record
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="refreshRelatedRecords"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Create Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New {{ targetTable?.name }} Record
        </h3>
        
        <div class="space-y-3">
          <div
            v-for="targetField in primaryTargetFields"
            :key="targetField.id"
            class="space-y-1"
          >
            <label class="form-label text-sm">{{ targetField.name }}</label>
            <input
              v-model="newRecordData[targetField.id]"
              :type="getInputType(targetField.type)"
              :required="targetField.isRequired"
              class="form-input text-sm"
              :placeholder="targetField.name"
            />
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showCreateModal = false"
            class="btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            @click="createNewRecord"
            class="btn-primary text-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import type { Field, Table, Record, RelationshipType } from '@/types/database'
import { FieldType } from '@/types/database'
import {
  LinkIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: any
  readonly?: boolean
  compact?: boolean
  tables?: Table[]
  records?: Record[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: any]
  'create-record': [tableId: string, data: any]
}>()

const showCreateModal = ref(false)
const selectedNewItem = ref('')
const newRecordData = reactive<{ [fieldId: string]: any }>({})

const relationshipType = computed(() => props.field.options?.relationshipType)
const targetTableId = computed(() => props.field.options?.targetTableId)
const displayField = computed(() => props.field.options?.displayField)
const isMultiple = computed(() => props.field.options?.allowMultiple || relationshipType.value === 'many-to-many')

const targetTable = computed(() => 
  props.tables?.find(table => table.id === targetTableId.value)
)

const relatedRecords = computed(() => {
  if (!targetTable.value) return []
  
  return (targetTable.value.records || []).map(record => ({
    id: record.id,
    display: getDisplayValue(record)
  }))
})

const selectedItems = computed(() => {
  if (!isMultiple.value || !Array.isArray(props.value)) return []
  
  return props.value.map(id => {
    const record = relatedRecords.value.find(r => r.id === id)
    return record || { id, display: 'Unknown Record' }
  })
})

const availableOptions = computed(() => {
  if (!isMultiple.value) return relatedRecords.value
  
  const selectedIds = Array.isArray(props.value) ? props.value : []
  return relatedRecords.value.filter(record => !selectedIds.includes(record.id))
})

const displayValue = computed(() => {
  if (!props.value) return null
  
  if (isMultiple.value) {
    return selectedItems.value
  } else {
    const record = relatedRecords.value.find(r => r.id === props.value)
    return record || null
  }
})

const primaryTargetFields = computed(() => {
  if (!targetTable.value) return []
  
  return (targetTable.value.fields || [])
    .filter(field => field.isPrimary || field.isRequired)
    .slice(0, 3) // Limit to 3 fields for quick create
})

const getDisplayValue = (record: Record) => {
  if (!targetTable.value) return 'Unknown'
  
  // Use specified display field or primary field or first field
  let displayFieldId = displayField.value
  if (!displayFieldId) {
    const primaryField = targetTable.value.fields?.find(f => f.isPrimary)
    displayFieldId = primaryField?.id || targetTable.value.fields?.[0]?.id
  }
  
  if (displayFieldId && record.data[displayFieldId]) {
    return String(record.data[displayFieldId])
  }
  
  return `Record ${record.id.slice(0, 8)}`
}

const getRelationshipIcon = () => {
  switch (relationshipType.value) {
    case 'one-to-one':
      return ArrowRightIcon
    case 'one-to-many':
    case 'many-to-one':
      return ArrowRightIcon
    case 'many-to-many':
      return ArrowsRightLeftIcon
    default:
      return LinkIcon
  }
}

const updateSingleValue = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:value', target.value || null)
}

const addItem = () => {
  if (!selectedNewItem.value) return
  
  const currentValue = Array.isArray(props.value) ? props.value : []
  const newValue = [...currentValue, selectedNewItem.value]
  emit('update:value', newValue)
  selectedNewItem.value = ''
}

const removeItem = (itemId: string) => {
  if (!Array.isArray(props.value)) return
  
  const newValue = props.value.filter(id => id !== itemId)
  emit('update:value', newValue)
}

const getInputType = (fieldType: FieldType) => {
  switch (fieldType) {
    case FieldType.NUMBER:
    case FieldType.CURRENCY:
      return 'number'
    case FieldType.EMAIL:
      return 'email'
    case FieldType.URL:
      return 'url'
    case FieldType.PHONE:
      return 'tel'
    case FieldType.DATE:
      return 'date'
    case FieldType.TIME:
      return 'time'
    case FieldType.DATETIME:
      return 'datetime-local'
    default:
      return 'text'
  }
}

const createNewRecord = () => {
  if (!targetTableId.value) return
  
  emit('create-record', targetTableId.value, { ...newRecordData })
  
  // Reset form
  Object.keys(newRecordData).forEach(key => {
    delete newRecordData[key]
  })
  showCreateModal.value = false
}

const refreshRelatedRecords = () => {
  // This would typically trigger a refresh of the related records
  // For now, we'll just emit an event that the parent can handle
  console.log('Refreshing related records for table:', targetTableId.value)
}

onMounted(() => {
  // Initialize newRecordData with empty values for required fields
  primaryTargetFields.value.forEach(field => {
    newRecordData[field.id] = field.defaultValue || ''
  })
})
</script>