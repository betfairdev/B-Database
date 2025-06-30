<template>
  <div class="email-renderer">
    <div v-if="readonly" class="email-renderer-display">
      <div v-if="value" class="flex items-center space-x-2">
        <EnvelopeIcon class="w-4 h-4 text-gray-400 shrink-0" />
        <a
          :href="`mailto:${value}`"
          class="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          :class="{ 'truncate': compact }"
        >
          {{ value }}
        </a>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="email-renderer-input">
      <BaseInput
        :model-value="value"
        type="email"
        :label="field.name"
        :required="field.isRequired"
        :icon-left="EnvelopeIcon"
        :error="emailError"
        @update:model-value="updateValue"
        @blur="validateEmail"
      />
      
      <div v-if="value && isValidEmail(value)" class="flex items-center space-x-2 mt-2">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="sendEmail"
        >
          Send Email
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="copyEmail"
        >
          Copy
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from '@/types/database'
import { EnvelopeIcon } from '@heroicons/vue/24/outline'
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

const emailError = ref('')

const updateValue = (value: string | number) => {
  emit('update:value', String(value))
  emailError.value = ''
}

const validateEmail = () => {
  if (props.value && !isValidEmail(props.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const sendEmail = () => {
  if (props.value) {
    window.location.href = `mailto:${props.value}`
  }
}

const copyEmail = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(props.value)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy email:', error)
    }
  }
}
</script>