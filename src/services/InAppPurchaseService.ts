import { Capacitor } from '@capacitor/core'

export interface PurchaseProduct {
  id: string
  title: string
  description: string
  price: string
  currency: string
  type: 'subscription' | 'consumable' | 'non-consumable'
}

export interface PurchaseResult {
  success: boolean
  productId?: string
  transactionId?: string
  error?: string
}

export class InAppPurchaseService {
  private static isInitialized = false
  private static products: PurchaseProduct[] = [
    {
      id: 'premium_monthly',
      title: 'Premium Monthly',
      description: 'Premium features for 1 month',
      price: '$9.99',
      currency: 'USD',
      type: 'subscription'
    },
    {
      id: 'premium_yearly',
      title: 'Premium Yearly',
      description: 'Premium features for 1 year (2 months free)',
      price: '$99.99',
      currency: 'USD',
      type: 'subscription'
    },
    {
      id: 'professional_monthly',
      title: 'Professional Monthly',
      description: 'Professional features for 1 month',
      price: '$29.99',
      currency: 'USD',
      type: 'subscription'
    },
    {
      id: 'remove_ads',
      title: 'Remove Ads',
      description: 'Remove all advertisements permanently',
      price: '$4.99',
      currency: 'USD',
      type: 'non-consumable'
    },
    {
      id: 'extra_storage',
      title: 'Extra Storage',
      description: 'Add 10GB of cloud storage',
      price: '$2.99',
      currency: 'USD',
      type: 'consumable'
    }
  ]

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    if (Capacitor.isNativePlatform()) {
      try {
        // Use cordova-plugin-purchase for native platforms
        const { store } = await import('cordova-plugin-purchase')
        
        // Register products
        this.products.forEach(product => {
          store.register({
            id: product.id,
            type: product.type === 'subscription' ? store.PAID_SUBSCRIPTION : 
                  product.type === 'consumable' ? store.CONSUMABLE : store.NON_CONSUMABLE
          })
        })

        // Set up event handlers
        store.when('product').approved((product: any) => {
          product.finish()
        })

        store.when('product').error((error: any) => {
          console.error('Purchase error:', error)
        })

        // Refresh store
        store.refresh()
        
        this.isInitialized = true
        return true
      } catch (error) {
        console.error('Failed to initialize in-app purchases:', error)
        return false
      }
    } else {
      // Web platform - purchases not available
      console.log('In-app purchases not available on web platform')
      this.isInitialized = true
      return false
    }
  }

  static async getProducts(): Promise<PurchaseProduct[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const { store } = await import('cordova-plugin-purchase')
        
        // Get products from store and map to our interface
        const storeProducts = this.products.map(product => {
          const storeProduct = store.get(product.id)
          return {
            ...product,
            price: storeProduct?.price || product.price,
            currency: storeProduct?.currency || product.currency
          }
        })
        
        return storeProducts
      } catch (error) {
        console.error('Failed to get products:', error)
        return this.products
      }
    } else {
      return this.products
    }
  }

  static async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const { store } = await import('cordova-plugin-purchase')
        
        return new Promise((resolve) => {
          store.when(productId).approved((product: any) => {
            resolve({
              success: true,
              productId,
              transactionId: product.transaction?.id
            })
            product.finish()
          })

          store.when(productId).error((error: any) => {
            resolve({
              success: false,
              error: error.message || 'Purchase failed'
            })
          })

          store.order(productId)
        })
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Purchase failed'
        }
      }
    } else {
      // Simulate purchase for web
      return this.simulatePurchase(productId)
    }
  }

  static async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const { store } = await import('cordova-plugin-purchase')
        
        return new Promise((resolve) => {
          const results: PurchaseResult[] = []
          
          store.when('product').owned((product: any) => {
            results.push({
              success: true,
              productId: product.id,
              transactionId: product.transaction?.id
            })
          })

          setTimeout(() => {
            resolve(results)
          }, 2000)

          store.refresh()
        })
      } catch (error) {
        console.error('Failed to restore purchases:', error)
        return []
      }
    } else {
      return []
    }
  }

  static async validateReceipt(receipt: string): Promise<boolean> {
    try {
      // In a real app, validate receipt with your backend
      return true
    } catch (error) {
      console.error('Failed to validate receipt:', error)
      return false
    }
  }

  private static async simulatePurchase(productId: string): Promise<PurchaseResult> {
    // Simulate purchase process for web demo
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const product = this.products.find(p => p.id === productId)
    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        productId,
        transactionId: `web_txn_${Date.now()}`
      }
    } else {
      return {
        success: false,
        error: 'Payment was declined'
      }
    }
  }
}