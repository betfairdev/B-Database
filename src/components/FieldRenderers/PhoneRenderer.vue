<template>
  <div class="phone-renderer">
    <div v-if="readonly" class="phone-renderer-display">
      <div v-if="value" class="flex items-center space-x-2">
        <PhoneIcon class="w-4 h-4 text-gray-400 shrink-0" />
        <a
          :href="`tel:${value}`"
          class="text-primary-600 dark:text-primary-400 hover:underline text-sm"
        >
          {{ formatPhone(value) }}
        </a>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="phone-renderer-input">
      <div class="space-y-2">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PhoneIcon class="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="tel"
            :value="value"
            @input="updateValue"
            @blur="validatePhone"
            :placeholder="field.name || '+1 (555) 123-4567'"
            :required="field.isRequired"
            class="form-input pl-10"
          />
        </div>
        
        <div v-if="value && isValidPhone(value)" class="flex items-center space-x-2">
          <button
            @click="callPhone"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Call
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="sendSMS"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            SMS
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="copyPhone"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy
          </button>
        </div>
        
        <div v-if="phoneError" class="text-xs text-red-600 dark:text-red-400">
          {{ phoneError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from '@/types/database'
import {
  PhoneIcon
} from '@heroicons/vue/24/outline'

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

const phoneError = ref('')

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
  phoneError.value = ''
}

const validatePhone = () => {
  if (props.value && !isValidPhone(props.value)) {
    phoneError.value = 'Please enter a valid phone number'
  } else {
    phoneError.value = ''
  }
}

const isValidPhone = (phone: string) => {
  // Basic phone validation - can be enhanced
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  return phoneRegex.test(cleanPhone)
}

const formatPhone = (phone: string) => {
  // Basic US phone formatting - can be enhanced for international
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`
  } else if (cleanPhone.length === 11 && cleanPhone[0] === '1') {
    return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`
  }
  return phone
}

const callPhone = () => {
  if (props.value) {
    window.location.href = `tel:${props.value}`
  }
}

const sendSMS = () => {
  if (props.value) {
    window.location.href = `sms:${props.value}`
  }
}

const copyPhone = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(props.value)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy phone:', error)
    }
  }
}
</script>