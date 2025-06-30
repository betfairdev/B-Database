<template>
  <div class="qr-code-renderer">
    <div v-if="readonly" class="qr-code-renderer-display">
      <div v-if="value" class="space-y-3">
        <div class="flex items-center space-x-2">
          <QrCodeIcon class="w-4 h-4 text-gray-400" />
          <span class="text-sm text-gray-900 dark:text-white">
            {{ compact ? truncateValue(value) : value }}
          </span>
        </div>
        <div v-if="!compact" class="bg-white p-4 rounded border inline-block">
          <canvas ref="qrCanvas" class="w-32 h-32"></canvas>
        </div>
        <div v-if="!compact" class="flex items-center space-x-2">
          <button
            @click="copyQRValue"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy Value
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="downloadQR"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Download QR
          </button>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="qr-code-renderer-input">
      <div class="space-y-3">
        <textarea
          :value="value"
          @input="updateValue"
          :placeholder="field.name || 'Enter QR code data'"
          :required="field.isRequired"
          rows="3"
          class="form-input resize-none"
        />
        
        <div class="flex items-center space-x-3">
          <button
            @click="scanQRCode"
            class="btn-secondary flex items-center"
          >
            <QrCodeIcon class="w-4 h-4 mr-2" />
            Scan QR Code
          </button>
          
          <select
            v-model="qrOptions.errorCorrectionLevel"
            @change="generateQR"
            class="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>
        
        <div v-if="value" class="bg-white p-4 rounded border inline-block">
          <canvas ref="qrPreview" class="w-32 h-32"></canvas>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Enter text, URL, or other data to encode in QR code
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, reactive, onMounted } from 'vue'
import type { Field } from '@/types/database'
import { QrCodeIcon } from '@heroicons/vue/24/outline'
import QRCode from 'qrcode'

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

const qrCanvas = ref<HTMLCanvasElement>()
const qrPreview = ref<HTMLCanvasElement>()

const qrOptions = reactive({
  errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
  margin: 4,
  scale: 4,
  width: 128
})

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:value', target.value)
}

const generateQR = async () => {
  if (!props.value) return
  
  await nextTick()
  const canvas = props.readonly ? qrCanvas.value : qrPreview.value
  
  if (canvas) {
    try {
      await QRCode.toCanvas(canvas, props.value, {
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        margin: qrOptions.margin,
        scale: qrOptions.scale,
        width: qrOptions.width,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }
}

const scanQRCode = () => {
  // In a real implementation, this would open camera for QR code scanning
  // For now, we'll simulate with a prompt
  const scannedValue = prompt('Simulated QR scan - enter value:')
  if (scannedValue) {
    emit('update:value', scannedValue)
  }
}

const copyQRValue = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(props.value)
    } catch (error) {
      console.error('Failed to copy QR value:', error)
    }
  }
}

const downloadQR = async () => {
  if (!props.value || !qrCanvas.value) return
  
  try {
    const dataURL = await QRCode.toDataURL(props.value, {
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      margin: qrOptions.margin,
      scale: 8,
      width: 512
    })
    
    const link = document.createElement('a')
    link.download = `qr-code-${Date.now()}.png`
    link.href = dataURL
    link.click()
  } catch (error) {
    console.error('Failed to download QR code:', error)
  }
}

const truncateValue = (value: string) => {
  return value.length > 30 ? value.substring(0, 30) + '...' : value
}

watch(() => props.value, () => {
  if (props.value) {
    generateQR()
  }
}, { immediate: true })

onMounted(() => {
  if (props.value) {
    generateQR()
  }
})
</script>