<template>
  <div class="rich-text-renderer">
    <div v-if="readonly" class="rich-text-renderer-display">
      <div v-if="value" class="prose prose-sm dark:prose-invert max-w-none" v-html="value"></div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="rich-text-renderer-input">
      <div class="space-y-3">
        <!-- Toolbar -->
        <div class="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border">
          <button
            type="button"
            @click="execCommand('bold')"
            :class="['p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600', { 'bg-gray-200 dark:bg-gray-600': isActive('bold') }]"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            @click="execCommand('italic')"
            :class="['p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600', { 'bg-gray-200 dark:bg-gray-600': isActive('italic') }]"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            @click="execCommand('underline')"
            :class="['p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600', { 'bg-gray-200 dark:bg-gray-600': isActive('underline') }]"
          >
            <u>U</u>
          </button>
          <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <button
            type="button"
            @click="execCommand('insertUnorderedList')"
            class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <BarsArrowDownIcon class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="execCommand('insertOrderedList')"
            class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <ListBulletIcon class="w-4 h-4" />
          </button>
          <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <button
            type="button"
            @click="insertLink"
            class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <LinkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Editor -->
        <div
          ref="editor"
          contenteditable="true"
          @input="updateValue"
          @keydown="handleKeydown"
          :placeholder="field.name || 'Enter rich text...'"
          class="min-h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white prose prose-sm dark:prose-invert max-w-none"
          style="outline: none;"
        ></div>

        <div class="text-xs text-gray-500 dark:text-gray-400">
          Use the toolbar to format your text. HTML tags are supported.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { Field } from '@/types/database'
import {
  BarsArrowDownIcon,
  ListBulletIcon,
  LinkIcon
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

const editor = ref<HTMLElement>()

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  updateValue()
}

const isActive = (command: string) => {
  return document.queryCommandState(command)
}

const insertLink = () => {
  const url = prompt('Enter URL:')
  if (url) {
    execCommand('createLink', url)
  }
}

const updateValue = () => {
  if (editor.value) {
    emit('update:value', editor.value.innerHTML)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle common keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        execCommand('bold')
        break
      case 'i':
        event.preventDefault()
        execCommand('italic')
        break
      case 'u':
        event.preventDefault()
        execCommand('underline')
        break
    }
  }
}

onMounted(async () => {
  if (editor.value && props.value) {
    await nextTick()
    editor.value.innerHTML = props.value
  }
})
</script>

<style scoped>
.prose {
  color: inherit;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: inherit;
}

.prose strong {
  color: inherit;
}

.prose a {
  color: rgb(37 99 235);
}

.dark .prose a {
  color: rgb(96 165 250);
}
</style>