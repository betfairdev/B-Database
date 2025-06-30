<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-center space-x-3">
      <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        <img 
          v-if="table.thumbnail" 
          :src="table.thumbnail" 
          :alt="table.name"
          class="w-full h-full object-cover" 
        />
        <div v-else class="w-full h-full flex items-center justify-center text-lg">
          📋
        </div>
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          {{ table.name }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ table.fields?.length || 0 }} fields • {{ table.records?.length || 0 }} records
        </p>
      </div>
      <ChevronRightIcon class="w-5 h-5 text-gray-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Table } from '@/types/database'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  table: Table
}

defineProps<Props>()

defineEmits<{
  click: []
}>()
</script>