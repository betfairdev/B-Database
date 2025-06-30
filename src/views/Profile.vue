<template>
  <div>
    <MobileHeader title="Profile" icon="👤" />

    <div class="p-4 space-y-6">
      <!-- Profile Header -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
        <div
          class="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon class="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Database User
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Device ID: {{ authStore.deviceId.slice(0, 8) }}...
        </p>
        <div class="mt-4">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 capitalize">
            {{ authStore.subscriptionPlan }} Plan
          </span>
        </div>
      </div>

      <!-- Usage Statistics -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage Statistics
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <StatCard
            :icon="ServerStackIcon"
            :value="databaseStore.stats.totalDatabases"
            label="Databases Created"
            color="primary"
          />
          
          <StatCard
            :icon="DocumentTextIcon"
            :value="databaseStore.stats.totalRecords"
            label="Records Added"
            color="green"
          />
          
          <StatCard
            :icon="TableCellsIcon"
            :value="databaseStore.stats.totalTables"
            label="Tables Created"
            color="blue"
          />
          
          <StatCard
            :icon="CloudIcon"
            :value="formatBytes(databaseStore.stats.storageUsed)"
            label="Storage Used"
            color="purple"
          />
        </div>
      </div>

      <!-- Account Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div class="space-y-3">
          <QuickActionButton
            :icon="StarIcon"
            text="Upgrade Plan"
            color="primary"
            @click="showPurchaseModal = true"
          />

          <QuickActionButton
            :icon="ArrowDownTrayIcon"
            text="Export Profile Data"
            color="gray"
            @click="exportProfile"
          />

          <QuickActionButton
            :icon="ShareIcon"
            text="Share App"
            color="gray"
            @click="shareApp"
          />
        </div>
      </div>

      <!-- Achievements -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Achievements
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="achievement in achievements" :key="achievement.id"
            class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            :class="{ 'opacity-50': !achievement.unlocked }">
            <div class="text-2xl mb-2">{{ achievement.icon }}</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white text-center">
              {{ achievement.name }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
              {{ achievement.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <div class="space-y-3">
          <QuickActionButton
            :icon="TrashIcon"
            text="Reset All Data"
            color="red"
            @click="resetAllData"
          />
        </div>
      </div>
    </div>

    <!-- Purchase Modal -->
    <PurchaseModal v-if="showPurchaseModal" @close="showPurchaseModal = false" @success="handlePurchaseSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import {
  UserIcon,
  StarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  ServerStackIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CloudIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import StatCard from '@/components/UI/StatCard.vue'
import QuickActionButton from '@/components/UI/QuickActionButton.vue'
import PurchaseModal from '@/components/Purchase/PurchaseModal.vue'

const authStore = useAuthStore()
const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const showPurchaseModal = ref(false)

const achievements = computed(() => [
  {
    id: 'first_database',
    name: 'First Steps',
    description: 'Created your first database',
    icon: '🎯',
    unlocked: databaseStore.stats.totalDatabases > 0
  },
  {
    id: 'data_collector',
    name: 'Data Collector',
    description: 'Added 100 records',
    icon: '📊',
    unlocked: databaseStore.stats.totalRecords >= 100
  },
  {
    id: 'organizer',
    name: 'Organizer',
    description: 'Created 10 tables',
    icon: '🗂️',
    unlocked: databaseStore.stats.totalTables >= 10
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Created 5 databases',
    icon: '⚡',
    unlocked: databaseStore.stats.totalDatabases >= 5
  }
])

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const exportProfile = async () => {
  try {
    const profileData = {
      deviceId: authStore.deviceId,
      subscriptionPlan: authStore.subscriptionPlan,
      stats: databaseStore.stats,
      achievements: achievements.value.filter(a => a.unlocked),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profile_data_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toastStore.success('Profile data exported')
  } catch (error) {
    toastStore.error('Failed to export profile data')
  }
}

const shareApp = async () => {
  const shareData = {
    title: 'Database Manager',
    text: 'Check out this amazing database management app!',
    url: window.location.origin
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      // User cancelled sharing
    }
  } else {
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      toastStore.success('Share link copied to clipboard')
    } catch (error) {
      toastStore.error('Failed to share')
    }
  }
}

const resetAllData = () => {
  if (confirm('Are you sure you want to reset all data? This will delete everything and cannot be undone.')) {
    if (confirm('This is your final warning. All databases, tables, and records will be permanently deleted. Continue?')) {
      localStorage.clear()
      window.location.reload()
    }
  }
}

const handlePurchaseSuccess = (productId: string) => {
  toastStore.success('Purchase successful!')
  showPurchaseModal.value = false
  authStore.updateSubscription('premium')
}
</script>