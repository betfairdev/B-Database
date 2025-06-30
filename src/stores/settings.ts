import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const isDarkMode = ref(false)
  const language = ref('en')
  const autoBackup = ref(true)
  const backupFrequency = ref('daily')
  const notifications = ref(true)
  const compactMode = ref(false)

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    document.documentElement.classList.toggle('dark', isDarkMode.value)
    saveSettings()
  }

  const loadSettings = () => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      isDarkMode.value = savedDarkMode === 'true'
      document.documentElement.classList.toggle('dark', isDarkMode.value)
    }
    
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      language.value = savedLanguage
    }
    
    const savedAutoBackup = localStorage.getItem('autoBackup')
    if (savedAutoBackup) {
      autoBackup.value = savedAutoBackup === 'true'
    }
    
    const savedBackupFrequency = localStorage.getItem('backupFrequency')
    if (savedBackupFrequency) {
      backupFrequency.value = savedBackupFrequency
    }
    
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      notifications.value = savedNotifications === 'true'
    }
    
    const savedCompactMode = localStorage.getItem('compactMode')
    if (savedCompactMode) {
      compactMode.value = savedCompactMode === 'true'
    }
  }

  const saveSettings = () => {
    localStorage.setItem('darkMode', isDarkMode.value.toString())
    localStorage.setItem('language', language.value)
    localStorage.setItem('autoBackup', autoBackup.value.toString())
    localStorage.setItem('backupFrequency', backupFrequency.value)
    localStorage.setItem('notifications', notifications.value.toString())
    localStorage.setItem('compactMode', compactMode.value.toString())
  }

  return {
    isDarkMode,
    language,
    autoBackup,
    backupFrequency,
    notifications,
    compactMode,
    toggleDarkMode,
    loadSettings,
    saveSettings
  }
})