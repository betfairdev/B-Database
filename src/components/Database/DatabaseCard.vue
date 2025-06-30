<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-start space-x-3 mb-3">
      <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
        <img 
          v-if="database.thumbnail" 
          :src="database.thumbnail" 
          :alt="database.name"
          class="w-full h-full object-cover" 
        />
        <div v-else class="w-full h-full flex items-center justify-center text-xl">
          📊
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">
          {{ database.name }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
          {{ database.description || 'No description' }}
        </p>
      </div>
      <button 
        v-if="showMenu"
        @click.stop="$emit('menu')"
        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
      >
        <EllipsisVerticalIcon class="w-5 h-5" />
      </button>
      <ChevronRightIcon v-else class="w-5 h-5 text-gray-400" />
    </div>

    <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
      <span>{{ database.tables?.length || 0 }} tables</span>
      <span>{{ getTotalRecords() }} records</span>
    </div>

    <div v-if="showDate" class="mt-2 text-xs text-gray-400 dark:text-gray-500">
      Updated {{ formatDate(database.updatedAt) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '@/database/entities/Database'
import { EllipsisVerticalIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  database: Database
  showMenu?: boolean
  showDate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMenu: false,
  showDate: false
})

defineEmits<{
  click: []
  menu: []
}>()

const getTotalRecords = () => {
  return props.database.tables?.reduce((total, table) => total + (table.records?.length || 0), 0) || 0
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>