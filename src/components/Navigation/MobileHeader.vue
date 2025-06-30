<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-14">
        <!-- Left Section -->
        <div class="flex items-center space-x-3">
          <button
            v-if="showBackButton"
            @click="handleBack"
            class="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          
          <div class="flex items-center space-x-2">
            <div v-if="icon" class="text-2xl">{{ icon }}</div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {{ title }}
              </h1>
              <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ subtitle }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center space-x-2">
          <slot name="actions">
            <!-- Default actions -->
            <button
              v-if="showSearch"
              @click="$emit('search')"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MagnifyingGlassIcon class="w-5 h-5" />
            </button>
            
            <button
              v-if="showMenu"
              @click="$emit('menu')"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <EllipsisVerticalIcon class="w-5 h-5" />
            </button>
          </slot>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  subtitle?: string
  icon?: string
  showBackButton?: boolean
  showSearch?: boolean
  showMenu?: boolean
}

defineProps<Props>()

defineEmits<{
  search: []
  menu: []
}>()

const router = useRouter()

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>