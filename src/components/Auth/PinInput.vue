<template>
  <div class="pin-input">
    <div class="relative">
      <input
        v-model="localPin"
        type="password"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="8"
        class="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-xl tracking-widest"
        :placeholder="placeholder"
        @input="handleInput"
        @keyup.enter="$emit('submit', localPin)"
      />
    </div>
    
    <!-- PIN Dots -->
    <div class="flex justify-center space-x-3 mt-4">
      <div
        v-for="i in maxLength"
        :key="i"
        class="w-3 h-3 rounded-full transition-colors duration-200"
        :class="i <= localPin.length ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
      ></div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  maxLength?: number
  error?: string
  autoSubmit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter PIN',
  maxLength: 8,
  autoSubmit: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [value: string]
}>()

const localPin = ref(props.modelValue || '')

const handleInput = () => {
  emit('update:modelValue', localPin.value)
  
  if (props.autoSubmit && localPin.value.length >= 4) {
    emit('submit', localPin.value)
  }
}

watch(() => props.modelValue, (newValue) => {
  localPin.value = newValue || ''
})
</script>