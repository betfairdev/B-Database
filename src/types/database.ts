export interface Database {
  id: string
  name: string
  description?: string
  thumbnail?: string
  isEncrypted: boolean
  encryptionKey?: string
  tables: Table[]
  createdAt: Date
  updatedAt: Date
}

export interface Table {
  id: string
  name: string
  thumbnail?: string
  databaseId: string
  fields: Field[]
  records: Record[]
  relationships: Relationship[]
  createdAt: Date
  updatedAt: Date
}

export interface Field {
  id: string
  name: string
  type: FieldType
  isRequired: boolean
  isPrimary: boolean
  isUnique: boolean
  defaultValue?: string
  validation?: FieldValidation
  options?: FieldOptions
  position: number
  isRelationshipField?: boolean
  relationshipId?: string
}

export interface Record {
  id: string
  tableId: string
  data: { [fieldId: string]: unknown }
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface Relationship {
  id: string
  type: RelationshipType
  name: string
  description?: string
  sourceTableId: string
  targetTableId: string
  sourceFieldId: string
  targetFieldId: string
  junctionTableId?: string
  isRequired: boolean
  onDelete: string
  onUpdate: string
  createdAt: Date
  updatedAt: Date
}

export enum RelationshipType {
  ONE_TO_ONE = 'one-to-one',
  ONE_TO_MANY = 'one-to-many',
  MANY_TO_ONE = 'many-to-one',
  MANY_TO_MANY = 'many-to-many',
  SELF_REFERENTIAL = 'self-referential'
}

export enum FieldType {
  TEXT = 'text',
  LONG_TEXT = 'long_text',
  RICH_TEXT = 'rich_text',
  NUMBER = 'number',
  CURRENCY = 'currency',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  IMAGE = 'image',
  FILE = 'file',
  GEOMETRY = 'geometry',
  COLOR = 'color',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  ENUM = 'enum',
  JSON = 'json',
  BOOLEAN = 'boolean',
  CSV = 'csv',
  RELATIONSHIP = 'relationship',
  RATING = 'rating',
  TAGS = 'tags',
  BARCODE = 'barcode',
  QR_CODE = 'qr_code'
}

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  customRules?: string[]
}

export interface FieldOptions {
  enumValues?: string[]
  currency?: string
  dateFormat?: string
  fileTypes?: string[]
  maxFileSize?: number
  precision?: number
  scale?: number
  relationshipType?: RelationshipType
  targetTableId?: string
  displayField?: string
  allowMultiple?: boolean
  maxRating?: number
  suggestedTags?: string[]
  barcodeFormat?: string
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'html' | 'pdf' | 'docx' | 'sql'
  includeMetadata: boolean
  includeRelationships: boolean
  tables?: string[]
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'sql'
  createTable: boolean
  updateExisting: boolean
  mapping?: { [sourceField: string]: string }
}

export interface FilterCondition {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'is_empty' | 'is_not_empty'
  value: unknown
}

export interface SortCondition {
  fieldId: string
  direction: 'asc' | 'desc'
}

export interface ViewConfig {
  id: string
  name: string
  type: 'table' | 'cards' | 'kanban' | 'calendar' | 'gallery'
  filters: FilterCondition[]
  sorts: SortCondition[]
  groupBy?: string
  visibleFields: string[]
  fieldWidths?: { [fieldId: string]: number }
}

export interface DatabaseStats {
  totalDatabases: number
  totalTables: number
  totalRecords: number
  storageUsed: number
  lastBackup?: Date
}

export interface RelationshipData {
  sourceRecordId: string
  targetRecordId: string
  metadata?: { [key: string]: unknown }
}