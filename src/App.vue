<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDatabaseStore } from '@/stores/database'
import { useSettingsStore } from '@/stores/settings'
import { NotificationService } from '@/services/NotificationService'
import { InAppPurchaseService } from '@/services/InAppPurchaseService'
import Toast from '@/components/UI/Toast.vue'
import SplashScreen from '@/components/UI/SplashScreen.vue'
import AuthScreen from '@/components/Auth/AuthScreen.vue'
import BiometricSetup from '@/components/Auth/BiometricSetup.vue'
import BottomNavigation from '@/components/Navigation/BottomNavigation.vue'

const authStore = useAuthStore()
const databaseStore = useDatabaseStore()
const settingsStore = useSettingsStore()

const showSplash = ref(true)
const showAuthSetup = ref(false)
const isLoading = ref(true)

const handleSplashHidden = () => {
  showSplash.value = false
  initializeApp()
}

const initializeApp = async () => {
  try {
    // Initialize settings
    settingsStore.loadSettings()
    
    // Initialize notifications
    await NotificationService.initialize()
    
    // Initialize in-app purchases
    await InAppPurchaseService.initialize()
    
    // Initialize auth
    await authStore.initializeAuth()
    
    // Load databases
    await databaseStore.loadDatabases()
    
    // Check if auth setup is needed
    if (!authStore.hasAuthSetup) {
      showAuthSetup.value = true
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
  } finally {
    isLoading.value = false
  }
}

const handleAuthSetup = (method: 'biometric' | 'pin') => {
  authStore.setupAuth(method)
  showAuthSetup.value = false
}

const handleAuthSkip = () => {
  showAuthSetup.value = false
}

const handleAuthSuccess = () => {
  // Authentication successful, app will show main content
}

const handleAuthReset = () => {
  showAuthSetup.value = true
}

onMounted(() => {
  // App will initialize after splash screen
})
</script>

<template>
  <!-- Splash Screen -->
  <SplashScreen v-if="showSplash" @hidden="handleSplashHidden" />
  
  <!-- Loading State -->
  <div v-else-if="isLoading" class="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
      <p class="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
  
  <!-- Auth Setup -->
  <BiometricSetup
    v-else-if="showAuthSetup"
    @success="handleAuthSetup"
    @skip="handleAuthSkip"
  />
  
  <!-- Auth Screen -->
  <AuthScreen
    v-else-if="authStore.hasAuthSetup && !authStore.isFullyAuthenticated"
    @success="handleAuthSuccess"
    @reset="handleAuthReset"
  />
  
  <!-- Main App -->
  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
    <RouterView />
    <BottomNavigation />
    <Toast />
  </div>
</template>

<style scoped></style>