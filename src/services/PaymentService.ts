import { SubscriptionPlan } from '@/types/auth'

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
}

export interface Invoice {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  date: Date
  description: string
  downloadUrl?: string
}

export class PaymentService {
  private static subscriptions: Subscription[] = []
  private static paymentMethods: PaymentMethod[] = []
  private static invoices: Invoice[] = []

  static async getSubscription(userId: string): Promise<Subscription | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return this.subscriptions.find(sub => sub.id === userId) || null
  }

  static async createSubscription(userId: string, plan: SubscriptionPlan, paymentMethodId: string): Promise<Subscription> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const subscription: Subscription = {
      id: userId,
      plan,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false
    }
    
    this.subscriptions.push(subscription)
    
    // Create invoice
    const planPrices = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PREMIUM]: 9.99,
      [SubscriptionPlan.PROFESSIONAL]: 29.99,
      [SubscriptionPlan.ENTERPRISE]: 99.99
    }
    
    const invoice: Invoice = {
      id: Date.now().toString(),
      amount: planPrices[plan],
      currency: 'USD',
      status: 'paid',
      date: new Date(),
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - Monthly`
    }
    
    this.invoices.push(invoice)
    
    return subscription
  }

  static async updateSubscription(userId: string, plan: SubscriptionPlan): Promise<Subscription> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const subscription = this.subscriptions.find(sub => sub.id === userId)
    if (!subscription) throw new Error('Subscription not found')
    
    subscription.plan = plan
    
    return subscription
  }

  static async cancelSubscription(userId: string, immediately: boolean = false): Promise<Subscription> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const subscription = this.subscriptions.find(sub => sub.id === userId)
    if (!subscription) throw new Error('Subscription not found')
    
    if (immediately) {
      subscription.status = 'canceled'
    } else {
      subscription.cancelAtPeriodEnd = true
    }
    
    return subscription
  }

  static async reactivateSubscription(userId: string): Promise<Subscription> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const subscription = this.subscriptions.find(sub => sub.id === userId)
    if (!subscription) throw new Error('Subscription not found')
    
    subscription.status = 'active'
    subscription.cancelAtPeriodEnd = false
    
    return subscription
  }

  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [...this.paymentMethods]
  }

  static async addPaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: Date.now().toString()
    }
    
    // If this is the first payment method, make it default
    if (this.paymentMethods.length === 0) {
      newPaymentMethod.isDefault = true
    }
    
    // If setting as default, unset others
    if (newPaymentMethod.isDefault) {
      this.paymentMethods.forEach(pm => pm.isDefault = false)
    }
    
    this.paymentMethods.push(newPaymentMethod)
    
    return newPaymentMethod
  }

  static async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = this.paymentMethods.findIndex(pm => pm.id === paymentMethodId)
    if (index === -1) throw new Error('Payment method not found')
    
    const removedMethod = this.paymentMethods[index]
    this.paymentMethods.splice(index, 1)
    
    // If removed method was default, set another as default
    if (removedMethod.isDefault && this.paymentMethods.length > 0) {
      this.paymentMethods[0].isDefault = true
    }
  }

  static async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.paymentMethods.forEach(pm => {
      pm.isDefault = pm.id === paymentMethodId
    })
  }

  static async getInvoices(userId: string): Promise<Invoice[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [...this.invoices].sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  static async downloadInvoice(invoiceId: string): Promise<Blob> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const invoice = this.invoices.find(inv => inv.id === invoiceId)
    if (!invoice) throw new Error('Invoice not found')
    
    // Generate PDF invoice (simplified)
    const invoiceContent = `
INVOICE #${invoice.id}

Date: ${invoice.date.toLocaleDateString()}
Amount: $${invoice.amount.toFixed(2)} ${invoice.currency}
Description: ${invoice.description}
Status: ${invoice.status.toUpperCase()}

Thank you for your business!
`
    
    return new Blob([invoiceContent], { type: 'application/pdf' })
  }

  static async processPayment(amount: number, currency: string, paymentMethodId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate random success/failure for demo
    const success = Math.random() > 0.1 // 90% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`
      }
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again or use a different payment method.'
      }
    }
  }

  static async validatePaymentMethod(paymentMethod: any): Promise<{ valid: boolean; error?: string }> {
    // Simulate payment method validation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (paymentMethod.type === 'card') {
      if (!paymentMethod.number || paymentMethod.number.length < 16) {
        return { valid: false, error: 'Invalid card number' }
      }
      
      if (!paymentMethod.expiryMonth || !paymentMethod.expiryYear) {
        return { valid: false, error: 'Invalid expiry date' }
      }
      
      if (!paymentMethod.cvc || paymentMethod.cvc.length < 3) {
        return { valid: false, error: 'Invalid CVC' }
      }
    }
    
    return { valid: true }
  }

  static async getUsageStats(userId: string): Promise<{
    currentUsage: {
      databases: number
      tables: number
      records: number
      storage: number
    }
    limits: {
      databases: number
      tables: number
      records: number
      storage: number
    }
    billingCycle: {
      start: Date
      end: Date
      daysRemaining: number
    }
  }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const subscription = await this.getSubscription(userId)
    const plan = subscription?.plan || SubscriptionPlan.FREE
    
    const limits = {
      [SubscriptionPlan.FREE]: {
        databases: 3,
        tables: 10,
        records: 1000,
        storage: 100 * 1024 * 1024 // 100MB
      },
      [SubscriptionPlan.PREMIUM]: {
        databases: 25,
        tables: 100,
        records: 50000,
        storage: 5 * 1024 * 1024 * 1024 // 5GB
      },
      [SubscriptionPlan.PROFESSIONAL]: {
        databases: -1, // unlimited
        tables: -1,
        records: 500000,
        storage: 50 * 1024 * 1024 * 1024 // 50GB
      },
      [SubscriptionPlan.ENTERPRISE]: {
        databases: -1,
        tables: -1,
        records: -1,
        storage: 500 * 1024 * 1024 * 1024 // 500GB
      }
    }
    
    return {
      currentUsage: {
        databases: 2,
        tables: 8,
        records: 150,
        storage: 25 * 1024 * 1024 // 25MB
      },
      limits: limits[plan],
      billingCycle: {
        start: subscription?.currentPeriodStart || new Date(),
        end: subscription?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        daysRemaining: subscription ? Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : 0
      }
    }
  }
}