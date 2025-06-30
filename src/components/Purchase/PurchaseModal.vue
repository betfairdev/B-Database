<template>
  <Modal size="md">
    <template #header>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        Upgrade Your Plan
      </h2>
    </template>

    <div class="space-y-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary-500 transition-colors cursor-pointer"
        :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/20': selectedProduct?.id === product.id }"
        @click="selectedProduct = product"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ product.title }}
          </h3>
          <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
            {{ product.price }}
          </span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {{ product.description }}
        </p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {{ product.type }}
          </span>
          <div class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <div
              v-if="selectedProduct?.id === product.id"
              class="w-3 h-3 bg-primary-600 rounded-full"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="mt-4 text-red-600 dark:text-red-400 text-sm text-center">
      {{ error }}
    </div>

    <template #footer>
      <div class="space-y-3">
        <BaseButton
          variant="primary"
          :disabled="!selectedProduct"
          :loading="isLoading"
          loading-text="Processing..."
          full-width
          @click="purchaseSelected"
        >
          Purchase {{ selectedProduct?.price || '' }}
        </BaseButton>

        <BaseButton
          variant="ghost"
          :disabled="isLoading"
          full-width
          @click="restorePurchases"
        >
          Restore Purchases
        </BaseButton>
      </div>

      <div class="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>Subscriptions auto-renew unless cancelled.</p>
        <p>Prices may vary by region.</p>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InAppPurchaseService, type PurchaseProduct } from '../../services/InAppPurchaseService'
import Modal from '@/components/UI/Modal.vue'
import BaseButton from '@/components/UI/BaseButton.vue'

const emit = defineEmits<{
  close: []
  success: [productId: string]
}>()

const products = ref<PurchaseProduct[]>([])
const selectedProduct = ref<PurchaseProduct | null>(null)
const isLoading = ref(false)
const error = ref('')

const purchaseSelected = async () => {
  if (!selectedProduct.value) return

  error.value = ''
  isLoading.value = true

  try {
    const result = await InAppPurchaseService.purchaseProduct(selectedProduct.value.id)
    
    if (result.success) {
      emit('success', selectedProduct.value.id)
    } else {
      error.value = result.error || 'Purchase failed'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}

const restorePurchases = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const results = await InAppPurchaseService.restorePurchases()
    const successfulRestores = results.filter(r => r.success)
    
    if (successfulRestores.length > 0) {
      emit('success', 'restored')
    } else {
      error.value = 'No purchases to restore'
    }
  } catch (err) {
    error.value = 'Failed to restore purchases'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await InAppPurchaseService.initialize()
  products.value = await InAppPurchaseService.getProducts()
  
  // Pre-select premium monthly by default
  selectedProduct.value = products.value.find(p => p.id === 'premium_monthly') || products.value[0]
})
</script>