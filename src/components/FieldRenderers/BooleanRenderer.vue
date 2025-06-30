<template>
  <div class="boolean-renderer">
    <div v-if="readonly" class="boolean-renderer-display">
      <div class="flex items-center space-x-2">
        <CheckCircleIcon
          v-if="value"
          class="w-5 h-5 text-green-500"
        />
        <XCircleIcon
          v-else
          class="w-5 h-5 text-gray-400"
        />
        <span class="text-sm text-gray-900 dark:text-white">
          {{ value ? 'Yes' : 'No' }}
        </span>
      </div>
    </div>
    <div v-else class="boolean-renderer-input">
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="value"
            @change="updateValue"
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span class="text-sm text-gray-900 dark:text-white">
            {{ field.name }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Field } from '@/types/database'
import {
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: boolean
  readonly?: boolean
  compact?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: boolean]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.checked)
}
</script>