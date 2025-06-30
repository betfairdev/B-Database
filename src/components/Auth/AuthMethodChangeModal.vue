<template>
  <Modal size="sm">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          Change Authentication Method
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
    </template>

    <div class="space-y-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <div class="font-medium text-blue-800 dark:text-blue-200 text-sm">
              Current Method: {{ currentMethod }}
            </div>
            <div class="text-blue-700 dark:text-blue-300 text-sm mt-1">
              Choose a new authentication method below
            </div>
          </div>
        </div>
      </div>

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

      <!-- PIN Setup -->
      <div v-if="selectedMethod === 'pin'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter New PIN (4-8 digits)
          </label>
          <input
            v-model="newPin"
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

      <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center">
        {{ error }}
      </div>
    </div>

    <template #footer>
      <div class="flex space-x-3">
        <button
          @click="$emit('close')"
          class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="saveChanges"
          :disabled="!canSave || isLoading"
          class="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          <div v-if="isLoading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Saving...
          </div>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { BiometricAuthService } from '@/services/BiometricAuthService'
import { PinAuthService } from '@/services/PinAuthService'
import {
  XMarkIcon,
  FingerPrintIcon,
  LockClosedIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()

const selectedMethod = ref<'biometric' | 'pin'>('pin')
const biometricAvailable = ref(false)
const newPin = ref('')
const confirmPin = ref('')
const error = ref('')
const isLoading = ref(false)

const currentMethod = computed(() => {
  return authStore.authMethod === 'biometric' ? 'Biometric' : 'PIN Code'
})

const canSave = computed(() => {
  if (selectedMethod.value === 'biometric') {
    return biometricAvailable.value
  }
  return newPin.value.length >= 4 && newPin.value === confirmPin.value
})

const saveChanges = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (selectedMethod.value === 'biometric') {
      const result = await BiometricAuthService.enrollBiometric()
      if (result.success) {
        localStorage.setItem('preferBiometric', 'true')
        authStore.authMethod = 'biometric'
        emit('success')
      } else {
        error.value = result.error || 'Failed to set up biometric authentication'
      }
    } else {
      if (newPin.value !== confirmPin.value) {
        error.value = 'PINs do not match'
        return
      }
      
      const success = await PinAuthService.setPin(newPin.value)
      if (success) {
        localStorage.removeItem('preferBiometric')
        authStore.authMethod = 'pin'
        emit('success')
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
  selectedMethod.value = authStore.authMethod || 'pin'
})
</script>