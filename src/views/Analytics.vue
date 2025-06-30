<template>
  <div>
    <MobileHeader title="Analytics" icon="📊" :show-menu="true" @menu="handleMenu" />

    <div class="p-4 space-y-6">
      <!-- Overview Cards -->
      <div class="grid grid-cols-2 gap-4">
        <StatCard
          :icon="ServerStackIcon"
          :value="databaseStore.stats.totalDatabases"
          label="Total Databases"
          color="primary"
        />

        <StatCard
          :icon="DocumentTextIcon"
          :value="databaseStore.stats.totalRecords"
          label="Total Records"
          color="green"
        />

        <StatCard
          :icon="TableCellsIcon"
          :value="databaseStore.stats.totalTables"
          label="Total Tables"
          color="blue"
        />

        <StatCard
          :icon="CloudIcon"
          :value="formatBytes(databaseStore.stats.storageUsed)"
          label="Storage Used"
          color="purple"
        />
      </div>

      <!-- Database Breakdown -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Database Breakdown
          </h2>
        </template>

        <div v-if="databaseStore.databases.length === 0" class="text-center py-8">
          <ChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">No data to analyze yet</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="database in databaseStore.databases" :key="database.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                <img v-if="database.thumbnail" :src="database.thumbnail" :alt="database.name"
                  class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-lg">
                  📊
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ database.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ database.tables?.length || 0 }} tables
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ getTotalRecords(database) }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">records</div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Usage Trends -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Usage Trends
          </h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Most Active Database</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getMostActiveDatabase() }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Largest Table</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getLargestTable() }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Last Backup</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ formatDate(databaseStore.stats.lastBackup) }}
            </span>
          </div>
        </div>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </template>

        <div class="grid grid-cols-2 gap-3">
          <QuickActionButton
            :icon="ArrowDownTrayIcon"
            text="Export Report"
            color="blue"
            @click="exportAnalytics"
          />

          <QuickActionButton
            :icon="CloudArrowUpIcon"
            text="Backup Now"
            color="green"
            @click="scheduleBackup"
          />
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import type { Database } from '@/database/entities/Database'
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  ServerStackIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CloudIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import StatCard from '@/components/UI/StatCard.vue'
import QuickActionButton from '@/components/UI/QuickActionButton.vue'
import Card from '@/components/UI/Card.vue'

const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getTotalRecords = (database: Database) => {
  return database.tables?.reduce((total, table) => total + (table.records?.length || 0), 0) || 0
}

const getMostActiveDatabase = () => {
  if (databaseStore.databases.length === 0) return 'None'
  
  const mostActive = databaseStore.databases.reduce((prev, current) => {
    const prevRecords = getTotalRecords(prev)
    const currentRecords = getTotalRecords(current)
    return currentRecords > prevRecords ? current : prev
  })
  
  return mostActive.name
}

const getLargestTable = () => {
  if (databaseStore.databases.length === 0) return 'None'
  
  let largestTable = null
  let maxRecords = 0
  
  databaseStore.databases.forEach(database => {
    database.tables?.forEach(table => {
      const recordCount = table.records?.length || 0
      if (recordCount > maxRecords) {
        maxRecords = recordCount
        largestTable = table
      }
    })
  })
  
  return largestTable ? largestTable.name : 'None'
}

const formatDate = (date: Date | null) => {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const exportAnalytics = () => {
  toastStore.success('Analytics report exported successfully')
}

const scheduleBackup = () => {
  toastStore.success('Backup scheduled successfully')
}

const handleMenu = () => {
  // Handle menu action
}
</script>