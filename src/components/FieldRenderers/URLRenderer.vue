<template>
  <div class="url-renderer">
    <div v-if="readonly" class="url-renderer-display">
      <div v-if="value" class="space-y-2">
        <a
          :href="value"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600 dark:text-primary-400 hover:underline text-sm flex items-center space-x-1"
        >
          <LinkIcon class="w-4 h-4 shrink-0" />
          <span :class="{ 'truncate': compact }">
            {{ compact ? getDomain(value) : value }}
          </span>
          <ArrowTopRightOnSquareIcon class="w-3 h-3 shrink-0" />
        </a>
        <div v-if="!compact && preview" class="mt-2">
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
            <div class="flex items-start space-x-3">
              <img
                v-if="preview.image"
                :src="preview.image"
                :alt="preview.title"
                class="w-16 h-16 rounded object-cover shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ preview.title }}
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {{ preview.description }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {{ getDomain(value) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="url-renderer-input">
      <div class="space-y-3">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon class="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="url"
            :value="value"
            @input="updateValue"
            @blur="validateUrl"
            :placeholder="field.name || 'https://example.com'"
            :required="field.isRequired"
            class="form-input pl-10"
          />
        </div>
        
        <div v-if="value && isValidUrl(value)" class="flex items-center space-x-2">
          <button
            @click="testUrl"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Test URL
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="loadPreview"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Load Preview
          </button>
        </div>
        
        <div v-if="urlError" class="text-xs text-red-600 dark:text-red-400">
          {{ urlError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  LinkIcon,
  ArrowTopRightOnSquareIcon
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

const urlError = ref('')
const preview = ref<{
  title: string
  description: string
  image?: string
} | null>(null)

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
  urlError.value = ''
}

const validateUrl = () => {
  if (props.value && !isValidUrl(props.value)) {
    urlError.value = 'Please enter a valid URL'
  } else {
    urlError.value = ''
  }
}

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

const testUrl = () => {
  if (props.value) {
    window.open(props.value, '_blank', 'noopener,noreferrer')
  }
}

const loadPreview = async () => {
  if (!props.value || !isValidUrl(props.value)) return
  
  try {
    // In a real implementation, this would call a backend service
    // to fetch URL metadata to avoid CORS issues
    preview.value = {
      title: getDomain(props.value),
      description: 'URL preview would be loaded here',
      image: undefined
    }
  } catch (error) {
    console.error('Failed to load preview:', error)
  }
}
</script>