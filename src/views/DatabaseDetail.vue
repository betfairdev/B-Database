<template>
  <div>
    <MobileHeader :title="database?.name || 'Database'" :subtitle="database?.description" :show-back-button="true">
      <template #actions>
        <button @click="showCreateTableModal = true"
          class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
          <PlusIcon class="w-5 h-5" />
        </button>
      </template>
    </MobileHeader>

    <div v-if="!database" class="p-4">
      <div class="text-center py-12">
        <TableCellsIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Database not found</p>
      </div>
    </div>

    <div v-else class="p-4">
      <!-- Database Info Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img v-if="database.thumbnail" :src="database.thumbnail" :alt="database.name"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ database.name }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ database.description || 'No description' }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 text-center">
          <StatCard
            :icon="TableCellsIcon"
            :value="database.tables?.length || 0"
            label="Tables"
            color="primary"
          />
          
          <StatCard
            :icon="DocumentTextIcon"
            :value="getTotalRecords()"
            label="Records"
            color="green"
          />
          
          <StatCard
            :icon="HashtagIcon"
            :value="getTotalFields()"
            label="Fields"
            color="blue"
          />
        </div>
      </div>

      <!-- Tables Grid -->
      <div v-if="database.tables && database.tables.length > 0" class="space-y-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Tables</h2>
        <div class="space-y-3">
          <TableCard
            v-for="table in database.tables"
            :key="table.id"
            :table="table"
            @click="$router.push(`/database/${database.id}/table/${table.id}`)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <TableCellsIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No tables yet
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Create your first table to start organizing your data
        </p>
        <button @click="showCreateTableModal = true"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Create Table
        </button>
      </div>
    </div>

    <!-- Create Table Modal -->
    <CreateTableModal v-if="showCreateTableModal" :database-id="databaseId" :table="editingTable"
      @close="closeCreateTableModal" @save="handleSaveTable" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import type { Table } from '@/types/database'
import {
  PlusIcon,
  TableCellsIcon,
  DocumentTextIcon,
  HashtagIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import StatCard from '@/components/UI/StatCard.vue'
import TableCard from '@/components/Database/TableCard.vue'
import CreateTableModal from '@/components/Modals/CreateTableModal.vue'

const route = useRoute()
const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const databaseId = route.params.id as string
const showCreateTableModal = ref(false)
const editingTable = ref<Table | null>(null)

const database = computed(() =>
  databaseStore.databases.find(db => db.id === databaseId)
)

const getTotalRecords = () => {
  return database.value?.tables?.reduce((total, table) => total + (table.records?.length || 0), 0) || 0
}

const getTotalFields = () => {
  return database.value?.tables?.reduce((total, table) => total + (table.fields?.length || 0), 0) || 0
}

const closeCreateTableModal = () => {
  showCreateTableModal.value = false
  editingTable.value = null
}

const handleSaveTable = async (tableData: any) => {
  try {
    if (editingTable.value) {
      await databaseStore.updateTable(editingTable.value.id, tableData)
      toastStore.success('Table updated successfully')
    } else {
      await databaseStore.createTable(databaseId, tableData.name, tableData.thumbnail)
      toastStore.success('Table created successfully')
    }
    closeCreateTableModal()
  } catch (error) {
    toastStore.error('Failed to save table')
  }
}

onMounted(() => {
  if (!database.value) {
    databaseStore.loadDatabases()
  }
})
</script>