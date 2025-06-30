<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          Setup Authenticator
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div v-if="step === 1" class="space-y-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <DevicePhoneMobileIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Install Authenticator App
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Download and install an authenticator app on your phone
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span class="text-green-600 dark:text-green-400 font-bold">G</span>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Google Authenticator</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Free • Recommended</div>
            </div>
          </div>

          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span class="text-blue-600 dark:text-blue-400 font-bold">A</span>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Authy</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Free • Cloud backup</div>
            </div>
          </div>
        </div>

        <button
          @click="step = 2; generateCodes()"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          I have an authenticator app
        </button>
      </div>

      <div v-else-if="step === 2" class="space-y-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Scan QR Code
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Open your authenticator app and scan this QR code
          </p>
        </div>

        <div class="flex justify-center">
          <div class="bg-white p-4 rounded-lg">
            <canvas ref="qrCanvas" class="w-48 h-48"></canvas>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Can't scan? Enter this code manually:
          </div>
          <div class="font-mono text-sm text-gray-600 dark:text-gray-400 break-all">
            {{ authenticatorData?.secret }}
          </div>
        </div>

        <button
          @click="step = 3"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          I've added the account
        </button>
      </div>

      <div v-else-if="step === 3" class="space-y-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Verify Setup
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div>
          <input
            v-model="verificationCode"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-xl tracking-widest"
            placeholder="000000"
            @input="handleCodeInput"
          />
        </div>

        <div v-if="verificationError" class="text-red-600 dark:text-red-400 text-sm text-center">
          {{ verificationError }}
        </div>

        <button
          @click="verifyCode"
          :disabled="verificationCode.length !== 6 || isVerifying"
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          <div v-if="isVerifying" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Verifying...
          </div>
          <span v-else>Verify & Enable</span>
        </button>
      </div>

      <div v-else-if="step === 4" class="space-y-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Authenticator Enabled!
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Save these backup codes in a safe place
          </p>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <ExclamationTriangleIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <div class="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                Important: Save these backup codes
              </div>
              <div class="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                Use these codes if you lose access to your authenticator app
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="grid grid-cols-2 gap-2 font-mono text-sm">
            <div
              v-for="code in authenticatorData?.backupCodes"
              :key="code"
              class="text-center py-2 bg-white dark:bg-gray-800 rounded border"
            >
              {{ code }}
            </div>
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            @click="downloadBackupCodes"
            class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Download Codes
          </button>
          <button
            @click="finishSetup"
            class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Finish Setup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AuthenticatorService } from '@/services/AuthenticatorService'
import type { AuthenticatorCode } from '@/services/AuthenticatorService'
import {
  XMarkIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  close: []
  success: []
}>()

const step = ref(1)
const verificationCode = ref('')
const verificationError = ref('')
const isVerifying = ref(false)
const authenticatorData = ref<AuthenticatorCode | null>(null)
const qrCanvas = ref<HTMLCanvasElement>()

const generateCodes = async () => {
  try {
    authenticatorData.value = await AuthenticatorService.setupAuthenticator()
    generateQRCode()
  } catch (error) {
    console.error('Failed to generate authenticator codes:', error)
  }
}

const generateQRCode = () => {
  if (!qrCanvas.value || !authenticatorData.value) return

  // DEMO IMPLEMENTATION: Simple QR code pattern for demonstration purposes
  // In production, use a proper QR code library like 'qrcode.vue' or 'qrcode.js'
  const canvas = qrCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 192
  canvas.height = 192

  // Fill with white background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 192, 192)

  // Draw a simple pattern representing QR code
  ctx.fillStyle = '#000000'
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      if ((i + j) % 3 === 0) {
        ctx.fillRect(i * 8, j * 8, 8, 8)
      }
    }
  }

  // Add text overlay
  ctx.fillStyle = '#666666'
  ctx.font = '12px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('QR Code', 96, 100)
  ctx.fillText('(Demo)', 96, 115)
}

const handleCodeInput = () => {
  verificationError.value = ''
  // Auto-verify when 6 digits are entered
  if (verificationCode.value.length === 6) {
    setTimeout(verifyCode, 500)
  }
}

const verifyCode = async () => {
  if (verificationCode.value.length !== 6) return

  isVerifying.value = true
  verificationError.value = ''

  try {
    const result = await AuthenticatorService.verifyCode(verificationCode.value)
    if (result.success) {
      step.value = 4
    } else {
      verificationError.value = result.error || 'Invalid code'
      verificationCode.value = ''
    }
  } catch (error) {
    verificationError.value = 'Verification failed'
  } finally {
    isVerifying.value = false
  }
}

const downloadBackupCodes = () => {
  if (!authenticatorData.value) return

  const content = `Database Manager - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes:\n${authenticatorData.value.backupCodes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'database-manager-backup-codes.txt'
  a.click()
  URL.revokeObjectURL(url)
}

const finishSetup = () => {
  emit('success')
}

onMounted(() => {
  // Check if already set up
  if (AuthenticatorService.isSetup()) {
    step.value = 4
    // Get existing backup codes
    const backupCodes = AuthenticatorService.getBackupCodes()
    authenticatorData.value = {
      secret: '',
      qrCode: '',
      backupCodes
    }
  }
})
</script>