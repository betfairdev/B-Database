<template>
  <div>
    <MobileHeader title="Subscription" icon="💎" :show-back-button="true" />

    <div class="p-4 space-y-6">
      <!-- Current Plan -->
      <Card>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Current Plan
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                You are currently on the {{ authStore.subscriptionPlan }} plan
              </p>
            </div>
            <Badge :variant="getBadgeVariant(authStore.subscriptionPlan)" size="lg">
              {{ authStore.subscriptionPlan.toUpperCase() }}
            </Badge>
          </div>
        </template>

        <!-- Usage Progress -->
        <div class="space-y-4">
          <ProgressBar :value="usageStats.currentUsage.databases"
            :max="usageStats.limits.databases === -1 ? 100 : usageStats.limits.databases"
            :label="`Databases (${usageStats.currentUsage.databases}/${usageStats.limits.databases === -1 ? '∞' : usageStats.limits.databases})`"
            :color="getProgressColor(usageStats.currentUsage.databases, usageStats.limits.databases)" />

          <ProgressBar :value="usageStats.currentUsage.tables"
            :max="usageStats.limits.tables === -1 ? 100 : usageStats.limits.tables"
            :label="`Tables (${usageStats.currentUsage.tables}/${usageStats.limits.tables === -1 ? '∞' : usageStats.limits.tables})`"
            :color="getProgressColor(usageStats.currentUsage.tables, usageStats.limits.tables)" />

          <ProgressBar :value="usageStats.currentUsage.records"
            :max="usageStats.limits.records === -1 ? 100000 : usageStats.limits.records"
            :label="`Records (${usageStats.currentUsage.records.toLocaleString()}/${usageStats.limits.records === -1 ? '∞' : usageStats.limits.records.toLocaleString()})`"
            :color="getProgressColor(usageStats.currentUsage.records, usageStats.limits.records)" />

          <ProgressBar :value="usageStats.currentUsage.storage" :max="usageStats.limits.storage"
            :label="`Storage (${formatBytes(usageStats.currentUsage.storage)}/${formatBytes(usageStats.limits.storage)})`"
            :color="getProgressColor(usageStats.currentUsage.storage, usageStats.limits.storage)" />
        </div>

        <template #footer>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Billing cycle: {{ formatDate(usageStats.billingCycle.start) }} - {{ formatDate(usageStats.billingCycle.end)
            }}
            ({{ usageStats.billingCycle.daysRemaining }} days remaining)
          </div>
        </template>
      </Card>

      <!-- Available Plans -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h2>
        <div class="space-y-4">
          <Card v-for="plan in plans" :key="plan.id" :class="[
            'transition-all duration-200',
            plan.id === authStore.subscriptionPlan
              ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'hover:shadow-md'
          ]">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {{ plan.name }}
                  </h3>
                  <Badge v-if="plan.popular" variant="warning">Popular</Badge>
                  <Badge v-if="plan.id === authStore.subscriptionPlan" variant="success">Current</Badge>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ plan.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ plan.price }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ plan.period }}
                </div>
              </div>
            </div>

            <!-- Features List -->
            <div class="space-y-3 mb-6">
              <div v-for="category in plan.features" :key="category.name">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {{ category.name }}
                </h4>
                <ul class="space-y-1">
                  <li v-for="feature in category.items" :key="feature"
                    class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckIcon class="w-4 h-4 text-green-500 mr-2 shrink-0" />
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>

            <button v-if="plan.id !== authStore.subscriptionPlan" @click="selectPlan(plan)" :class="[
              'w-full py-3 px-4 rounded-lg font-medium transition-colors',
              plan.popular
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            ]">
              {{ plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}` }}
            </button>
            <div v-else
              class="w-full py-3 text-center text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              Current Plan
            </div>
          </Card>
        </div>
      </div>

      <!-- Feature Comparison -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Feature Comparison
          </h2>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="text-left py-2 font-medium text-gray-900 dark:text-white">Feature</th>
                <th v-for="plan in plans" :key="plan.id"
                  class="text-center py-2 font-medium text-gray-900 dark:text-white capitalize">
                  {{ plan.name }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="feature in comparisonFeatures" :key="feature.name">
                <td class="py-3 font-medium text-gray-900 dark:text-white">{{ feature.name }}</td>
                <td v-for="plan in plans" :key="plan.id" class="text-center py-3">
                  <component :is="getFeatureIcon(feature.values[plan.id])"
                    :class="getFeatureIconClass(feature.values[plan.id])" class="w-5 h-5 mx-auto" />
                  <div v-if="typeof feature.values[plan.id] === 'string'"
                    class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ feature.values[plan.id] }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- FAQ -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </template>

        <div class="space-y-4">
          <div v-for="faq in faqs" :key="faq.question">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">{{ faq.question }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ faq.answer }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Purchase Modal -->
    <PurchaseModal v-if="showPurchaseModal" @close="showPurchaseModal = false" @success="handlePurchaseSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { PaymentService } from '@/services/PaymentService'
import { useToastStore } from '@/stores/toast'
import {
  CheckIcon,
  XMarkIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import Card from '@/components/UI/Card.vue'
import Badge from '@/components/UI/Badge.vue'
import ProgressBar from '@/components/UI/ProgressBar.vue'
import PurchaseModal from '@/components/Purchase/PurchaseModal.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()

const showPurchaseModal = ref(false)
const usageStats = ref({
  currentUsage: {
    databases: 2,
    tables: 8,
    records: 150,
    storage: 25 * 1024 * 1024 // 25MB
  },
  limits: {
    databases: 3,
    tables: 10,
    records: 1000,
    storage: 100 * 1024 * 1024 // 100MB
  },
  billingCycle: {
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    daysRemaining: 30
  }
})

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for personal projects and getting started',
    price: '$0',
    period: '/month',
    popular: false,
    features: [
      {
        name: 'Core Features',
        items: [
          '3 databases',
          '10 tables per database',
          '1,000 records total',
          '100MB storage',
          'Basic field types',
          'CSV/JSON export'
        ]
      },
      {
        name: 'Support',
        items: [
          'Community support',
          'Basic documentation'
        ]
      }
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ideal for professionals and small teams',
    price: '$9.99',
    period: '/month',
    popular: true,
    features: [
      {
        name: 'Enhanced Limits',
        items: [
          '25 databases',
          '100 tables per database',
          '50,000 records total',
          '5GB storage',
          'All field types',
          'Advanced relationships'
        ]
      },
      {
        name: 'Advanced Features',
        items: [
          'All export formats (PDF, DOCX, HTML)',
          'Data validation rules',
          'Custom field types',
          'Advanced filtering',
          'Kanban & calendar views',
          'Cloud backup & sync'
        ]
      },
      {
        name: 'Security',
        items: [
          'Database encryption',
          'Biometric authentication',
          'Backup encryption'
        ]
      },
      {
        name: 'Support',
        items: [
          'Email support',
          'Priority documentation',
          'Video tutorials'
        ]
      }
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For teams and advanced workflows',
    price: '$29.99',
    period: '/month',
    popular: false,
    features: [
      {
        name: 'Unlimited Core',
        items: [
          'Unlimited databases',
          'Unlimited tables',
          '500,000 records total',
          '50GB storage',
          'All Premium features'
        ]
      },
      {
        name: 'Collaboration',
        items: [
          'Team workspaces',
          'User permissions',
          'Shared databases',
          'Real-time collaboration',
          'Activity logs',
          'Comment system'
        ]
      },
      {
        name: 'Automation',
        items: [
          'Workflow automation',
          'Custom triggers',
          'API webhooks',
          'Scheduled exports',
          'Auto-backup rules'
        ]
      },
      {
        name: 'Analytics',
        items: [
          'Advanced analytics',
          'Custom reports',
          'Data visualization',
          'Usage insights',
          'Performance metrics'
        ]
      },
      {
        name: 'Integration',
        items: [
          'REST API access',
          'Third-party integrations',
          'Custom connectors',
          'Import from external sources'
        ]
      },
      {
        name: 'Support',
        items: [
          'Priority support',
          'Phone support',
          'Dedicated account manager',
          'Custom training'
        ]
      }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: '$99.99',
    period: '/month',
    popular: false,
    features: [
      {
        name: 'Enterprise Scale',
        items: [
          'Unlimited everything',
          '500GB storage',
          'All Professional features',
          'Custom storage limits'
        ]
      },
      {
        name: 'Enterprise Security',
        items: [
          'SSO integration',
          'Advanced audit logs',
          'Compliance reporting',
          'Data residency options',
          'Custom security policies'
        ]
      },
      {
        name: 'Custom Solutions',
        items: [
          'Custom integrations',
          'White-label options',
          'Custom field types',
          'Dedicated infrastructure',
          'Custom SLA'
        ]
      },
      {
        name: 'Premium Support',
        items: [
          '24/7 dedicated support',
          'Technical account manager',
          'Custom implementation',
          'On-site training',
          'Priority feature requests'
        ]
      }
    ]
  }
]

const comparisonFeatures = [
  {
    name: 'Databases',
    values: { free: '3', premium: '25', professional: 'Unlimited', enterprise: 'Unlimited' }
  },
  {
    name: 'Tables per Database',
    values: { free: '10', premium: '100', professional: 'Unlimited', enterprise: 'Unlimited' }
  },
  {
    name: 'Total Records',
    values: { free: '1,000', premium: '50,000', professional: '500,000', enterprise: 'Unlimited' }
  },
  {
    name: 'Storage',
    values: { free: '100MB', premium: '5GB', professional: '50GB', enterprise: '500GB' }
  },
  {
    name: 'Advanced Field Types',
    values: { free: false, premium: true, professional: true, enterprise: true }
  },
  {
    name: 'Cloud Backup',
    values: { free: false, premium: true, professional: true, enterprise: true }
  },
  {
    name: 'Team Collaboration',
    values: { free: false, premium: false, professional: true, enterprise: true }
  },
  {
    name: 'API Access',
    values: { free: false, premium: false, professional: true, enterprise: true }
  },
  {
    name: 'Custom Integrations',
    values: { free: false, premium: false, professional: false, enterprise: true }
  },
  {
    name: 'Priority Support',
    values: { free: false, premium: false, professional: true, enterprise: true }
  }
]

const faqs = [
  {
    question: 'Can I change my plan at any time?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.'
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Your data remains safe. If you exceed the new plan limits, you\'ll have read-only access until you upgrade or reduce your usage.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption for data at rest and in transit. Premium plans include additional security features.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance with refunds.'
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes, all plans include data export capabilities. Premium and higher plans support additional export formats.'
  }
]

const getBadgeVariant = (plan: string) => {
  switch (plan) {
    case 'free': return 'default'
    case 'premium': return 'primary'
    case 'professional': return 'success'
    case 'enterprise': return 'warning'
    default: return 'default'
  }
}

const getProgressColor = (current: number, max: number) => {
  if (max === -1) return 'primary'
  const percentage = (current / max) * 100
  if (percentage >= 90) return 'error'
  if (percentage >= 75) return 'warning'
  return 'success'
}

const getFeatureIcon = (value: any) => {
  if (value === true) return CheckIcon
  if (value === false) return XMarkIcon
  return MinusIcon
}

const getFeatureIconClass = (value: any) => {
  if (value === true) return 'text-green-500'
  if (value === false) return 'text-gray-400'
  return 'text-gray-400'
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const selectPlan = (plan: any) => {
  showPurchaseModal.value = true
}

const handlePurchaseSuccess = (productId: string) => {
  toastStore.success('Subscription updated successfully!')
  showPurchaseModal.value = false

  // Update subscription based on product
  const planMap: { [key: string]: string } = {
    'premium_monthly': 'premium',
    'premium_yearly': 'premium',
    'professional_monthly': 'professional',
    'enterprise_monthly': 'enterprise'
  }

  const newPlan = planMap[productId] || 'premium'
  authStore.updateSubscription(newPlan)
}

onMounted(async () => {
  try {
    usageStats.value = await PaymentService.getUsageStats(authStore.deviceId)
  } catch (error) {
    console.error('Failed to load usage stats:', error)
  }
})
</script>
