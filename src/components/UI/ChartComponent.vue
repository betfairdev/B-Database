<template>
  <div class="chart-component">
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div v-if="title" class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>
      
      <div class="relative" :style="{ height: height + 'px' }">
        <!-- Placeholder for chart implementation -->
        <div class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-center">
            <ChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-500 dark:text-gray-400">Chart will be rendered here</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Type: {{ type }} | Data points: {{ data.length }}
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="showLegend && legend.length > 0" class="mt-4 flex flex-wrap gap-4">
        <div
          v-for="item in legend"
          :key="item.label"
          class="flex items-center space-x-2"
        >
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: item.color }"
          ></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartBarIcon } from '@heroicons/vue/24/outline'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface LegendItem {
  label: string
  color: string
}

interface Props {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area'
  data: ChartData[]
  title?: string
  subtitle?: string
  height?: number
  showLegend?: boolean
  legend?: LegendItem[]
}

withDefaults(defineProps<Props>(), {
  height: 300,
  showLegend: true,
  legend: () => []
})

// Note: This is a placeholder component for future chart implementation
// In a real application, you would integrate with a charting library like Chart.js, ApexCharts, or D3.js
</script>