export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface UsageStats {
  dailyActiveUsers: number
  totalDatabases: number
  totalTables: number
  totalRecords: number
  storageUsed: number
  apiCalls: number
  errorRate: number
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = []

  static track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date()
    }

    this.events.push(event)
    
    // Store in localStorage for persistence
    try {
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      storedEvents.push(event)
      
      // Keep only last 1000 events
      if (storedEvents.length > 1000) {
        storedEvents.splice(0, storedEvents.length - 1000)
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(storedEvents))
    } catch (error) {
      console.error('Failed to store analytics event:', error)
    }
  }

  static getEvents(days: number = 7): AnalyticsEvent[] {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      return storedEvents.filter((event: AnalyticsEvent) => 
        new Date(event.timestamp || 0) >= cutoffDate
      )
    } catch (error) {
      console.error('Failed to get analytics events:', error)
      return []
    }
  }

  static getUsageStats(): UsageStats {
    const events = this.getEvents(30) // Last 30 days
    
    return {
      dailyActiveUsers: 1, // Simplified for single user app
      totalDatabases: this.countEvents('database_created'),
      totalTables: this.countEvents('table_created'),
      totalRecords: this.countEvents('record_created'),
      storageUsed: this.calculateStorageUsed(),
      apiCalls: this.countEvents('api_call'),
      errorRate: this.calculateErrorRate()
    }
  }

  private static countEvents(eventName: string): number {
    return this.getEvents().filter(event => event.name === eventName).length
  }

  private static calculateStorageUsed(): number {
    try {
      const dbData = localStorage.getItem('database')
      return dbData ? new Blob([dbData]).size : 0
    } catch {
      return 0
    }
  }

  private static calculateErrorRate(): number {
    const events = this.getEvents()
    const totalEvents = events.length
    const errorEvents = events.filter(event => event.name.includes('error')).length
    
    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0
  }

  // Predefined tracking methods
  static trackDatabaseCreated(databaseName: string): void {
    this.track('database_created', { name: databaseName })
  }

  static trackTableCreated(tableName: string, databaseId: string): void {
    this.track('table_created', { name: tableName, databaseId })
  }

  static trackRecordCreated(tableId: string): void {
    this.track('record_created', { tableId })
  }

  static trackFieldCreated(fieldType: string, tableId: string): void {
    this.track('field_created', { type: fieldType, tableId })
  }

  static trackExport(format: string, itemCount: number): void {
    this.track('data_exported', { format, itemCount })
  }

  static trackImport(format: string, itemCount: number): void {
    this.track('data_imported', { format, itemCount })
  }

  static trackError(error: string, context?: string): void {
    this.track('error_occurred', { error, context })
  }

  static trackPageView(page: string): void {
    this.track('page_view', { page })
  }

  static trackFeatureUsed(feature: string): void {
    this.track('feature_used', { feature })
  }
}