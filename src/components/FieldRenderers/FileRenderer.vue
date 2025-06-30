<template>
  <div class="file-renderer">
    <div v-if="readonly" class="file-renderer-display">
      <div v-if="value" class="space-y-2">
        <div class="flex items-center space-x-2">
          <component
            :is="getFileIcon(value)"
            class="w-5 h-5 text-gray-400 shrink-0"
          />
          <div class="flex-1 min-w-0">
            <a
              :href="value.url"
              :download="value.name"
              class="text-primary-600 dark:text-primary-400 hover:underline text-sm truncate block"
            >
              {{ value.name }}
            </a>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatFileSize(value.size) }} • {{ getFileType(value.name) }}
            </div>
          </div>
        </div>
        <div v-if="!compact && isImage(value.name)" class="mt-2">
          <img
            :src="value.url"
            :alt="value.name"
            class="w-32 h-32 rounded-lg object-cover"
            @error="handleImageError"
          />
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="file-renderer-input">
      <div class="space-y-3">
        <div v-if="value" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <component
                :is="getFileIcon(value)"
                class="w-5 h-5 text-gray-400"
              />
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ value.name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(value.size) }} • {{ getFileType(value.name) }}
                </div>
              </div>
            </div>
            <button
              @click="removeFile"
              class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <input
            ref="fileInput"
            type="file"
            :accept="acceptedTypes"
            @change="handleFileUpload"
            class="hidden"
          />
          <button
            @click="$refs.fileInput?.click()"
            class="btn-secondary flex items-center"
          >
            <DocumentIcon class="w-4 h-4 mr-2" />
            {{ value ? 'Change File' : 'Upload File' }}
          </button>
          
          <div class="text-sm text-gray-500 dark:text-gray-400">
            or
          </div>
          
          <input
            type="url"
            :value="urlInput"
            @input="updateUrlInput"
            @blur="handleUrlInput"
            placeholder="Paste file URL"
            class="form-input flex-1"
          />
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          <div>Supported types: {{ getSupportedTypes() }}</div>
          <div>Maximum size: {{ formatFileSize(maxFileSize) }}</div>
        </div>
        
        <div v-if="fileError" class="text-xs text-red-600 dark:text-red-400">
          {{ fileError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: {
    name: string
    url: string
    size: number
    type: string
  } | null
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: any]
}>()

const urlInput = ref('')
const fileError = ref('')
const maxFileSize = props.field.options?.maxFileSize || 10 * 1024 * 1024 // 10MB

const acceptedTypes = computed(() => {
  const types = props.field.options?.fileTypes || []
  return types.length > 0 ? types.join(',') : '*/*'
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > maxFileSize) {
      fileError.value = `File size must be less than ${formatFileSize(maxFileSize)}`
      return
    }
    
    const allowedTypes = props.field.options?.fileTypes || []
    if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.includes(type))) {
      fileError.value = `File type not allowed. Supported types: ${allowedTypes.join(', ')}`
      return
    }
    
    // In a real implementation, this would upload the file to a server
    const fileData = {
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type
    }
    
    emit('update:value', fileData)
    fileError.value = ''
  }
}

const updateUrlInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  urlInput.value = target.value
}

const handleUrlInput = () => {
  if (urlInput.value && isValidUrl(urlInput.value)) {
    // Extract filename from URL
    const filename = urlInput.value.split('/').pop() || 'file'
    const fileData = {
      name: filename,
      url: urlInput.value,
      size: 0, // Unknown size for URLs
      type: getFileType(filename)
    }
    
    emit('update:value', fileData)
    urlInput.value = ''
    fileError.value = ''
  }
}

const removeFile = () => {
  emit('update:value', null)
  fileError.value = ''
}

const getFileIcon = (file: any) => {
  if (!file) return DocumentIcon
  
  const type = file.type || file.name
  if (type.includes('image')) return PhotoIcon
  if (type.includes('video')) return VideoCameraIcon
  if (type.includes('audio')) return MusicalNoteIcon
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return ArchiveBoxIcon
  return DocumentIcon
}

const getFileType = (filename: string) => {
  const extension = filename.split('.').pop()?.toUpperCase()
  return extension || 'FILE'
}

const isImage = (filename: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension ? imageExtensions.includes(extension) : false
}

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
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

const getSupportedTypes = () => {
  const types = props.field.options?.fileTypes || []
  return types.length > 0 ? types.join(', ') : 'All file types'
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
</script>