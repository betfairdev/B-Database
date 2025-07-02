export interface DBManagerConfig {
  mode: 'device' | 'sync-server';
  env: 'node' | 'browser' | 'native';
  connection: any; // TypeORM ConnectionOptions
  sync?: {
    enabled?: boolean;
    serverUrl?: string;
    pollingIntervalMs?: number;
    retryPolicy?: {
      maxRetries: number;
      backoffMs: number;
    };
  };
  fileManager?: {
    storageAdapter: 'local' | 'memory' | 'cloud';
    basePath?: string;
    removeOrphansOnPurge?: boolean;
    thumbnailSizes?: number[];
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableChangeLog?: boolean;
    maxChangeLogEntries?: number;
  };
}

export interface QueryOptions {
  where?: Record<string, any>;
  search?: string;
  searchFields?: string[];
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
  include?: string[];
  exclude?: string[];
  includeDeleted?: boolean;
}

export interface SyncReport {
  startTime: Date;
  endTime: Date;
  operations: {
    pulled: number;
    pushed: number;
    conflicts: number;
    errors: number;
  };
  tables: string[];
  conflicts?: ConflictInfo[];
  errors?: ErrorInfo[];
}

export interface ConflictInfo {
  table: string;
  recordId: string;
  field: string;
  localValue: any;
  remoteValue: any;
  resolution: 'local' | 'remote' | 'merge' | 'skip';
}

export interface ErrorInfo {
  table?: string;
  recordId?: string;
  operation: string;
  error: string;
  timestamp: Date;
}

export interface FieldType {
  name: string;
  displayName: string;
  description?: string;
  category: 'basic' | 'advanced' | 'media' | 'calculation' | 'relationship';
  validate: (value: any, options?: Record<string, any>) => boolean | string;
  serialize: (value: any, options?: Record<string, any>) => any;
  deserialize: (value: any, options?: Record<string, any>) => any;
  ui?: {
    component: string;
    props?: Record<string, any>;
  };
  defaultOptions?: Record<string, any>;
}

export interface CreateTableOptions {
  dbId: string;
  name: string;
  identifier?: string;
  description?: string;
  fields: CreateFieldOptions[];
  indexes?: CreateIndexOptions[];
}

export interface CreateFieldOptions {
  name: string;
  identifier?: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  defaultValue?: any;
  validations?: Record<string, any>;
  options?: Record<string, any>;
  description?: string;
  displayName?: string;
  helpText?: string;
  sortOrder?: number;
}

export interface CreateRelationshipOptions {
  sourceTableId: string;
  targetTableId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  sourceField: string;
  targetField: string;
  name?: string;
  description?: string;
  options?: Record<string, any>;
}

export interface CreateIndexOptions {
  name: string;
  fields: string[];
  unique?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ConflictResolutionStrategy = 'last-write-wins' | 'manual' | 'custom';

export interface SyncOperation {
  id: string;
  table: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  data?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  synced: boolean;
}