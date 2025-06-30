<template>
  <div class="barcode-renderer">
    <div v-if="readonly" class="barcode-renderer-display">
      <div v-if="value" class="space-y-3">
        <div class="flex items-center space-x-2">
          <QrCodeIcon class="w-4 h-4 text-gray-400" />
          <span class="text-sm text-gray-900 dark:text-white font-mono">
            {{ value }}
          </span>
        </div>
        <div v-if="!compact" class="bg-white p-4 rounded border inline-block">
          <canvas ref="barcodeCanvas" class="max-w-full"></canvas>
        </div>
        <div v-if="!compact" class="flex items-center space-x-2">
          <button
            @click="copyBarcode"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy Value
          </button>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="barcode-renderer-input">
      <div class="space-y-3">
        <input
          type="text"
          :value="value"
          @input="updateValue"
          :placeholder="field.name || 'Enter barcode value'"
          :required="field.isRequired"
          class="form-input font-mono"
        />
        
        <div class="flex items-center space-x-3">
          <button
            @click="scanBarcode"
            class="btn-secondary flex items-center"
          >
            <QrCodeIcon class="w-4 h-4 mr-2" />
            Scan Barcode
          </button>
          
          <select
            v-model="barcodeFormat"
            @change="generateBarcode"
            class="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            <option value="CODE128">CODE128</option>
            <option value="CODE39">CODE39</option>
            <option value="EAN13">EAN13</option>
            <option value="UPC">UPC</option>
          </select>
        </div>
        
        <div v-if="value" class="bg-white p-4 rounded border">
          <canvas ref="previewCanvas" class="max-w-full"></canvas>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Enter a barcode value or use the scan button to capture from camera
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import type { Field } from '@/types/database'
import { QrCodeIcon } from '@heroicons/vue/24/outline'
import JsBarcode from 'jsbarcode'

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

const barcodeFormat = ref(props.field.options?.barcodeFormat || 'CODE128')
const barcodeCanvas = ref<HTMLCanvasElement>()
const previewCanvas = ref<HTMLCanvasElement>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
}

const generateBarcode = async () => {
  if (!props.value) return
  
  await nextTick()
  const canvas = props.readonly ? barcodeCanvas.value : previewCanvas.value
  
  if (canvas) {
    try {
      JsBarcode(canvas, props.value, {
        format: barcodeFormat.value,
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        margin: 10
      })
    } catch (error) {
      console.error('Failed to generate barcode:', error)
    }
  }
}

const scanBarcode = () => {
  // In a real implementation, this would open camera for barcode scanning
  // For now, we'll simulate with a prompt
  const scannedValue = prompt('Simulated barcode scan - enter value:')
  if (scannedValue) {
    emit('update:value', scannedValue)
  }
}

const copyBarcode = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(props.value)
    } catch (error) {
      console.error('Failed to copy barcode:', error)
    }
  }
}

watch(() => props.value, () => {
  if (props.value) {
    generateBarcode()
  }
}, { immediate: true })

onMounted(() => {
  if (props.value) {
    generateBarcode()
  }
})
</script>