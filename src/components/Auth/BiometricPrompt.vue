<template>
  <div class="biometric-prompt text-center">
    <button
      @click="authenticate"
      :disabled="isLoading"
      class="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200 disabled:opacity-50"
    >
      <FingerPrintIcon class="w-12 h-12 text-primary-600 dark:text-primary-400" />
    </button>
    
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>
    
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      {{ subtitle }}
    </p>
    
    <div v-if="isLoading" class="flex items-center justify-center">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Authenticating...</span>
    </div>
    
    <div v-if="error" class="text-red-600 dark:text-red-400 text-sm mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BiometricAuthService } from '@/services/BiometricAuthService'
import { FingerPrintIcon } from '@heroicons/vue/24/outline'

interface Props {
  title?: string
  subtitle?: string
  reason?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Biometric Authentication',
  subtitle: 'Touch the sensor to authenticate',
  reason: 'Authenticate to access your data'
})

const emit = defineEmits<{
  'success': []
  'error': [error: string]
}>()

const isLoading = ref(false)
const error = ref('')

const authenticate = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await BiometricAuthService.authenticate(props.reason)
    if (result.success) {
      emit('success')
    } else {
      error.value = result.error || 'Authentication failed'
      emit('error', error.value)
    }
  } catch (err) {
    error.value = 'Authentication failed'
    emit('error', error.value)
  } finally {
    isLoading.value = false
  }
}
</script>