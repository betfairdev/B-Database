<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Navigation -->
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">DB</span>
            </div>
            <span class="text-xl font-semibold text-gray-900 dark:text-white hidden md:block">
              Database Manager
            </span>
          </router-link>

          <nav class="hidden md:flex space-x-6">
            <router-link
              to="/"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors"
              active-class="text-primary-600 dark:text-primary-400"
            >
              Dashboard
            </router-link>
            <router-link
              to="/databases"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors"
              active-class="text-primary-600 dark:text-primary-400"
            >
              Databases
            </router-link>
            <router-link
              to="/settings"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors"
              active-class="text-primary-600 dark:text-primary-400"
            >
              Settings
            </router-link>
          </nav>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="settingsStore.toggleDarkMode"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <SunIcon v-if="settingsStore.isDarkMode" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>

          <!-- Notifications -->
          <button class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <BellIcon class="w-5 h-5" />
          </button>

          <!-- User Menu -->
          <div class="relative" ref="userMenuRef">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span class="text-primary-600 dark:text-primary-400 font-medium text-sm">
                  {{ authStore.user?.name?.charAt(0) || 'U' }}
                </span>
              </div>
              <ChevronDownIcon class="w-4 h-4" />
            </button>

            <!-- User Dropdown -->
            <div
              v-show="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ authStore.user?.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ authStore.user?.email }}
                </p>
              </div>
              
              <router-link
                to="/subscription"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Subscription ({{ authStore.userPlan }})
              </router-link>
              
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>

          <!-- Mobile Menu Toggle -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon v-if="!showMobileMenu" class="w-5 h-5" />
            <XMarkIcon v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-show="showMobileMenu" class="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
        <nav class="space-y-2">
          <router-link
            to="/"
            class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
            active-class="text-primary-600 dark:text-primary-400"
            @click="showMobileMenu = false"
          >
            Dashboard
          </router-link>
          <router-link
            to="/databases"
            class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
            active-class="text-primary-600 dark:text-primary-400"
            @click="showMobileMenu = false"
          >
            Databases
          </router-link>
          <router-link
            to="/settings"
            class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
            active-class="text-primary-600 dark:text-primary-400"
            @click="showMobileMenu = false"
          >
            Settings
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  settingsStore.loadSettings()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>