<template>
  <div class="gallery-view">
    <div v-if="records.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="record in records"
        :key="record.id"
        class="gallery-item group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
        @click="$emit('edit-record', record)"
      >
        <!-- Image Container -->
        <div class="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
          <img
            v-if="getImageUrl(record)"
            :src="getImageUrl(record)"
            :alt="getPrimaryFieldValue(record)"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <PhotoIcon class="w-12 h-12 text-gray-400" />
          </div>
          
          <!-- Overlay Actions -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex space-x-2">
              <button
                @click.stop="$emit('edit-record', record)"
                class="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
              >
                <PencilIcon class="w-4 h-4 text-gray-700" />
              </button>
              <button
                @click.stop="$emit('delete-record', record)"
                class="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
              >
                <TrashIcon class="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-3">
          <h3 class="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
            {{ getPrimaryFieldValue(record) }}
          </h3>
          
          <!-- Additional Fields -->
          <div v-if="displayFields.length > 0" class="space-y-1">
            <div
              v-for="field in displayFields.slice(0, 2)"
              :key="field.id"
              class="text-xs text-gray-500 dark:text-gray-400 truncate"
            >
              <span class="font-medium">{{ field.name }}:</span>
              <FieldRenderer
                :field="field"
                :value="record.data[field.id]"
                :readonly="true"
                :compact="true"
                class="inline ml-1"
              />
            </div>
          </div>
          
          <!-- Metadata -->
          <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>{{ formatDate(record.updatedAt) }}</span>
              <span>v{{ record.version }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <PhotoIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No records found
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Add some records with images to see them in gallery view
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Table, Record } from '@/types/database'
import { FieldType } from '@/types/database'
import {
  PhotoIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import FieldRenderer from '@/components/FieldRenderers/FieldRenderer.vue'

interface Props {
  table: Table
  records: Record[]
}

const props = defineProps<Props>()

defineEmits<{
  'edit-record': [record: Record]
  'delete-record': [record: Record]
}>()

const imageFields = computed(() => 
  props.table.fields.filter(field => field.type === FieldType.IMAGE)
)

const displayFields = computed(() => 
  props.table.fields.filter(field => 
    !field.isPrimary && 
    field.type !== FieldType.IMAGE &&
    field.type !== FieldType.FILE
  ).slice(0, 3)
)

const getPrimaryFieldValue = (record: Record) => {
  const primaryField = props.table.fields.find(field => field.isPrimary)
  if (primaryField) {
    return record.data[primaryField.id] || 'Untitled'
  }
  return 'Untitled'
}

const getImageUrl = (record: Record) => {
  // Find the first image field with a value
  for (const field of imageFields.value) {
    const imageUrl = record.data[field.id]
    if (imageUrl && typeof imageUrl === 'string') {
      return imageUrl
    }
  }
  return null
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>