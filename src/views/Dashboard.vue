<template>
  <div>
    <MobileHeader title="Dashboard" icon="📊" :show-search="true" :show-menu="true" @search="handleSearch"
      @menu="handleMenu" />

    <div class="p-4 space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 gap-4">
        <StatCard
          :icon="ServerStackIcon"
          :value="databaseStore.stats.totalDatabases"
          label="Databases"
          color="blue"
        />

        <StatCard
          :icon="TableCellsIcon"
          :value="databaseStore.stats.totalTables"
          label="Tables"
          color="green"
        />

        <StatCard
          :icon="DocumentTextIcon"
          :value="databaseStore.stats.totalRecords"
          label="Records"
          color="purple"
        />

        <StatCard
          :icon="CloudIcon"
          :value="formatBytes(databaseStore.stats.storageUsed)"
          label="Storage"
          color="orange"
        />
      </div>

      <!-- Quick Actions -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </template>
        
        <div class="grid grid-cols-2 gap-3">
          <QuickActionButton
            :icon="PlusIcon"
            text="New Database"
            color="primary"
            @click="$router.push('/databases')"
          />

          <QuickActionButton
            :icon="ArrowUpTrayIcon"
            text="Import Data"
            color="green"
            @click="showImportModal = true"
          />

          <QuickActionButton
            :icon="StarIcon"
            text="Upgrade"
            color="yellow"
            @click="showPurchaseModal = true"
          />

          <QuickActionButton
            :icon="ArrowDownTrayIcon"
            text="Export All"
            color="blue"
            @click="exportAllData"
          />
        </div>
      </Card>

      <!-- Recent Databases -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Databases
          </h2>
        </template>

        <div v-if="recentDatabases.length === 0" class="text-center py-8">
          <ServerStackIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 mb-4">No databases yet</p>
          <BaseButton
            variant="primary"
            @click="$router.push('/databases')"
          >
            Create Your First Database
          </BaseButton>
        </div>

        <div v-else class="space-y-3">
          <DatabaseCard
            v-for="database in recentDatabases"
            :key="database.id"
            :database="database"
            @click="$router.push(`/database/${database.id}`)"
          />
        </div>
      </Card>
    </div>

    <!-- Modals -->
    <PurchaseModal v-if="showPurchaseModal" @close="showPurchaseModal = false" @success="handlePurchaseSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import {
  ServerStackIcon,
  TableCellsIcon,
  DocumentTextIcon,
  CloudIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  StarIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import StatCard from '@/components/UI/StatCard.vue'
import QuickActionButton from '@/components/UI/QuickActionButton.vue'
import DatabaseCard from '@/components/Database/DatabaseCard.vue'
import PurchaseModal from '@/components/Purchase/PurchaseModal.vue'
import Card from '@/components/UI/Card.vue'
import BaseButton from '@/components/UI/BaseButton.vue'

const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const showPurchaseModal = ref(false)

const recentDatabases = computed(() =>
  databaseStore.databases.slice(0, 5)
)

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const handleSearch = () => {
  toastStore.info('Search functionality coming soon')
}

const handleMenu = () => {
  toastStore.info('Menu functionality coming soon')
}

const exportAllData = async () => {
  try {
    const blob = await databaseStore.exportData({
      format: 'sql',
      includeMetadata: true,
      includeRelationships: true
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `database_export_${new Date().toISOString().split('T')[0]}.sql`
    a.click()
    URL.revokeObjectURL(url)

    toastStore.success('Data exported successfully')
  } catch (error) {
    toastStore.error('Failed to export data')
  }
}

const handlePurchaseSuccess = (productId: string) => {
  toastStore.success('Purchase successful!')
  showPurchaseModal.value = false
}
</script>