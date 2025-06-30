<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Thumbnail
      </label>
      <button
        @click="showPicker = !showPicker"
        class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
      >
        {{ showPicker ? 'Hide' : 'Choose' }}
      </button>
    </div>

    <!-- Current Thumbnail -->
    <div class="flex items-center space-x-3">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
        <img
          v-if="modelValue && modelValue.startsWith('data:image')"
          :src="modelValue"
          alt="Thumbnail"
          class="w-full h-full object-cover"
        />
        <div
          v-else-if="modelValue && modelValue.startsWith('http')"
          class="w-full h-full bg-cover bg-center"
          :style="{ backgroundImage: `url(${modelValue})` }"
        ></div>
        <PhotoIcon
          v-else
          class="w-8 h-8 text-gray-400"
        />
      </div>
      <div class="flex-1">
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="url"
          placeholder="Enter image URL or upload file"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
        />
      </div>
    </div>

    <!-- Thumbnail Picker -->
    <div v-if="showPicker" class="space-y-4">
      <!-- Upload Section -->
      <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
        <div class="text-center">
          <PhotoIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div class="space-y-2">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="hidden"
            />
            <button
              @click="$refs.fileInput?.click()"
              class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Upload Image
            </button>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 2MB
            </p>
          </div>
        </div>
      </div>

      <!-- Preset Thumbnails -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Preset Images
        </h4>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="preset in presetThumbnails"
            :key="preset.url"
            @click="$emit('update:modelValue', preset.url)"
            class="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-colors"
            :class="{ 'border-primary-500': modelValue === preset.url }"
          >
            <img
              :src="preset.url"
              :alt="preset.name"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      <!-- Color Backgrounds -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Color Backgrounds
        </h4>
        <div class="grid grid-cols-8 gap-2">
          <button
            v-for="color in colorBackgrounds"
            :key="color"
            @click="generateColorThumbnail(color)"
            class="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
            :style="{ backgroundColor: color }"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PhotoIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue?: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)

const presetThumbnails = [
  { name: 'Database', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center' },
  { name: 'Analytics', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center' },
  { name: 'Files', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=100&fit=crop&crop=center' },
  { name: 'Network', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop&crop=center' },
  { name: 'Security', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center' },
  { name: 'Cloud', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=100&h=100&fit=crop&crop=center' },
  { name: 'Code', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop&crop=center' },
  { name: 'Business', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center' }
]

const colorBackgrounds = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#6366F1', '#F97316', '#14B8A6', '#A855F7',
  '#64748B', '#374151', '#1F2937', '#111827'
]

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      emit('update:modelValue', result)
    }
    reader.readAsDataURL(file)
  }
}

const generateColorThumbnail = (color: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 100
  canvas.height = 100
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 100, 100)
    
    const dataUrl = canvas.toDataURL('image/png')
    emit('update:modelValue', dataUrl)
  }
}
</script>