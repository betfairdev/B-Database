<template>
  <div class="text-renderer">
    <div v-if="readonly" class="text-renderer-display">
      <span
        v-if="compact && value && value.length > 50"
        :title="value"
        class="text-sm text-gray-900 dark:text-white truncate"
      >
        {{ value.substring(0, 50) }}...
      </span>
      <span
        v-else-if="field.type === 'long_text'"
        class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap"
      >
        {{ value || '-' }}
      </span>
      <span
        v-else
        class="text-sm text-gray-900 dark:text-white"
      >
        {{ value || '-' }}
      </span>
    </div>
    <div v-else class="text-renderer-input">
      <BaseInput
        v-if="field.type === 'long_text'"
        :model-value="value"
        type="textarea"
        :label="field.name"
        :required="field.isRequired"
        :maxlength="field.validation?.maxLength"
        :minlength="field.validation?.minLength"
        :show-counter="!!field.validation?.maxLength"
        @update:model-value="updateValue"
      />
      <BaseInput
        v-else
        :model-value="value"
        type="text"
        :label="field.name"
        :required="field.isRequired"
        :maxlength="field.validation?.maxLength"
        :minlength="field.validation?.minLength"
        :pattern="field.validation?.pattern"
        :show-counter="!!field.validation?.maxLength"
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
  value: string
  readonly?: boolean
  compact?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const updateValue = (value: string | number) => {
  emit('update:value', String(value))
}
</script>