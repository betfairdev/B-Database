<template>
  <div class="image-renderer">
    <div v-if="readonly" class="image-renderer-display">
      <div v-if="value" class="space-y-2">
        <img
          :src="value"
          :alt="field.name"
          :class="[
            'rounded-lg object-cover',
            compact ? 'w-16 h-16' : 'w-32 h-32'
          ]"
          @error="handleImageError"
        />
        <div v-if="!compact" class="text-xs text-gray-500 dark:text-gray-400">
          <a :href="value" target="_blank" class="hover:underline">
            View full size
          </a>
        </div>
      </div>
      <div v-else class="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <PhotoIcon class="w-6 h-6 text-gray-400" />
      </div>
    </div>
    <div v-else class="image-renderer-input">
      <div class="space-y-3">
        <div v-if="value" class="relative">
          <img
            :src="value"
            :alt="field.name"
            class="w-32 h-32 rounded-lg object-cover"
            @error="handleImageError"
          />
          <button
            @click="removeImage"
            class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        
        <div class="flex items-center space-x-3">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="hidden"
          />
          <button
            @click="$refs.fileInput?.click()"
            class="btn-secondary flex items-center"
          >
            <PhotoIcon class="w-4 h-4 mr-2" />
            {{ value ? 'Change Image' : 'Upload Image' }}
          </button>
          
          <div class="text-sm text-gray-500 dark:text-gray-400">
            or
          </div>
          
          <input
            type="url"
            :value="urlInput"
            @input="updateUrlInput"
            @blur="handleUrlInput"
            placeholder="Paste image URL"
            class="form-input flex-1"
          />
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Supported formats: JPG, PNG, GIF, WebP (max {{ formatFileSize(maxFileSize) }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from '@/types/database'
import {
  PhotoIcon,
  XMarkIcon
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

const urlInput = ref('')
const maxFileSize = props.field.options?.maxFileSize || 5 * 1024 * 1024 // 5MB

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > maxFileSize) {
      alert(`File size must be less than ${formatFileSize(maxFileSize)}`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      emit('update:value', result)
    }
    reader.readAsDataURL(file)
  }
}

const updateUrlInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  urlInput.value = target.value
}

const handleUrlInput = () => {
  if (urlInput.value && isValidImageUrl(urlInput.value)) {
    emit('update:value', urlInput.value)
    urlInput.value = ''
  }
}

const removeImage = () => {
  emit('update:value', '')
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiM5Q0E3QjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='
}

const isValidImageUrl = (url: string) => {
  try {
    new URL(url)
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  } catch {
    return false
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>