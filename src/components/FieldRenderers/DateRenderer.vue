<template>
  <div class="date-renderer">
    <div v-if="readonly" class="date-renderer-display">
      <span class="text-sm text-gray-900 dark:text-white">
        {{ formatDate(value) }}
      </span>
    </div>
    <div v-else class="date-renderer-input">
      <input
        :type="getInputType()"
        :value="getInputValue()"
        @input="updateValue"
        :placeholder="field.name"
        :required="field.isRequired"
        class="form-input"
      />
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Format: {{ getFormatHint() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Field } from '@/types/database'
import { FieldType } from '@/types/database'

interface Props {
  field: Field
  value: string | Date
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
}

const getInputType = () => {
  switch (props.field.type) {
    case FieldType.DATE:
      return 'date'
    case FieldType.TIME:
      return 'time'
    case FieldType.DATETIME:
      return 'datetime-local'
    default:
      return 'date'
  }
}

const getInputValue = () => {
  if (!props.value) return ''
  
  const date = new Date(props.value)
  if (isNaN(date.getTime())) return ''
  
  switch (props.field.type) {
    case FieldType.DATE:
      return date.toISOString().split('T')[0]
    case FieldType.TIME:
      return date.toTimeString().split(' ')[0].substring(0, 5)
    case FieldType.DATETIME:
      return date.toISOString().slice(0, 16)
    default:
      return date.toISOString().split('T')[0]
  }
}

const formatDate = (value: string | Date) => {
  if (!value) return '-'
  
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  const format = props.field.options?.dateFormat || 'default'
  
  switch (props.field.type) {
    case FieldType.DATE:
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    case FieldType.TIME:
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    case FieldType.DATETIME:
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    default:
      return date.toLocaleDateString()
  }
}

const getFormatHint = () => {
  switch (props.field.type) {
    case FieldType.DATE:
      return 'YYYY-MM-DD'
    case FieldType.TIME:
      return 'HH:MM'
    case FieldType.DATETIME:
      return 'YYYY-MM-DD HH:MM'
    default:
      return 'YYYY-MM-DD'
  }
}
</script>