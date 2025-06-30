<template>
  <div>
    <MobileHeader title="Databases" icon="🗄️" :show-search="true" @search="handleSearch">
      <template #actions>
        <button @click="showCreateModal = true"
          class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
          <PlusIcon class="w-5 h-5" />
        </button>
      </template>
    </MobileHeader>

    <div class="p-4">
      <!-- Search Bar -->
      <div v-if="showSearch" class="mb-4">
        <input v-model="searchQuery" type="text" placeholder="Search databases..."
          class="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white" />
      </div>

      <!-- Database Grid -->
      <div v-if="filteredDatabases.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatabaseCard
          v-for="database in filteredDatabases"
          :key="database.id"
          :database="database"
          :show-menu="true"
          :show-date="true"
          @click="$router.push(`/database/${database.id}`)"
          @menu="showDatabaseMenu(database)"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="!searchQuery" class="text-center py-12">
        <ServerStackIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No databases yet
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Create your first database to get started
        </p>
        <button @click="showCreateModal = true"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Create Database
        </button>
      </div>

      <!-- No Search Results -->
      <div v-else class="text-center py-12">
        <MagnifyingGlassIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No results found
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Try adjusting your search terms
        </p>
      </div>
    </div>

    <!-- Create Database Modal -->
    <CreateDatabaseModal v-if="showCreateModal" :database="editingDatabase" @close="closeCreateModal"
      @save="handleSaveDatabase" />

    <!-- Database Menu -->
    <div v-if="selectedDatabase && showMenu"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50" @click="closeMenu">
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md p-6 space-y-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ selectedDatabase.name }}
          </h3>
        </div>

        <div class="space-y-2">
          <button @click="editDatabase"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <PencilIcon class="w-5 h-5 text-gray-400" />
            <span class="text-gray-900 dark:text-white">Edit Database</span>
          </button>

          <button @click="duplicateDatabase"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <DocumentDuplicateIcon class="w-5 h-5 text-gray-400" />
            <span class="text-gray-900 dark:text-white">Duplicate</span>
          </button>

          <button @click="exportDatabase"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowDownTrayIcon class="w-5 h-5 text-gray-400" />
            <span class="text-gray-900 dark:text-white">Export</span>
          </button>

          <button @click="deleteDatabase"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <TrashIcon class="w-5 h-5 text-red-500" />
            <span class="text-red-600 dark:text-red-400">Delete</span>
          </button>
        </div>

        <button @click="closeMenu"
          class="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import type { Database } from '@/database/entities/Database'
import {
  PlusIcon,
  ServerStackIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import DatabaseCard from '@/components/Database/DatabaseCard.vue'
import CreateDatabaseModal from '@/components/Modals/CreateDatabaseModal.vue'

const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const showCreateModal = ref(false)
const showSearch = ref(false)
const showMenu = ref(false)
const searchQuery = ref('')
const editingDatabase = ref<Database | null>(null)
const selectedDatabase = ref<Database | null>(null)

const filteredDatabases = computed(() => {
  if (!searchQuery.value) return databaseStore.databases

  const query = searchQuery.value.toLowerCase()
  return databaseStore.databases.filter(db =>
    db.name.toLowerCase().includes(query) ||
    db.description?.toLowerCase().includes(query)
  )
})

const handleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
  }
}

const showDatabaseMenu = (database: Database) => {
  selectedDatabase.value = database
  showMenu.value = true
}

const closeMenu = () => {
  showMenu.value = false
  selectedDatabase.value = null
}

const editDatabase = () => {
  editingDatabase.value = selectedDatabase.value
  showCreateModal.value = true
  closeMenu()
}

const duplicateDatabase = async () => {
  if (!selectedDatabase.value) return

  try {
    await databaseStore.createDatabase(
      `${selectedDatabase.value.name} (Copy)`,
      selectedDatabase.value.description,
      selectedDatabase.value.thumbnail
    )
    toastStore.success('Database duplicated successfully')
  } catch (error) {
    toastStore.error('Failed to duplicate database')
  }
  closeMenu()
}

const exportDatabase = async () => {
  if (!selectedDatabase.value) return

  try {
    const blob = await databaseStore.exportData({
      format: 'sql',
      includeMetadata: true,
      includeRelationships: true
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedDatabase.value.name.replace(/[^a-z0-9]/gi, '_')}.sql`
    a.click()
    URL.revokeObjectURL(url)

    toastStore.success('Database exported successfully')
  } catch (error) {
    toastStore.error('Failed to export database')
  }
  closeMenu()
}

const deleteDatabase = async () => {
  if (!selectedDatabase.value) return

  if (confirm(`Are you sure you want to delete "${selectedDatabase.value.name}"? This action cannot be undone.`)) {
    try {
      await databaseStore.deleteDatabase(selectedDatabase.value.id)
      toastStore.success('Database deleted successfully')
    } catch (error) {
      toastStore.error('Failed to delete database')
    }
  }
  closeMenu()
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingDatabase.value = null
}

const handleSaveDatabase = async (databaseData: any) => {
  try {
    if (editingDatabase.value) {
      await databaseStore.updateDatabase(editingDatabase.value.id, databaseData)
      toastStore.success('Database updated successfully')
    } else {
      await databaseStore.createDatabase(databaseData.name, databaseData.description, databaseData.thumbnail)
      toastStore.success('Database created successfully')
    }
    closeCreateModal()
  } catch (error) {
    toastStore.error('Failed to save database')
  }
}
</script>