<template>
  <div class="enum-renderer">
    <div v-if="readonly" class="enum-renderer-display">
      <span
        v-if="value"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
      >
        {{ value }}
      </span>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="enum-renderer-input">
      <div class="space-y-3">
        <BaseSelect
          :model-value="value"
          :label="field.name"
          :required="field.isRequired"
          :options="enumSelectOptions"
          @update:model-value="updateValue"
        />
        
        <div class="flex items-center space-x-2">
          <BaseInput
            v-model="newOption"
            type="text"
            placeholder="Add new option"
            @keyup.enter="addOption"
          />
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="!newOption.trim()"
            @click="addOption"
          >
            Add
          </BaseButton>
        </div>
        
        <div v-if="enumOptions.length > 0" class="space-y-2">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
            Available Options:
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(option, index) in enumOptions"
              :key="option"
              class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
            >
              <span class="text-xs text-gray-700 dark:text-gray-300">{{ option }}</span>
              <BaseButton
                variant="ghost"
                size="sm"
                :icon-left="XMarkIcon"
                @click="removeOption(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import BaseSelect from '@/components/UI/BaseSelect.vue'
import BaseInput from '@/components/UI/BaseInput.vue'
import BaseButton from '@/components/UI/BaseButton.vue'

interface Props {
  field: Field
  value: string
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const newOption = ref('')

const enumOptions = computed(() => 
  props.field.options?.enumValues || []
)

const enumSelectOptions = computed(() => {
  const options = enumOptions.value.map(option => ({
    value: option,
    label: option
  }))
  
  if (!props.field.isRequired) {
    options.unshift({ value: '', label: 'None' })
  }
  
  return options
})

const updateValue = (value: string | number) => {
  emit('update:value', String(value))
}

const addOption = () => {
  if (newOption.value.trim() && !enumOptions.value.includes(newOption.value.trim())) {
    // In a real implementation, this would update the field options
    // For now, we'll just emit an event or handle it differently
    console.log('Add option:', newOption.value.trim())
    newOption.value = ''
  }
}

const removeOption = (index: number) => {
  // In a real implementation, this would update the field options
  console.log('Remove option at index:', index)
}
</script>