<template>
  <div class="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div
      class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-xl">DB</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Database Manager
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Sign in to access your databases
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="credentials.email" type="email" required class="form-input"
            placeholder="Enter your email" />
        </div>

        <div>
          <label for="password" class="form-label">Password</label>
          <input id="password" v-model="credentials.password" type="password" required class="form-input"
            placeholder="Enter your password" />
        </div>

        <div class="flex items-center">
          <input id="remember" v-model="credentials.rememberMe" type="checkbox"
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
          <label for="remember" class="ml-2 text-sm text-gray-900 dark:text-gray-300">
            Remember me
          </label>
        </div>

        <button type="submit" :disabled="isLoading" class="w-full btn-primary">
          <span v-if="isLoading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Demo credentials: demo@example.com / demo
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { AuthCredentials } from '@/types/auth'

const emit = defineEmits<{
  authenticated: []
}>()

const authStore = useAuthStore()
const toastStore = useToastStore()

const isLoading = ref(false)
const credentials = reactive<AuthCredentials>({
  email: 'demo@example.com',
  password: 'demo',
  rememberMe: false
})

const handleSubmit = async () => {
  isLoading.value = true

  try {
    const success = await authStore.login(credentials)
    if (success) {
      toastStore.success('Welcome back!')
      emit('authenticated')
    } else {
      toastStore.error('Invalid credentials')
    }
  } catch (error) {
    toastStore.error('Login failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>
