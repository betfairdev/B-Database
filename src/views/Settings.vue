<template>
  <div>
    <MobileHeader title="Settings" icon="⚙️" />

    <div class="p-4 space-y-6">
      <!-- Appearance -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Appearance
          </h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Dark Mode</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</div>
            </div>
            <button @click="settingsStore.toggleDarkMode" :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              settingsStore.isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
            ]">
              <span :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settingsStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'
              ]" />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Compact Mode</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Use more compact layouts</div>
            </div>
            <button @click="toggleCompactMode" :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              settingsStore.compactMode ? 'bg-primary-600' : 'bg-gray-200'
            ]">
              <span :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settingsStore.compactMode ? 'translate-x-6' : 'translate-x-1'
              ]" />
            </button>
          </div>
        </div>
      </Card>

      <!-- Security -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Security
          </h2>
        </template>

        <div class="space-y-4">
          <button @click="showAuthMethodModal = true"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div class="flex items-center space-x-3">
              <FingerPrintIcon class="w-5 h-5 text-gray-400" />
              <div class="text-left">
                <div class="font-medium text-gray-900 dark:text-white">Authentication Method</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {{ authStore.authMethod || 'Not set' }}
                </div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>

          <button @click="showAuthenticatorSetup = true"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div class="flex items-center space-x-3">
              <DevicePhoneMobileIcon class="w-5 h-5 text-gray-400" />
              <div class="text-left">
                <div class="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ authStore.hasAuthenticatorSetup ? 'Enabled' : 'Not set up' }}
                </div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>

          <button @click="resetAuth"
            class="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <div class="flex items-center space-x-3">
              <TrashIcon class="w-5 h-5 text-red-500" />
              <div class="text-left">
                <div class="font-medium text-red-600 dark:text-red-400">Reset Authentication</div>
                <div class="text-sm text-red-500 dark:text-red-400">Clear all authentication data</div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-red-400" />
          </button>
        </div>
      </Card>

      <!-- Notifications -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Push Notifications</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Receive notifications for important events</div>
            </div>
            <button @click="toggleNotifications" :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              settingsStore.notifications ? 'bg-primary-600' : 'bg-gray-200'
            ]">
              <span :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settingsStore.notifications ? 'translate-x-6' : 'translate-x-1'
              ]" />
            </button>
          </div>

          <BaseButton
            variant="outline"
            :icon-left="BellIcon"
            full-width
            @click="testNotification"
          >
            Test Notification
          </BaseButton>
        </div>
      </Card>

      <!-- Backup & Sync -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Backup & Sync
          </h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Auto Backup</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Automatically backup your data</div>
            </div>
            <button @click="toggleAutoBackup" :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              settingsStore.autoBackup ? 'bg-primary-600' : 'bg-gray-200'
            ]">
              <span :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                settingsStore.autoBackup ? 'translate-x-6' : 'translate-x-1'
              ]" />
            </button>
          </div>

          <BaseSelect
            v-model="settingsStore.backupFrequency"
            label="Backup Frequency"
            :options="backupFrequencyOptions"
            @change="settingsStore.saveSettings"
          />
        </div>
      </Card>

      <!-- Data Management -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Data Management
          </h2>
        </template>

        <div class="space-y-3">
          <QuickActionButton
            :icon="ArrowDownTrayIcon"
            text="Export All Data"
            color="blue"
            @click="exportAllData"
          />

          <QuickActionButton
            :icon="ArrowUpTrayIcon"
            text="Import Data"
            color="green"
            @click="importData"
          />

          <QuickActionButton
            :icon="TrashIcon"
            text="Clear All Data"
            color="red"
            @click="clearAllData"
          />
        </div>
      </Card>

      <!-- Subscription -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Subscription
          </h2>
        </template>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-white capitalize">
              {{ authStore.subscriptionPlan }} Plan
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ getPlanDescription() }}
            </div>
          </div>
          <BaseButton
            variant="primary"
            @click="showPurchaseModal = true"
          >
            Upgrade
          </BaseButton>
        </div>
      </Card>

      <!-- About -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            About
          </h2>
        </template>

        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex justify-between">
            <span>Version</span>
            <span>1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span>Build</span>
            <span>2024.01.15</span>
          </div>
          <div class="flex justify-between">
            <span>Device ID</span>
            <span class="font-mono text-xs">{{ authStore.deviceId.slice(0, 8) }}...</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Modals -->
    <PurchaseModal v-if="showPurchaseModal" @close="showPurchaseModal = false" @success="handlePurchaseSuccess" />
    <AuthenticatorSetup v-if="showAuthenticatorSetup" @close="showAuthenticatorSetup = false" @success="handleAuthenticatorSetup" />
    <AuthMethodChangeModal v-if="showAuthMethodModal" @close="showAuthMethodModal = false" @success="handleAuthMethodChange" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import { NotificationService } from '@/services/NotificationService'
