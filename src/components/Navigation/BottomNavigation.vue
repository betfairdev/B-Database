<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-pb">
    <div class="flex justify-around items-center h-16 px-4">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200 relative"
        :class="[
          isActive(item.path)
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        <component
          :is="item.icon"
          class="w-6 h-6 mb-1"
        />
        <span class="text-xs font-medium">{{ item.name }}</span>
        
        <!-- Active indicator -->
        <div
          v-if="isActive(item.path)"
          class="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"
        ></div>
        
        <!-- Badge for notifications -->
        <div
          v-if="item.badge && item.badge > 0"
          class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
        >
          {{ item.badge > 99 ? '99+' : item.badge }}
        </div>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDatabaseStore } from '@/stores/database'
import {
  HomeIcon,
  ServerStackIcon,
  CogIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const databaseStore = useDatabaseStore()

const navigationItems = computed(() => [
  {
    name: 'Home',
    path: '/',
    icon: HomeIcon,
    badge: 0
  },
  {
    name: 'Databases',
    path: '/databases',
    icon: ServerStackIcon,
    badge: databaseStore.databases.length
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: ChartBarIcon,
    badge: 0
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: CogIcon,
    badge: 0
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: UserIcon,
    badge: 0
  }
])

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>