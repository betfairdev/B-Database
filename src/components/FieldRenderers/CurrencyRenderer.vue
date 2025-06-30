<template>
  <div class="currency-renderer">
    <div v-if="readonly" class="currency-renderer-display">
      <span class="text-sm text-gray-900 dark:text-white font-medium">
        {{ formatCurrency(value) }}
      </span>
    </div>
    <div v-else class="currency-renderer-input">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500 dark:text-gray-400 text-sm">
            {{ getCurrencySymbol() }}
          </span>
        </div>
        <input
          type="number"
          :value="value"
          @input="updateValue"
          :placeholder="field.name"
          :required="field.isRequired"
          :min="field.validation?.min"
          :max="field.validation?.max"
          step="0.01"
          class="form-input pl-8"
        />
      </div>
      <div class="flex items-center justify-between mt-1">
        <select
          :value="field.options?.currency || 'USD'"
          @change="updateCurrency"
          class="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="CAD">CAD</option>
          <option value="AUD">AUD</option>
        </select>
        <div v-if="field.validation?.min !== undefined || field.validation?.max !== undefined" class="text-xs text-gray-500 dark:text-gray-400">
          Range: {{ formatCurrency(field.validation?.min || 0) }} - {{ formatCurrency(field.validation?.max || 999999) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Field } from '@/types/database'

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

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  const numValue = parseFloat(target.value)
  emit('update:value', isNaN(numValue) ? 0 : numValue)
}

const updateCurrency = (event: Event) => {
  const target = event.target as HTMLSelectElement
  // This would typically update the field options
  console.log('Currency changed to:', target.value)
}

const getCurrencySymbol = () => {
  const currency = props.field.options?.currency || 'USD'
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  }
  return symbols[currency] || '$'
}

const formatCurrency = (value: number) => {
  if (value === null || value === undefined) return '-'
  
  const currency = props.field.options?.currency || 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value)
}
</script>