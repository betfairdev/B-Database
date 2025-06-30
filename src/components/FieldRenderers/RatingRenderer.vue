<template>
  <div class="rating-renderer">
    <div v-if="readonly" class="rating-renderer-display">
      <div v-if="value !== null && value !== undefined" class="flex items-center space-x-1">
        <StarIcon
          v-for="i in maxRating"
          :key="i"
          :class="[
            'w-5 h-5',
            i <= value ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
          ]"
        />
        <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {{ value }}/{{ maxRating }}
        </span>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="rating-renderer-input">
      <div class="space-y-3">
        <div class="flex items-center space-x-1">
          <button
            v-for="i in maxRating"
            :key="i"
            type="button"
            @click="setRating(i)"
            @mouseover="hoverRating = i"
            @mouseleave="hoverRating = 0"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <StarIcon
              :class="[
                'w-6 h-6 transition-colors',
                (hoverRating > 0 ? i <= hoverRating : i <= (value || 0))
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              ]"
            />
          </button>
          <button
            v-if="!field.isRequired"
            type="button"
            @click="clearRating"
            class="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ value || 0 }}/{{ maxRating }}
          </span>
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2">
              <span class="text-gray-600 dark:text-gray-400">Max:</span>
              <select
                v-model="maxRating"
                @change="updateMaxRating"
                class="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </label>
          </div>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400">
          Click on a star to set the rating. Hover to preview.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  StarIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: number | null
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: number | null]
}>()

const hoverRating = ref(0)
const maxRating = ref(props.field.options?.maxRating || 5)

const setRating = (rating: number) => {
  emit('update:value', rating)
}

const clearRating = () => {
  emit('update:value', null)
}

const updateMaxRating = () => {
  // If current value exceeds new max, adjust it
  if (props.value && props.value > maxRating.value) {
    emit('update:value', maxRating.value)
  }
}
</script>