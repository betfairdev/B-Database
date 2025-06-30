<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div
      v-for="record in records"
      :key="record.id"
      class="card p-6 hover:shadow-md transition-shadow cursor-pointer group"
      @click="$emit('edit-record', record)"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ getPrimaryFieldValue(record) }}
          </h3>
        </div>
        <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click.stop="$emit('edit-record', record)"
            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <PencilIcon class="w-4 h-4" />
          </button>
          <button
            @click.stop="$emit('delete-record', record)"
            class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="field in displayFields"
          :key="field.id"
          class="flex items-start space-x-3"
        >
          <component
            :is="getFieldIcon(field.type)"
            class="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ field.name }}
            </div>
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
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{{ formatDate(record.updatedAt) }}</span>
          <span>v{{ record.version }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="records.length === 0" class="col-span-full text-center py-12">
      <DocumentTextIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">No records found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Table, Record } from '@/types/database'
import { FieldType } from '@/types/database'
import {
  PencilIcon,
  TrashIcon,
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

defineEmits<{
  'edit-record': [record: Record]
  'delete-record': [record: Record]
}>()

const displayFields = computed(() => 
  props.table.fields.filter(field => !field.isPrimary).slice(0, 4)
)

const getPrimaryFieldValue = (record: Record) => {
  const primaryField = props.table.fields.find(field => field.isPrimary)
  if (primaryField) {
    return record.data[primaryField.id] || 'Untitled'
  }
  return 'Untitled'
}

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

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>