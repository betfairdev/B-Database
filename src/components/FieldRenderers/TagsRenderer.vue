<template>
  <div class="tags-renderer">
    <div v-if="readonly" class="tags-renderer-display">
      <div v-if="tags.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="tag in displayTags"
          :key="tag"
          class="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md text-xs font-medium"
        >
          {{ tag }}
        </span>
        <span
          v-if="compact && tags.length > 3"
          class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs"
        >
          +{{ tags.length - 3 }} more
        </span>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="tags-renderer-input">
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2 min-h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <span
            v-for="(tag, index) in tags"
            :key="index"
            class="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md text-sm"
          >
            {{ tag }}
            <button
              @click="removeTag(index)"
              class="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
            >
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
          
          <input
            v-model="newTag"
            @keydown="handleKeydown"
            @blur="addTag"
            type="text"
            placeholder="Add tag..."
            class="flex-1 min-w-20 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div v-if="suggestedTags.length > 0" class="space-y-2">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
            Suggested tags:
          </div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="tag in suggestedTags"
              :key="tag"
              @click="addSuggestedTag(tag)"
              class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ tag }}
              <PlusIcon class="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400">
          Type and press Enter or comma to add tags. Click × to remove.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  XMarkIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: string[]
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string[]]
}>()

const newTag = ref('')

const tags = computed(() => props.value || [])

const displayTags = computed(() => {
  if (props.compact && tags.value.length > 3) {
    return tags.value.slice(0, 3)
  }
  return tags.value
})

const suggestedTags = computed(() => {
  const suggestions = props.field.options?.suggestedTags || []
  return suggestions.filter(tag => !tags.value.includes(tag))
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
  } else if (event.key === 'Backspace' && newTag.value === '' && tags.value.length > 0) {
    removeTag(tags.value.length - 1)
  }
}

const addTag = () => {
  const tag = newTag.value.trim().replace(',', '')
  if (tag && !tags.value.includes(tag)) {
    const newTags = [...tags.value, tag]
    emit('update:value', newTags)
    newTag.value = ''
  }
}

const addSuggestedTag = (tag: string) => {
  if (!tags.value.includes(tag)) {
    const newTags = [...tags.value, tag]
    emit('update:value', newTags)
  }
}

const removeTag = (index: number) => {
  const newTags = tags.value.filter((_, i) => i !== index)
  emit('update:value', newTags)
}
</script>