import {
  FingerPrintIcon,
  TrashIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DevicePhoneMobileIcon,
  BellIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import QuickActionButton from '@/components/UI/QuickActionButton.vue'
import PurchaseModal from '@/components/Purchase/PurchaseModal.vue'
import AuthenticatorSetup from '@/components/Auth/AuthenticatorSetup.vue'
import AuthMethodChangeModal from '@/components/Auth/AuthMethodChangeModal.vue'
import Card from '@/components/UI/Card.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import BaseSelect from '@/components/UI/BaseSelect.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const showPurchaseModal = ref(false)
const showAuthenticatorSetup = ref(false)
const showAuthMethodModal = ref(false)

const backupFrequencyOptions = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

const toggleCompactMode = () => {
  settingsStore.compactMode = !settingsStore.compactMode
  settingsStore.saveSettings()
  toastStore.success(`Compact mode ${settingsStore.compactMode ? 'enabled' : 'disabled'}`)
}

const toggleAutoBackup = () => {
  settingsStore.autoBackup = !settingsStore.autoBackup
  settingsStore.saveSettings()
  toastStore.success(`Auto backup ${settingsStore.autoBackup ? 'enabled' : 'disabled'}`)
}

const toggleNotifications = async () => {
  settingsStore.notifications = !settingsStore.notifications
  settingsStore.saveSettings()
  
  if (settingsStore.notifications) {
    await NotificationService.initialize()
  }
  
  toastStore.success(`Notifications ${settingsStore.notifications ? 'enabled' : 'disabled'}`)
}

const testNotification = async () => {
  await NotificationService.show({
    title: 'Test Notification',
    body: 'This is a test notification from Database Manager',
    tag: 'test'
  })
}

const resetAuth = () => {
  if (confirm('Are you sure you want to reset authentication? You will need to set it up again.')) {
    authStore.resetAuth()
    toastStore.success('Authentication reset successfully')
  }
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
    a.download = `full_backup_${new Date().toISOString().split('T')[0]}.sql`
    a.click()
    URL.revokeObjectURL(url)

    toastStore.success('Data exported successfully')
    await NotificationService.showDataBackup()
  } catch (error) {
    toastStore.error('Failed to export data')
  }
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.sql,.json,.csv'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        await databaseStore.importData(file, {
          format: file.name.endsWith('.sql') ? 'sql' : 'json',
          createTable: true,
          updateExisting: false
        })
        toastStore.success('Data imported successfully')
      } catch (error) {
        toastStore.error('Failed to import data')
      }
    }
  }
  input.click()
}

const clearAllData = () => {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    localStorage.removeItem('database')
    window.location.reload()
  }
}

const getPlanDescription = () => {
  const descriptions = {
    free: 'Basic features with limited storage',
    premium: 'Advanced features with cloud sync',
    professional: 'Full features for teams',
    enterprise: 'Custom solutions for organizations'
  }
  return descriptions[authStore.subscriptionPlan as keyof typeof descriptions] || 'Unknown plan'
}

const handlePurchaseSuccess = (productId: string) => {
  toastStore.success('Purchase successful!')
  showPurchaseModal.value = false
  authStore.updateSubscription('premium')
}

const handleAuthenticatorSetup = () => {
  showAuthenticatorSetup.value = false
  toastStore.success('Two-factor authentication enabled!')
}

const handleAuthMethodChange = () => {
  showAuthMethodModal.value = false
  toastStore.success('Authentication method updated!')
}
</script>