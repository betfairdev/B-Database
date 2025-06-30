import { Capacitor } from '@capacitor/core'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
}

export interface PushNotificationPayload {
  title: string
  body: string
  data?: any
}

export class NotificationService {
  private static permission: NotificationPermission = 'default'
  private static isInitialized = false

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    if (Capacitor.isNativePlatform()) {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        
        // Request permission
        const result = await PushNotifications.requestPermissions()
        if (result.receive === 'granted') {
          await PushNotifications.register()
          
          // Add listeners
          PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success, token:', token.value)
          })

          PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration:', error)
          })

          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push received:', notification)
            this.handleNotificationReceived(notification)
          })

          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push action performed:', notification)
          })

          this.isInitialized = true
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to initialize push notifications:', error)
        return false
      }
    } else {
      // Web notifications
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications')
        return false
      }

      this.permission = Notification.permission

      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission()
      }

      this.isInitialized = this.permission === 'granted'
      return this.isInitialized
    }
  }

  static async show(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications')
        
        await LocalNotifications.schedule({
          notifications: [{
            title: options.title,
            body: options.body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) }
          }]
        })
        
        return null // Native notifications don't return a Notification object
      } catch (error) {
        console.error('Failed to show native notification:', error)
        return null
      }
    } else {
      if (this.permission !== 'granted') {
        console.warn('Notification permission not granted')
        return null
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          badge: options.badge || '/favicon.ico',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          actions: options.actions
        })

        return notification
      } catch (error) {
        console.error('Failed to show notification:', error)
        return null
      }
    }
  }

  private static handleNotificationReceived(notification: any) {
    // Handle received push notification
    this.show({
      title: notification.title || 'New Notification',
      body: notification.body || 'You have a new notification',
      tag: 'push-notification'
    })
  }

  static async showDataBackup(): Promise<void> {
    await this.show({
      title: 'Data Backup Complete',
      body: 'Your database has been successfully backed up.',
      tag: 'backup'
    })
  }

  static async showDataSync(): Promise<void> {
    await this.show({
      title: 'Data Synced',
      body: 'Your data has been synchronized across devices.',
      tag: 'sync'
    })
  }

  static async showLowStorage(): Promise<void> {
    await this.show({
      title: 'Storage Warning',
      body: 'You are running low on storage space. Consider upgrading your plan.',
      tag: 'storage',
      requireInteraction: true
    })
  }

  static async showRecordAdded(tableName: string): Promise<void> {
    await this.show({
      title: 'Record Added',
      body: `New record added to ${tableName}`,
      tag: 'record-added'
    })
  }

  static async showAuthenticationRequired(): Promise<void> {
    await this.show({
      title: 'Authentication Required',
      body: 'Please authenticate to continue using the app.',
      tag: 'auth-required',
      requireInteraction: true
    })
  }
}