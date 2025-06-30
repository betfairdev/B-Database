<template>
  <div class="space-y-1">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <div v-if="iconLeft" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="iconLeft" class="w-4 h-4 text-gray-400" />
      </div>
      
      <textarea
        v-if="type === 'textarea'"
        :id="id"
        :value="modelValue"
        @input="updateValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :rows="rows"
        :maxlength="maxlength"
        :minlength="minlength"
        :class="[
          'form-input resize-none',
          {
            'pl-10': iconLeft,
            'pr-10': iconRight
          }
        ]"
      />
      
      <input
        v-else
        :id="id"
        :type="type"
        :value="modelValue"
        @input="updateValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :inputmode="inputmode"
        :pattern="pattern"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        :class="[
          'form-input',
          {
            'pl-10': iconLeft,
            'pr-10': iconRight
          }
        ]"
      />
      
      <div v-if="iconRight" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <component :is="iconRight" class="w-4 h-4 text-gray-400" />
      </div>
    </div>
    
    <div v-if="error" class="text-xs text-red-600 dark:text-red-400">
      {{ error }}
    </div>
    
    <div v-if="hint" class="text-xs text-gray-500 dark:text-gray-400">
      {{ hint }}
    </div>
    
    <div v-if="maxlength && showCounter" class="text-xs text-gray-500 dark:text-gray-400 text-right">
      {{ (modelValue || '').length }} / {{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'color' | 'textarea'
  modelValue?: string | number
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  iconLeft?: any
  iconRight?: any
  inputmode?: string
  pattern?: string
  maxlength?: number
  minlength?: number
  min?: string | number
  max?: string | number
  step?: string | number
  rows?: number
  showCounter?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  rows: 4,
  showCounter: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>