<template>
  <div class="flex space-x-6 overflow-x-auto pb-6">
    <div
      v-for="column in kanbanColumns"
      :key="column.value"
      class="shrink-0 w-80"
    >
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ column.label }}
          </h3>
          <span class="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            {{ getColumnRecords(column.value).length }}
          </span>
        </div>

        <div
          class="space-y-3 min-h-[200px]"
          @drop="onDrop($event, column.value)"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="record in getColumnRecords(column.value)"
            :key="record.id"
            class="card p-4 cursor-move hover:shadow-md transition-shadow group"
            draggable="true"
            @dragstart="onDragStart($event, record)"
          >
            <div class="flex items-start justify-between mb-3">
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ getPrimaryFieldValue(record) }}
              </h4>
              <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="$emit('edit-record', record)"
                  class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <PencilIcon class="w-3 h-3" />
                </button>
                <button
                  @click="$emit('delete-record', record)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <TrashIcon class="w-3 h-3" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="field in displayFields"
                :key="field.id"
                class="text-sm"
              >
                <span class="text-gray-500 dark:text-gray-400">{{ field.name }}:</span>
                <div class="mt-1">
                  <FieldRenderer
                    :field="field"
                    :value="record.data[field.id]"
                    :readonly="true"
                    :compact="true"
                  />
                </div>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(record.updatedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Column -->
    <div class="shrink-0 w-80">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <button
          @click="showAddColumnModal = true"
          class="w-full h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <div class="text-center">
            <PlusIcon class="w-8 h-8 mx-auto mb-2" />
            <span class="text-sm font-medium">Add Column</span>
          </div>
        </button>
      </div>
    </div>
  </div>

  <!-- Add Column Modal -->
  <div
    v-if="showAddColumnModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Kanban Column
      </h3>
      <div class="space-y-4">
        <div>
          <label class="form-label">Column Name</label>
          <input
            v-model="newColumnName"
            type="text"
            class="form-input"
            placeholder="Enter column name"
          />
        </div>
        <div>
          <label class="form-label">Field Value</label>
          <input
            v-model="newColumnValue"
            type="text"
            class="form-input"
            placeholder="Enter field value"
          />
        </div>
      </div>
      <div class="flex justify-end space-x-3 mt-6">
        <button
          @click="showAddColumnModal = false"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="addColumn"
          class="btn-primary"
        >
          Add Column
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Table, Record } from '@/types/database'
import { FieldType } from '@/types/database'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import FieldRenderer from '@/components/FieldRenderers/FieldRenderer.vue'

interface Props {
  table: Table
  records: Record[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit-record': [record: Record]
  'delete-record': [record: Record]
  'update-record': [recordId: string, data: any]
}>()

const showAddColumnModal = ref(false)
const newColumnName = ref('')
const newColumnValue = ref('')
const draggedRecord = ref<Record | null>(null)

// Default kanban columns based on common status field
const kanbanColumns = ref([
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' }
])

const statusField = computed(() => 
  props.table.fields.find(field => 
    field.name.toLowerCase().includes('status') || 
    field.type === FieldType.ENUM
  )
)

const displayFields = computed(() => 
  props.table.fields.filter(field => 
    !field.isPrimary && 
    field.id !== statusField.value?.id
  ).slice(0, 3)
)

const getColumnRecords = (columnValue: string) => {
  if (!statusField.value) return []
  
  return props.records.filter(record => 
    record.data[statusField.value!.id] === columnValue
  )
}

const getPrimaryFieldValue = (record: Record) => {
  const primaryField = props.table.fields.find(field => field.isPrimary)
  if (primaryField) {
    return record.data[primaryField.id] || 'Untitled'
  }
  return 'Untitled'
}

const onDragStart = (event: DragEvent, record: Record) => {
  draggedRecord.value = record
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDrop = (event: DragEvent, columnValue: string) => {
  event.preventDefault()
  
  if (draggedRecord.value && statusField.value) {
    const updateData = {
      [statusField.value.id]: columnValue
    }
    
    emit('update-record', draggedRecord.value.id, updateData)
    draggedRecord.value = null
  }
}

const addColumn = () => {
  if (newColumnName.value && newColumnValue.value) {
    kanbanColumns.value.push({
      label: newColumnName.value,
      value: newColumnValue.value
    })
    
    newColumnName.value = ''
    newColumnValue.value = ''
    showAddColumnModal.value = false
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>