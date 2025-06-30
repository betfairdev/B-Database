<template>
  <Modal size="sm">
    <template #header>
      <div class="text-center">
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
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput
        id="email"
        v-model="credentials.email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        required
      />

      <BaseInput
        id="password"
        v-model="credentials.password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        required
      />

      <div class="flex items-center">
        <input id="remember" v-model="credentials.rememberMe" type="checkbox"
          class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
        <label for="remember" class="ml-2 text-sm text-gray-900 dark:text-gray-300">
          Remember me
        </label>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        :loading="isLoading"
        loading-text="Signing in..."
        full-width
      >
        Sign in
      </BaseButton>
    </form>

    <template #footer>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Demo credentials: demo@example.com / demo
        </p>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { AuthCredentials } from '@/types/auth'
import Modal from '@/components/UI/Modal.vue'
import BaseInput from '@/components/UI/BaseInput.vue'
import BaseButton from '@/components/UI/BaseButton.vue'

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