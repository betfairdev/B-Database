<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <FingerPrintIcon class="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Secure Your Data
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Set up authentication to protect your databases
        </p>
      </div>

      <div class="space-y-6">
        <!-- Biometric Option -->
        <div
          v-if="biometricAvailable"
          class="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/20': selectedMethod === 'biometric' }"
          @click="selectedMethod = 'biometric'"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <FingerPrintIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white">Biometric</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Use fingerprint or face recognition</p>
            </div>
            <div class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <div
                v-if="selectedMethod === 'biometric'"
                class="w-3 h-3 bg-primary-600 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- PIN Option -->
        <div
          class="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/20': selectedMethod === 'pin' }"
          @click="selectedMethod = 'pin'"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <LockClosedIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white">PIN Code</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Use a 4-8 digit PIN</p>
            </div>
            <div class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <div
                v-if="selectedMethod === 'pin'"
                class="w-3 h-3 bg-primary-600 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- PIN Input -->
        <div v-if="selectedMethod === 'pin'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter PIN (4-8 digits)
            </label>
            <input
              v-model="pin"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="8"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-lg tracking-widest"
              placeholder="••••"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm PIN
            </label>
            <input
              v-model="confirmPin"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="8"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-lg tracking-widest"
              placeholder="••••"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <!-- Setup Button -->
        <button
          @click="setupAuth"
          :disabled="!canSetup || isLoading"
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <div v-if="isLoading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Setting up...
          </div>
          <span v-else>Set Up Authentication</span>
        </button>

        <!-- Skip Option -->
        <button
          @click="$emit('skip')"
          class="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium py-2 transition-colors duration-200"
        >
          Skip for now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BiometricAuthService } from '../../services/BiometricAuthService'
import { PinAuthService } from '../../services/PinAuthService'
import {
  FingerPrintIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  success: [method: 'biometric' | 'pin']
  skip: []
}>()

const selectedMethod = ref<'biometric' | 'pin'>('pin')
const biometricAvailable = ref(false)
const pin = ref('')
const confirmPin = ref('')
const error = ref('')
const isLoading = ref(false)

const canSetup = computed(() => {
  if (selectedMethod.value === 'biometric') {
    return biometricAvailable.value
  }
  return pin.value.length >= 4 && pin.value === confirmPin.value
})

const setupAuth = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (selectedMethod.value === 'biometric') {
      const result = await BiometricAuthService.enrollBiometric()
      if (result.success) {
        emit('success', 'biometric')
      } else {
        error.value = result.error || 'Failed to set up biometric authentication'
      }
    } else {
      if (pin.value !== confirmPin.value) {
        error.value = 'PINs do not match'
        return
      }
      
      const success = await PinAuthService.setPin(pin.value)
      if (success) {
        emit('success', 'pin')
      } else {
        error.value = 'Failed to set up PIN'
      }
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  biometricAvailable.value = await BiometricAuthService.isAvailable()
  if (biometricAvailable.value) {
    selectedMethod.value = 'biometric'
  }
})
</script>