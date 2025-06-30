/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDataSource, exportDatabaseSQL, importDatabaseSQL, initializeDatabase } from '../database/connection'
import { Database } from '../database/entities/Database'
import { Table } from '../database/entities/Table'
import { Field } from '../database/entities/Field'
import { Record } from '../database/entities/Record'
import { Relationship } from '../database/entities/Relationship'
import type { DatabaseStats, ExportOptions, ImportOptions } from '../types/database'

export const useDatabaseStore = defineStore('database', () => {
  const databases = ref<Database[]>([])
  const currentDatabase = ref<Database | null>(null)
  const currentTable = ref<Table | null>(null)
  const isLoading = ref(false)

  const stats = computed((): DatabaseStats => ({
    totalDatabases: databases.value.length,
    totalTables: databases.value.reduce((acc, db) => acc + (db.tables?.length || 0), 0),
    totalRecords: databases.value.reduce((acc, db) =>
      acc + (db.tables?.reduce((tableAcc, table) => tableAcc + (table.records?.length || 0), 0) || 0), 0
    ),
    storageUsed: calculateStorageUsed(),
    lastBackup: new Date()
  }))

  const calculateStorageUsed = () => {
    try {
      const dbData = localStorage.getItem('database')
      return dbData ? new Blob([dbData]).size : 0
    } catch {
      return 0
    }
  }

  const loadDatabases = async () => {
    isLoading.value = true
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const databaseRepo = dataSource.getRepository(Database)
      const loadedDatabases = await databaseRepo.find({
        relations: ['tables', 'tables.fields', 'tables.records', 'tables.sourceRelationships', 'tables.targetRelationships']
      })

      // Enhanced JSON data parsing with better error handling
      loadedDatabases.forEach(db => {
        if (db.tables) {
          db.tables.forEach(table => {
            if (table.records) {
              table.records.forEach(record => {
                try {
                  // Ensure record.data is always an object
                  if (typeof record.data === 'string') {
                    record.data = JSON.parse(record.data)
                  } else if (!record.data || typeof record.data !== 'object') {
                    record.data = {}
                  }
                } catch (error) {
                  console.warn('Failed to parse record data, using empty object:', error)
                  record.data = {}
                }
              })
            }
            if (table.fields) {
              table.fields.forEach(field => {
                try {
                  // Parse validation if it's a string, otherwise keep as-is
                  if (typeof field.validation === 'string' && field.validation.trim()) {
                    field.validation = JSON.parse(field.validation)
                  } else if (!field.validation) {
                    field.validation = undefined
                  }
                } catch (error) {
                  console.warn('Failed to parse field validation, setting to undefined:', error)
                  field.validation = undefined
                }

                try {
                  // Parse options if it's a string, otherwise keep as-is
                  if (typeof field.options === 'string' && field.options.trim()) {
                    field.options = JSON.parse(field.options)
                  } else if (!field.options) {
                    field.options = undefined
                  }
                } catch (error) {
                  console.warn('Failed to parse field options, setting to undefined:', error)
                  field.options = undefined
                }
              })
            }
          })
        }
      })

      databases.value = loadedDatabases
      console.log('Loaded databases:', databases.value.length)
    } catch (error) {
      console.error('Failed to load databases:', error)
      databases.value = []
    } finally {
      isLoading.value = false
    }
  }

  const createDatabase = async (name: string, description?: string, thumbnail?: string) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const databaseRepo = dataSource.getRepository(Database)

      const database = new Database()
      database.name = name
      database.description = description
      database.thumbnail = thumbnail
      database.isEncrypted = false

      const savedDatabase = await databaseRepo.save(database)
      savedDatabase.tables = []
      databases.value.push(savedDatabase)
      return savedDatabase
    } catch (error) {
      console.error('Failed to create database:', error)
      throw error
    }
  }

  const updateDatabase = async (id: string, updates: Partial<Database>) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const databaseRepo = dataSource.getRepository(Database)

      await databaseRepo.update(id, updates)
      const index = databases.value.findIndex(db => db.id === id)
      if (index !== -1) {
        databases.value[index] = { ...databases.value[index], ...updates }
      }

      return databases.value[index]
    } catch (error) {
      console.error('Failed to update database:', error)
      throw error
    }
  }

  const deleteDatabase = async (id: string) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const databaseRepo = dataSource.getRepository(Database)

      await databaseRepo.delete(id)
      databases.value = databases.value.filter(db => db.id !== id)

      if (currentDatabase.value?.id === id) {
        currentDatabase.value = null
      }
    } catch (error) {
      console.error('Failed to delete database:', error)
      throw error
    }
  }

  const createTable = async (databaseId: string, name: string, thumbnail?: string) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const tableRepo = dataSource.getRepository(Table)

      const table = new Table()
      table.name = name
      table.thumbnail = thumbnail
      table.databaseId = databaseId

      const savedTable = await tableRepo.save(table)
      savedTable.fields = []
      savedTable.records = []
      savedTable.sourceRelationships = []
      savedTable.targetRelationships = []

      const database = databases.value.find(db => db.id === databaseId)
      if (database) {
        if (!database.tables) database.tables = []
        database.tables.push(savedTable)
      }

      return savedTable
    } catch (error) {
      console.error('Failed to create table:', error)
      throw error
    }
  }

  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const tableRepo = dataSource.getRepository(Table)

      await tableRepo.update(id, updates)

      for (const database of databases.value) {
        if (database.tables) {
          const index = database.tables.findIndex(table => table.id === id)
          if (index !== -1) {
            database.tables[index] = { ...database.tables[index], ...updates }
            break
          }
        }
      }
    } catch (error) {
      console.error('Failed to update table:', error)
      throw error
    }
  }

  const deleteTable = async (id: string) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const tableRepo = dataSource.getRepository(Table)

      await tableRepo.delete(id)

      for (const database of databases.value) {
        if (database.tables) {
          database.tables = database.tables.filter(table => table.id !== id)
        }
      }

      if (currentTable.value?.id === id) {
        currentTable.value = null
      }
    } catch (error) {
      console.error('Failed to delete table:', error)
      throw error
    }
  }

  const addField = async (tableId: string, fieldData: any) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const fieldRepo = dataSource.getRepository(Field)

      const field = new Field()
      Object.assign(field, fieldData)
      field.tableId = tableId

      // Ensure validation and options are properly serialized
      if (fieldData.validation && typeof fieldData.validation === 'object') {
        field.validation = JSON.stringify(fieldData.validation)
      }
      if (fieldData.options && typeof fieldData.options === 'object') {
        field.options = JSON.stringify(fieldData.options)
      }

      const savedField = await fieldRepo.save(field)

      // Parse back for in-memory representation
      try {
        if (savedField.validation && typeof savedField.validation === 'string') {
          savedField.validation = JSON.parse(savedField.validation)
        }
      } catch {
        savedField.validation = undefined
      }

      try {
        if (savedField.options && typeof savedField.options === 'string') {
          savedField.options = JSON.parse(savedField.options)
        }
      } catch {
        savedField.options = undefined
      }

      for (const database of databases.value) {
        if (database.tables) {
          const table = database.tables.find(t => t.id === tableId)
          if (table) {
            if (!table.fields) table.fields = []
            table.fields.push(savedField)
            break
          }
        }
      }

      return savedField
    } catch (error) {
      console.error('Failed to add field:', error)
      throw error
    }
  }

  const updateField = async (id: string, updates: any) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const fieldRepo = dataSource.getRepository(Field)

      const updateData = { ...updates }
      
      // Ensure validation and options are properly serialized for database storage
      if (updateData.validation && typeof updateData.validation === 'object') {
        updateData.validation = JSON.stringify(updateData.validation)
      }
      if (updateData.options && typeof updateData.options === 'object') {
        updateData.options = JSON.stringify(updateData.options)
      }

      await fieldRepo.update(id, updateData)

      // Update in-memory representation with parsed objects
      const memoryUpdates = { ...updates }
      for (const database of databases.value) {
        if (database.tables) {
          for (const table of database.tables) {
            if (table.fields) {
              const index = table.fields.findIndex(field => field.id === id)
              if (index !== -1) {
                table.fields[index] = { ...table.fields[index], ...memoryUpdates }
                return
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update field:', error)
      throw error
    }
  }

  const deleteField = async (id: string) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const fieldRepo = dataSource.getRepository(Field)

      await fieldRepo.delete(id)

      for (const database of databases.value) {
        if (database.tables) {
          for (const table of database.tables) {
            if (table.fields) {
              table.fields = table.fields.filter(field => field.id !== id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete field:', error)
      throw error
    }
  }

  const addRecord = async (tableId: string, data: { [fieldId: string]: any }) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const recordRepo = dataSource.getRepository(Record)

      const record = new Record()
      record.tableId = tableId
      record.data = JSON.stringify(data) // Always stringify for database storage
      record.version = 1

      const savedRecord = await recordRepo.save(record)
      
      // Keep parsed data in memory for immediate use
      savedRecord.data = data

      for (const database of databases.value) {
        if (database.tables) {
          const table = database.tables.find(t => t.id === tableId)
          if (table) {
            if (!table.records) table.records = []
            table.records.push(savedRecord)
            break
          }
        }
      }

      return savedRecord
    } catch (error) {
      console.error('Failed to add record:', error)
      throw error
    }
  }

  const updateRecord = async (id: string, data: { [fieldId: string]: any }) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const recordRepo = dataSource.getRepository(Record)

      const record = await recordRepo.findOne({ where: { id } })
      if (record) {
        // Parse existing data and merge with updates
        let existingData = {}
        try {
          existingData = typeof record.data === 'string' ? JSON.parse(record.data) : record.data || {}
        } catch {
          existingData = {}
        }
        
        const newData = { ...existingData, ...data }
        record.data = JSON.stringify(newData) // Always stringify for database storage
        record.version += 1
        await recordRepo.save(record)

        // Update in-memory representation with parsed data
        for (const database of databases.value) {
          if (database.tables) {
            for (const table of database.tables) {
              if (table.records) {
                const index = table.records.findIndex(r => r.id === id)
                if (index !== -1) {
                  table.records[index].data = newData
                  table.records[index].version = record.version
                  return
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update record:', error)
      throw error
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const recordRepo = dataSource.getRepository(Record)

      await recordRepo.delete(id)

      for (const database of databases.value) {
        if (database.tables) {
          for (const table of database.tables) {
            if (table.records) {
              table.records = table.records.filter(record => record.id !== id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete record:', error)
      throw error
    }
  }

  const createRelationship = async (relationshipData: any) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const relationshipRepo = dataSource.getRepository(Relationship)

      const relationship = new Relationship()
      Object.assign(relationship, relationshipData)

      const savedRelationship = await relationshipRepo.save(relationship)

      for (const database of databases.value) {
        if (database.tables) {
          const sourceTable = database.tables.find(t => t.id === relationshipData.sourceTableId)
          if (sourceTable) {
            if (!sourceTable.sourceRelationships) sourceTable.sourceRelationships = []
            sourceTable.sourceRelationships.push(savedRelationship)
            break
          }
        }
      }

      return savedRelationship
    } catch (error) {
      console.error('Failed to create relationship:', error)
      throw error
    }
  }

  const updateRelationship = async (id: string, updates: any) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const relationshipRepo = dataSource.getRepository(Relationship)

      await relationshipRepo.update(id, updates)

      for (const database of databases.value) {
        if (database.tables) {
          for (const table of database.tables) {
            if (table.sourceRelationships) {
              const index = table.sourceRelationships.findIndex(rel => rel.id === id)
              if (index !== -1) {
                table.sourceRelationships[index] = { ...table.sourceRelationships[index], ...updates }
                return
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update relationship:', error)
      throw error
    }
  }

  const deleteRelationship = async (id: string) => {
    try {
      await initializeDatabase()
      const dataSource = getDataSource()
      const relationshipRepo = dataSource.getRepository(Relationship)

      await relationshipRepo.delete(id)

      for (const database of databases.value) {
        if (database.tables) {
          for (const table of database.tables) {
            if (table.sourceRelationships) {
              table.sourceRelationships = table.sourceRelationships.filter(rel => rel.id !== id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete relationship:', error)
      throw error
    }
  }

  const exportData = async (options: ExportOptions): Promise<Blob> => {
    try {
      await initializeDatabase()
      if (options.format === 'sql') {
        const sqlContent = await exportDatabaseSQL()
        return new Blob([sqlContent], { type: 'application/sql' })
      }

      const exportData = {
        databases: databases.value,
        exportedAt: new Date().toISOString(),
        format: options.format
      }

      const content = JSON.stringify(exportData, null, 2)
      return new Blob([content], { type: 'application/json' })
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  const importData = async (file: File, options: ImportOptions) => {
    try {
      await initializeDatabase()
      const content = await file.text()

      if (options.format === 'sql') {
        await importDatabaseSQL(content)
        await loadDatabases()
        return { success: true, recordsImported: 0 }
      }

      return { success: true, recordsImported: 0 }
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  const findTableById = (tableId: string): Table | null => {
    for (const database of databases.value) {
      if (database.tables) {
        const table = database.tables.find(t => t.id === tableId)
        if (table) return table
      }
    }
    return null
  }

  return {
    databases,
    currentDatabase,
    currentTable,
    isLoading,
    stats,
    loadDatabases,
    createDatabase,
    updateDatabase,
    deleteDatabase,
    createTable,
    updateTable,
    deleteTable,
    addField,
    updateField,
    deleteField,
    addRecord,
    updateRecord,
    deleteRecord,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    exportData,
    importData,
    findTableById
  }
})