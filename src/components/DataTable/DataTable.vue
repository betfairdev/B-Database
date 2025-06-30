<template>
  <div class="card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
            </th>
            <th
              v-for="field in table.fields"
              :key="field.id"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group cursor-pointer"
              @click="sortBy(field.id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <component
                    :is="getFieldIcon(field.type)"
                    class="w-4 h-4"
                  />
                  <span>{{ field.name }}</span>
                  <span v-if="field.isRequired" class="text-red-500">*</span>
                </div>
                <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="$emit('edit-field', field)"
                    class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button
                    @click.stop="$emit('delete-field', field)"
                    class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon class="w-3 h-3" />
                  </button>
                  <ChevronUpIcon
                    v-if="sortField === field.id && sortDirection === 'asc'"
                    class="w-4 h-4"
                  />
                  <ChevronDownIcon
                    v-else-if="sortField === field.id && sortDirection === 'desc'"
                    class="w-4 h-4"
                  />
                </div>
              </div>
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="record in sortedRecords"
            :key="record.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedRecords.includes(record.id) }"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                :checked="selectedRecords.includes(record.id)"
                @change="toggleSelectRecord(record.id)"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
            </td>
            <td
              v-for="field in table.fields"
              :key="field.id"
              class="px-6 py-4 whitespace-nowrap"
            >
              <FieldRenderer
                :field="field"
                :value="record.data[field.id]"
                :readonly="true"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
                <button
                  @click="$emit('edit-record', record)"
                  class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="$emit('delete-record', record)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bulk Actions -->
    <div
      v-if="selectedRecords.length > 0"
      class="bg-primary-50 dark:bg-primary-900/20 px-6 py-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm text-primary-700 dark:text-primary-300">
          {{ selectedRecords.length }} record(s) selected
        </span>
        <div class="flex items-center space-x-2">
          <button
            @click="bulkDelete"
            class="btn-danger text-sm"
          >
            Delete Selected
          </button>
          <button
            @click="bulkExport"
            class="btn-secondary text-sm"
          >
            Export Selected
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="records.length === 0" class="text-center py-12">
      <DocumentTextIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">No records found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Table, Record, Field } from '@/types/database'
import { FieldType } from '@/types/database'
import {
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  HashtagIcon,
  CalendarIcon,
  PhotoIcon,
  LinkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  SwatchIcon,
  CodeBracketIcon,
  CheckIcon
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
  'edit-field': [field: Field]
  'delete-field': [field: Field]
}>()

const selectedRecords = ref<string[]>([])
const sortField = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

const allSelected = computed(() => 
  props.records.length > 0 && selectedRecords.value.length === props.records.length
)

const sortedRecords = computed(() => {
  if (!sortField.value) return props.records
  
  return [...props.records].sort((a, b) => {
    const aValue = a.data[sortField.value!]
    const bValue = b.data[sortField.value!]
    
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const getFieldIcon = (type: FieldType) => {
  const icons = {
    [FieldType.TEXT]: DocumentTextIcon,
    [FieldType.LONG_TEXT]: DocumentTextIcon,
    [FieldType.NUMBER]: HashtagIcon,
    [FieldType.CURRENCY]: CurrencyDollarIcon,
    [FieldType.DATE]: CalendarIcon,
    [FieldType.TIME]: CalendarIcon,
    [FieldType.DATETIME]: CalendarIcon,
    [FieldType.IMAGE]: PhotoIcon,
    [FieldType.FILE]: DocumentTextIcon,
    [FieldType.GEOMETRY]: MapPinIcon,
    [FieldType.COLOR]: SwatchIcon,
    [FieldType.URL]: LinkIcon,
    [FieldType.EMAIL]: EnvelopeIcon,
    [FieldType.PHONE]: PhoneIcon,
    [FieldType.ENUM]: CheckIcon,
    [FieldType.JSON]: CodeBracketIcon,
    [FieldType.BOOLEAN]: CheckIcon,
    [FieldType.CSV]: DocumentTextIcon
  }
  return icons[type] || DocumentTextIcon
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedRecords.value = []
  } else {
    selectedRecords.value = props.records.map(r => r.id)
  }
}

const toggleSelectRecord = (recordId: string) => {
  const index = selectedRecords.value.indexOf(recordId)
  if (index > -1) {
    selectedRecords.value.splice(index, 1)
  } else {
    selectedRecords.value.push(recordId)
  }
}

const sortBy = (fieldId: string) => {
  if (sortField.value === fieldId) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = fieldId
    sortDirection.value = 'asc'
  }
}

const bulkDelete = () => {
  selectedRecords.value.forEach(recordId => {
    const record = props.records.find(r => r.id === recordId)
    if (record) {
      emit('delete-record', record)
    }
  })
  selectedRecords.value = []
}

const bulkExport = () => {
  // Implementation for bulk export
  console.log('Bulk export:', selectedRecords.value)
}
</script>