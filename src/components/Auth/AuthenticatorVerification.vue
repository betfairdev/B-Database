<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <DevicePhoneMobileIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Two-Factor Authentication
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div class="space-y-6">
        <div>
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-xl tracking-widest"
            placeholder="000000"
            @input="handleInput"
          />
        </div>

        <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <button
          @click="verify"
          :disabled="code.length !== 6 || isLoading"
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          <div v-if="isLoading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Verifying...
          </div>
          <span v-else>Verify</span>
        </button>

        <div class="text-center">
          <button
            @click="showBackupCode = !showBackupCode"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
          >
            {{ showBackupCode ? 'Use authenticator code' : 'Use backup code instead' }}
          </button>
        </div>

        <div v-if="showBackupCode" class="space-y-3">
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backup Code
            </label>
            <input
              v-model="backupCode"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center font-mono"
              placeholder="Enter backup code"
              @input="handleBackupCodeInput"
            />
          </div>
          
          <button
            @click="verifyBackupCode"
            :disabled="!backupCode.trim() || isLoading"
            class="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Verify Backup Code
          </button>
        </div>

        <div class="text-center">
          <button
            @click="$emit('cancel')"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AuthenticatorService } from '@/services/AuthenticatorService'
import { DevicePhoneMobileIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const code = ref('')
const backupCode = ref('')
const error = ref('')
const isLoading = ref(false)
const showBackupCode = ref(false)

const handleInput = () => {
  error.value = ''
  if (code.value.length === 6) {
    setTimeout(verify, 500)
  }
}

const handleBackupCodeInput = () => {
  error.value = ''
}

const verify = async () => {
  if (code.value.length !== 6) return

  isLoading.value = true
  error.value = ''

  try {
    const result = await AuthenticatorService.verifyCode(code.value)
    if (result.success) {
      emit('success')
    } else {
      error.value = result.error || 'Invalid code'
      code.value = ''
    }
  } catch (err) {
    error.value = 'Verification failed'
  } finally {
    isLoading.value = false
  }
}

const verifyBackupCode = async () => {
  if (!backupCode.value.trim()) return

  isLoading.value = true
  error.value = ''

  try {
    const result = await AuthenticatorService.verifyCode(backupCode.value.trim())
    if (result.success) {
      emit('success')
    } else {
      error.value = result.error || 'Invalid backup code'
      backupCode.value = ''
    }
  } catch (err) {
    error.value = 'Verification failed'
  } finally {
    isLoading.value = false
  }
}
</script>