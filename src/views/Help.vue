<template>
  <div>
    <MobileHeader title="Help & Support" icon="❓" :show-back-button="true" />

    <div class="p-4 space-y-6">
      <!-- Quick Help -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Help
          </h2>
        </template>

        <div class="grid grid-cols-2 gap-3">
          <button v-for="quickHelp in quickHelpItems" :key="quickHelp.title" @click="openQuickHelp(quickHelp)"
            class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <component :is="quickHelp.icon" class="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" />
            <span class="text-sm font-medium text-gray-900 dark:text-white text-center">
              {{ quickHelp.title }}
            </span>
          </button>
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
          <div v-for="(faq, index) in faqs" :key="index"
            class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
            <button @click="toggleFaq(index)" class="w-full text-left flex items-center justify-between py-2">
              <h3 class="font-medium text-gray-900 dark:text-white">{{ faq.question }}</h3>
              <ChevronDownIcon :class="[
                'w-5 h-5 text-gray-400 transition-transform',
                openFaqs.includes(index) ? 'rotate-180' : ''
              ]" />
            </button>
            <div v-if="openFaqs.includes(index)" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </Card>

      <!-- Contact Support -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Contact Support
          </h2>
        </template>

        <div class="space-y-4">
          <button @click="sendEmail"
            class="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <EnvelopeIcon class="w-5 h-5 text-gray-400" />
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Email Support</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Get help via email</div>
            </div>
          </button>

          <button @click="openChat"
            class="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <ChatBubbleLeftRightIcon class="w-5 h-5 text-gray-400" />
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Live Chat</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Chat with our support team</div>
            </div>
          </button>

          <button @click="reportBug"
            class="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <BugAntIcon class="w-5 h-5 text-gray-400" />
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Report a Bug</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Help us improve the app</div>
            </div>
          </button>
        </div>
      </Card>

      <!-- App Info -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            App Information
          </h2>
        </template>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Version</span>
            <span class="text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Build</span>
            <span class="text-gray-900 dark:text-white">2024.01.15</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Platform</span>
            <span class="text-gray-900 dark:text-white">Web</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/stores/toast'
import {
  ChevronDownIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  BugAntIcon,
  BookOpenIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  CogIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import Card from '@/components/UI/Card.vue'

const toastStore = useToastStore()

const openFaqs = ref<number[]>([])

const quickHelpItems = [
  {
    title: 'Getting Started',
    icon: BookOpenIcon,
    action: 'getting-started'
  },
  {
    title: 'Video Tutorials',
    icon: PlayIcon,
    action: 'tutorials'
  },
  {
    title: 'User Guide',
    icon: QuestionMarkCircleIcon,
    action: 'user-guide'
  },
  {
    title: 'Settings Help',
    icon: CogIcon,
    action: 'settings-help'
  }
]

const faqs = [
  {
    question: 'How do I create my first database?',
    answer: 'Tap the "+" button on the Databases screen, enter a name and description, then tap "Create Database". You can then add tables and fields to organize your data.'
  },
  {
    question: 'What field types are available?',
    answer: 'We support text, numbers, dates, images, files, relationships, and many more field types. Premium plans include advanced field types like JSON, geometry, and custom validations.'
  },
  {
    question: 'How do I backup my data?',
    answer: 'Go to Settings > Data Management and tap "Export All Data". Premium users get automatic cloud backup. You can also manually export individual databases.'
  },
  {
    question: 'Can I import data from other apps?',
    answer: 'Yes! You can import CSV, JSON, and SQL files. Go to Settings > Data Management > Import Data to get started.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All data is stored locally on your device by default. Premium plans include encryption and secure cloud backup options.'
  },
  {
    question: 'How do relationships work?',
    answer: 'Relationships link records between tables. For example, you can link a "Customer" to multiple "Orders". We support one-to-one, one-to-many, and many-to-many relationships.'
  },
  {
    question: 'What happens if I reach my plan limits?',
    answer: 'You\'ll receive notifications as you approach limits. If you exceed them, you can upgrade your plan or remove some data to stay within limits.'
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Yes! The app works completely offline. Your data is stored locally and syncs when you\'re back online (Premium feature).'
  }
]

const toggleFaq = (index: number) => {
  const faqIndex = openFaqs.value.indexOf(index)
  if (faqIndex > -1) {
    openFaqs.value.splice(faqIndex, 1)
  } else {
    openFaqs.value.push(index)
  }
}

const openQuickHelp = (item: any) => {
  switch (item.action) {
    case 'getting-started':
      toastStore.info('Opening getting started guide...')
      break
    case 'tutorials':
      toastStore.info('Opening video tutorials...')
      break
    case 'user-guide':
      toastStore.info('Opening user guide...')
      break
    case 'settings-help':
      toastStore.info('Opening settings help...')
      break
  }
}

const sendEmail = () => {
  const subject = encodeURIComponent('Database Manager Support Request')
  const body = encodeURIComponent('Please describe your issue or question:\n\n')
  window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`
}

const openChat = () => {
  toastStore.info('Live chat feature coming soon!')
}

const reportBug = () => {
  toastStore.info('Bug reporting feature coming soon!')
}
</script>
