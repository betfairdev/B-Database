<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <component
            :is="authMethod === 'biometric' ? FingerPrintIcon : LockClosedIcon"
            class="w-10 h-10 text-primary-600 dark:text-primary-400"
          />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ authMethod === 'biometric' ? 'Use your biometric to unlock' : 'Enter your PIN to continue' }}
        </p>
      </div>

      <div class="space-y-6">
        <!-- Biometric Auth -->
        <BiometricPrompt
          v-if="authMethod === 'biometric'"
          @success="handleAuthSuccess"
          @error="handleAuthError"
        />

        <!-- PIN Auth -->
        <PinInput
          v-else
          v-model="pin"
          :error="error"
          @submit="handlePinSubmit"
        />

        <!-- Alternative Auth Method -->
        <div class="text-center">
          <button
            @click="switchAuthMethod"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors duration-200"
          >
            {{ authMethod === 'biometric' ? 'Use PIN instead' : 'Use biometric instead' }}
          </button>
        </div>

        <!-- Reset Auth -->
        <div class="text-center">
          <button
            @click="showResetModal = true"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm transition-colors duration-200"
          >
            Reset authentication
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Authentication Modal -->
    <div v-if="showResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Reset Authentication
          </h2>
          <button
            @click="showResetModal = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div v-if="authStore.hasAuthenticatorSetup" class="space-y-4">
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <div class="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                  Authenticator Verification Required
                </div>
                <div class="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                  Enter your authenticator code to reset authentication
                </div>
              </div>
            </div>
          </div>

          <div>
            <input
              v-model="resetCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="8"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center font-mono"
              placeholder="Enter authenticator code"
            />
          </div>

          <div v-if="resetError" class="text-red-600 dark:text-red-400 text-sm text-center">
            {{ resetError }}
          </div>

          <div class="flex space-x-3">
            <button
              @click="showResetModal = false"
              class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="performReset"
              :disabled="!resetCode.trim() || isResetting"
              class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <div v-if="isResetting" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resetting...
              </div>
              <span v-else>Reset</span>
            </button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <ExclamationTriangleIcon class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <div class="font-medium text-red-800 dark:text-red-200 text-sm">
                  Warning: This will reset all authentication
                </div>
                <div class="text-red-700 dark:text-red-300 text-sm mt-1">
                  You will need to set up authentication again
                </div>
              </div>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              @click="showResetModal = false"
              class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="performReset"
              :disabled="isResetting"
              class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <div v-if="isResetting" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resetting...
              </div>
              <span v-else>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Authenticator Verification -->
    <AuthenticatorVerification
      v-if="showAuthenticatorVerification"
      @success="handleAuthenticatorSuccess"
      @cancel="showAuthenticatorVerification = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { BiometricAuthService } from '../../services/BiometricAuthService'
import { PinAuthService } from '../../services/PinAuthService'
import {
  FingerPrintIcon,
  LockClosedIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import AuthenticatorVerification from './AuthenticatorVerification.vue'
import PinInput from './PinInput.vue'
import BiometricPrompt from './BiometricPrompt.vue'

const emit = defineEmits<{
  success: []
  reset: []
}>()

const authStore = useAuthStore()

const authMethod = ref<'biometric' | 'pin'>('pin')
const pin = ref('')
const error = ref('')
const biometricAvailable = ref(false)
const showResetModal = ref(false)
const showAuthenticatorVerification = ref(false)
const resetCode = ref('')
const resetError = ref('')
const isResetting = ref(false)

const handlePinSubmit = async (pinValue: string) => {
  error.value = ''
  
  const isValid = await authStore.authenticateWithPin(pinValue)
  if (isValid) {
    await handleAuthSuccess()
  } else {
    error.value = 'Invalid PIN'
    pin.value = ''
  }
}

const handleAuthSuccess = async () => {
  if (authStore.hasAuthenticatorSetup && !authStore.authenticatorVerified) {
    showAuthenticatorVerification.value = true
  } else {
    emit('success')
  }
}

const handleAuthError = (errorMessage: string) => {
  error.value = errorMessage
}

const handleAuthenticatorSuccess = () => {
  showAuthenticatorVerification.value = false
  emit('success')
}

const switchAuthMethod = () => {
  error.value = ''
  pin.value = ''
  
  // Switch between biometric and PIN
  const newMethod = authMethod.value === 'biometric' ? 'pin' : 'biometric'
  authMethod.value = newMethod
  
  // Persist the user's preference
  if (newMethod === 'biometric') {
    localStorage.setItem('preferBiometric', 'true')
  } else {
    localStorage.removeItem('preferBiometric')
  }
}

const performReset = async () => {
  isResetting.value = true
  resetError.value = ''

  try {
    await authStore.resetAuth(resetCode.value)
    showResetModal.value = false
    emit('reset')
  } catch (error: any) {
    resetError.value = error.message || 'Reset failed'
  } finally {
    isResetting.value = false
  }
}

onMounted(async () => {
  biometricAvailable.value = await BiometricAuthService.isAvailable()
  
  // Determine default auth method based on availability and user preference
  if (biometricAvailable.value && localStorage.getItem('preferBiometric') === 'true') {
    authMethod.value = 'biometric'
  } else if (PinAuthService.hasPinSet()) {
    authMethod.value = 'pin'
  }
})
</script>