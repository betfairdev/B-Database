<template>
  <div class="number-renderer">
    <div v-if="readonly" class="number-renderer-display">
      <span class="text-sm text-gray-900 dark:text-white">
        {{ formatNumber(value) }}
      </span>
    </div>
    <div v-else class="number-renderer-input">
      <BaseInput
        :model-value="value"
        type="number"
        :label="field.name"
        :required="field.isRequired"
        :min="field.validation?.min"
        :max="field.validation?.max"
        :step="getStep()"
        :hint="getHint()"
        @update:model-value="updateValue"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Field } from '@/types/database'
import BaseInput from '@/components/UI/BaseInput.vue'

interface Props {
  field: Field
  value: number
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: number]
}>()

const updateValue = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  emit('update:value', isNaN(numValue) ? 0 : numValue)
}

const formatNumber = (value: number) => {
  if (value === null || value === undefined) return '-'
  
  const precision = props.field.options?.precision || 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value)
}

const getStep = () => {
  const precision = props.field.options?.precision || 0
  return precision > 0 ? Math.pow(10, -precision) : 1
}

const getHint = () => {
  if (props.field.validation?.min !== undefined || props.field.validation?.max !== undefined) {
    return `Range: ${props.field.validation?.min || 0} - ${props.field.validation?.max || '∞'}`
  }
  return undefined
}
</script>