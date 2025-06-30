<template>
  <div class="color-renderer">
    <div v-if="readonly" class="color-renderer-display">
      <div v-if="value" class="flex items-center space-x-2">
        <div
          class="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 shrink-0"
          :style="{ backgroundColor: value }"
        ></div>
        <span class="text-sm text-gray-900 dark:text-white font-mono">
          {{ value.toUpperCase() }}
        </span>
      </div>
      <div v-else class="flex items-center space-x-2">
        <div class="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"></div>
        <span class="text-sm text-gray-500 dark:text-gray-400">-</span>
      </div>
    </div>
    <div v-else class="color-renderer-input">
      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <input
            type="color"
            :value="value || '#000000'"
            @input="updateValue"
            class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            :value="value"
            @input="updateTextValue"
            @blur="validateColor"
            :placeholder="field.name || '#000000'"
            :required="field.isRequired"
            class="form-input flex-1 font-mono"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
        
        <div class="grid grid-cols-8 gap-2">
          <button
            v-for="preset in colorPresets"
            :key="preset"
            @click="selectPreset(preset)"
            class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
            :style="{ backgroundColor: preset }"
            :title="preset"
          ></button>
        </div>
        
        <div v-if="colorError" class="text-xs text-red-600 dark:text-red-400">
          {{ colorError }}
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Supports hex colors (#RRGGBB format)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from '@/types/database'

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

const colorError = ref('')

const colorPresets = [
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00',
  '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
  '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
  '#000000', '#404040', '#808080', '#C0C0C0'
]

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
  colorError.value = ''
}

const updateTextValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
  colorError.value = ''
}

const validateColor = () => {
  if (props.value && !isValidColor(props.value)) {
    colorError.value = 'Please enter a valid hex color (e.g., #FF0000)'
  } else {
    colorError.value = ''
  }
}

const isValidColor = (color: string) => {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/
  return hexRegex.test(color)
}

const selectPreset = (color: string) => {
  emit('update:value', color)
  colorError.value = ''
}
</script>