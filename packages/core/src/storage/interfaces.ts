/**
 * Storage adapter interface for abstracting data persistence
 */
export interface IStorageAdapter {
  /**
   * Initialize the storage adapter
   */
  initialize(): Promise<void>;

  /**
   * Store data with a key
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Retrieve data by key
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Delete data by key
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Clear all data
   */
  clear(): Promise<void>;

  /**
   * Get all keys matching pattern
   */
  keys(pattern?: string): Promise<string[]>;

  /**
   * Get multiple values by keys
   */
  mget<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Set multiple key-value pairs
   */
  mset<T>(entries: Array<[string, T]>, ttl?: number): Promise<void>;

  /**
   * Increment numeric value
   */
  increment(key: string, by?: number): Promise<number>;

  /**
   * Decrement numeric value
   */
  decrement(key: string, by?: number): Promise<number>;

  /**
   * Close storage connection
   */
  close(): Promise<void>;
}

/**
 * Query builder interface for complex queries
 */
export interface IQueryBuilder<T> {
  /**
   * Add where condition
   */
  where(field: string, operator: string, value: any): IQueryBuilder<T>;

  /**
   * Add AND where condition
   */
  andWhere(field: string, operator: string, value: any): IQueryBuilder<T>;

  /**
   * Add OR where condition
   */
  orWhere(field: string, operator: string, value: any): IQueryBuilder<T>;

  /**
   * Add order by clause
   */
  orderBy(field: string, direction?: 'ASC' | 'DESC'): IQueryBuilder<T>;

  /**
   * Set limit
   */
  limit(count: number): IQueryBuilder<T>;

  /**
   * Set offset
   */
  offset(count: number): IQueryBuilder<T>;

  /**
   * Execute query and return results
   */
  execute(): Promise<T[]>;

  /**
   * Execute query and return first result
   */
  first(): Promise<T | null>;

  /**
   * Execute query and return count
   */
  count(): Promise<number>;
}

/**
 * Repository interface for entity operations
 */
export interface IRepository<T> {
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find entities by criteria
   */
  find(criteria?: Partial<T>): Promise<T[]>;

  /**
   * Find one entity by criteria
   */
  findOne(criteria: Partial<T>): Promise<T | null>;

  /**
   * Create new entity
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update entity
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete entity
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count entities
   */
  count(criteria?: Partial<T>): Promise<number>;

  /**
   * Check if entity exists
   */
  exists(criteria: Partial<T>): Promise<boolean>;

  /**
   * Get query builder
   */
  query(): IQueryBuilder<T>;

  /**
   * Bulk insert entities
   */
  bulkInsert(entities: Partial<T>[]): Promise<T[]>;

  /**
   * Bulk update entities
   */
  bulkUpdate(criteria: Partial<T>, data: Partial<T>): Promise<number>;

  /**
   * Bulk delete entities
   */
  bulkDelete(criteria: Partial<T>): Promise<number>;
}