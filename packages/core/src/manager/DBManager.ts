import { DataSource, Repository, EntitySchema } from 'typeorm';
import { DatabaseMeta } from '../entity/DatabaseMeta';
import { TableMeta } from '../entity/TableMeta';
import { FieldMeta } from '../entity/FieldMeta';
import { RelationshipMeta, RelationshipType } from '../entity/RelationshipMeta';
import { ChangeLog, OperationType } from '../entity/ChangeLog';
import { FileMeta } from '../entity/FileMeta';
import { FieldTypeRegistry } from '../services/FieldTypeRegistry';
import { FileManager } from '../services/FileManager';
import { ConflictService } from '../services/ConflictService';
import { DynamicEntityGenerator } from './DynamicEntityGenerator';
import { SyncEngine } from './SyncEngine';
import { 
  DBManagerConfig, 
  QueryOptions, 
  CreateTableOptions, 
  CreateFieldOptions,
  CreateRelationshipOptions,
  PaginatedResult,
  SyncReport 
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export class DBManager {
  private dataSource!: DataSource;
  private fieldRegistry: FieldTypeRegistry;
  private fileManager!: FileManager;
  private conflictService: ConflictService;
  private entityGenerator: DynamicEntityGenerator;
  private syncEngine!: SyncEngine;
  private dynamicEntities = new Map<string, EntitySchema>();

  // Repository caches
  private databaseRepo!: Repository<DatabaseMeta>;
  private tableRepo!: Repository<TableMeta>;
  private fieldRepo!: Repository<FieldMeta>;
  private relationshipRepo!: Repository<RelationshipMeta>;
  private changeLogRepo!: Repository<ChangeLog>;
  private fileMetaRepo!: Repository<FileMeta>;

  constructor(private config: DBManagerConfig) {
    this.fieldRegistry = new FieldTypeRegistry();
    this.conflictService = new ConflictService();
    this.entityGenerator = new DynamicEntityGenerator(this.fieldRegistry);
  }

  get fieldTypeRegistry(): FieldTypeRegistry {
    return this.fieldRegistry;
  }

  async initialize(): Promise<void> {
    // Initialize TypeORM DataSource
    this.dataSource = new DataSource({
      ...this.config.connection,
      entities: [
        DatabaseMeta,
        TableMeta,
        FieldMeta,
        RelationshipMeta,
        ChangeLog,
        FileMeta
      ],
      synchronize: true // Auto-create tables in development
    });

    await this.dataSource.initialize();

    // Initialize repositories
    this.databaseRepo = this.dataSource.getRepository(DatabaseMeta);
    this.tableRepo = this.dataSource.getRepository(TableMeta);
    this.fieldRepo = this.dataSource.getRepository(FieldMeta);
    this.relationshipRepo = this.dataSource.getRepository(RelationshipMeta);
    this.changeLogRepo = this.dataSource.getRepository(ChangeLog);
    this.fileMetaRepo = this.dataSource.getRepository(FileMeta);

    // Initialize services
    this.fileManager = new FileManager(
      this.config.fileManager || { storageAdapter: 'memory' },
      this.fileMetaRepo
    );

    if (this.config.sync?.enabled) {
      this.syncEngine = new SyncEngine(this.config, this.dataSource);
    }

    // Load existing tables and generate dynamic entities
    await this.loadDynamicEntities();
  }

  // Database Management
  async getDatabases(): Promise<DatabaseMeta[]> {
    return await this.databaseRepo.find({
      relations: ['tables'],
      order: { createdAt: 'DESC' }
    });
  }

  async createDatabase(name: string, description?: string): Promise<DatabaseMeta> {
    const database = this.databaseRepo.create({
      name,
      identifier: this.generateIdentifier(name),
      description
    });

    const saved = await this.databaseRepo.save(database);
    await this.logChange('database_meta', saved.id, 'create', saved);
    return saved;
  }

  // Table Management
  async getTables(dbId: string): Promise<TableMeta[]> {
    return await this.tableRepo.find({
      where: { dbId },
      relations: ['fields', 'sourceRelationships', 'targetRelationships'],
      order: { createdAt: 'DESC' }
    });
  }

  async createTable(options: CreateTableOptions): Promise<TableMeta> {
    const table = this.tableRepo.create({
      dbId: options.dbId,
      name: options.name,
      identifier: options.identifier || this.generateIdentifier(options.name),
      description: options.description
    });

    const savedTable = await this.tableRepo.save(table);

    // Create fields
    for (const fieldOptions of options.fields) {
      await this.createField(savedTable.id, fieldOptions);
    }

    // Generate dynamic entity
    await this.generateDynamicEntity(savedTable.id);

    await this.logChange('table_meta', savedTable.id, 'create', savedTable);
    return savedTable;
  }

  // Field Management
  async getFields(tableId: string): Promise<FieldMeta[]> {
    return await this.fieldRepo.find({
      where: { tableId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' }
    });
  }

  async createField(tableId: string, options: CreateFieldOptions): Promise<FieldMeta> {
    const field = this.fieldRepo.create({
      tableId,
      name: options.name,
      identifier: options.identifier || this.generateIdentifier(options.name),
      type: options.type,
      required: options.required || false,
      unique: options.unique || false,
      indexed: options.indexed || false,
      defaultValue: options.defaultValue,
      validations: options.validations,
      options: options.options,
      description: options.description,
      displayName: options.displayName,
      helpText: options.helpText,
      sortOrder: options.sortOrder || 0
    });

    const saved = await this.fieldRepo.save(field);
    
    // Regenerate dynamic entity for the table
    await this.generateDynamicEntity(tableId);
    
    await this.logChange('field_meta', saved.id, 'create', saved);
    return saved;
  }

  // Relationship Management
  async getRelationships(dbId: string): Promise<RelationshipMeta[]> {
    return await this.relationshipRepo.find({
      relations: ['sourceTable', 'targetTable'],
      where: [
        { sourceTable: { dbId } },
        { targetTable: { dbId } }
      ]
    });
  }

  async createRelationship(options: CreateRelationshipOptions): Promise<RelationshipMeta> {
    const relationship = this.relationshipRepo.create({
      sourceTableId: options.sourceTableId,
      targetTableId: options.targetTableId,
      type: options.type,
      sourceField: options.sourceField,
      targetField: options.targetField,
      name: options.name,
      description: options.description,
      options: options.options
    });

    const saved = await this.relationshipRepo.save(relationship);

    // Update field metadata to mark as foreign key if needed
    if (options.type === RelationshipType.MANY_TO_ONE) {
      const sourceField = await this.fieldRepo.findOne({
        where: { tableId: options.sourceTableId, identifier: options.sourceField }
      });
      if (sourceField) {
        sourceField.options = {
          ...sourceField.options,
          isRelationship: true,
          relationshipId: saved.id,
          targetTable: options.targetTableId
        };
        await this.fieldRepo.save(sourceField);
      }
    }

    // Regenerate dynamic entities for both tables
    await this.generateDynamicEntity(options.sourceTableId);
    await this.generateDynamicEntity(options.targetTableId);

    await this.logChange('relationship_meta', saved.id, 'create', saved);
    return saved;
  }

  // Record Management
  async createRecord(tableName: string, data: Record<string, any>): Promise<any> {
    const entity = this.dynamicEntities.get(tableName);
    if (!entity) {
      throw new Error(`Table ${tableName} not found`);
    }

    const repository = this.dataSource.getRepository(entity);
    const record = repository.create({ id: uuidv4(), ...data });
    const saved = await repository.save(record);

    await this.logChange(tableName, saved.id, 'create', saved);
    return saved;
  }

  async getRecords(tableName: string, options: QueryOptions = {}): Promise<PaginatedResult<any>> {
    const entity = this.dynamicEntities.get(tableName);
    if (!entity) {
      throw new Error(`Table ${tableName} not found`);
    }

    const repository = this.dataSource.getRepository(entity);
    const queryBuilder = repository.createQueryBuilder('record');

    // Apply soft delete filter
    if (!options.includeDeleted) {
      queryBuilder.where('record.deletedAt IS NULL');
    }

    // Apply where conditions
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        queryBuilder.andWhere(`record.${key} = :${key}`, { [key]: value });
      });
    }

    // Apply search
    if (options.search && options.searchFields) {
      const searchConditions = options.searchFields.map(field => 
        `record.${field} ILIKE :search`
      ).join(' OR ');
      queryBuilder.andWhere(`(${searchConditions})`, { search: `%${options.search}%` });
    }

    // Apply relations
    if (options.include) {
      options.include.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`record.${relation}`, relation);
      });
    }

    // Apply ordering
    if (options.orderBy) {
      Object.entries(options.orderBy).forEach(([field, direction]) => {
        queryBuilder.addOrderBy(`record.${field}`, direction);
      });
    } else {
      queryBuilder.orderBy('record.createdAt', 'DESC');
    }

    // Apply pagination
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    queryBuilder.limit(limit).offset(offset);

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      data: records,
      total,
      page,
      pageSize: limit,
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    };
  }

  async updateRecord(tableName: string, id: string, data: Record<string, any>): Promise<any> {
    const entity = this.dynamicEntities.get(tableName);
    if (!entity) {
      throw new Error(`Table ${tableName} not found`);
    }

    const repository = this.dataSource.getRepository(entity);
    const existing = await repository.findOne({ where: { id } });
    if (!existing) {
      throw new Error(`Record ${id} not found`);
    }

    // TypeORM handles updatedAt automatically with @UpdateDateColumn
    const updated = await repository.save({ ...existing, ...data });
    await this.logChange(tableName, id, 'update', updated, existing);
    return updated;
  }

  async deleteRecord(tableName: string, id: string, soft = true): Promise<boolean> {
    const entity = this.dynamicEntities.get(tableName);
    if (!entity) {
      throw new Error(`Table ${tableName} not found`);
    }

    const repository = this.dataSource.getRepository(entity);
    const record = await repository.findOne({ where: { id } });
    if (!record) {
      return false;
    }

    if (soft) {
      // TypeORM handles deletedAt automatically with @DeleteDateColumn
      await repository.softDelete(id);
      await this.logChange(tableName, id, 'delete', { ...record, deletedAt: new Date() }, record);
    } else {
      await repository.remove(record);
      await this.logChange(tableName, id, 'delete', null, record);
    }

    return true;
  }

  // History Management
  async getHistory(tableName: string, recordId: string): Promise<ChangeLog[]> {
    return await this.changeLogRepo.find({
      where: { table: tableName, recordId },
      order: { timestamp: 'DESC' },
      take: 10 // Last 10 operations
    });
  }

  // Sync Operations
  async sync(): Promise<SyncReport> {
    if (!this.syncEngine) {
      throw new Error('Sync is not enabled');
    }
    return await this.syncEngine.sync();
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.syncEngine) {
      return false;
    }
    return await this.syncEngine.checkForUpdates();
  }

  // File Operations
  async saveFile(file: Buffer | File, metadata: {
    originalName: string;
    mimeType: string;
    table?: string;
    recordId?: string;
    field?: string;
  }): Promise<FileMeta> {
    return await this.fileManager.save(file, metadata);
  }

  async getFile(fileId: string): Promise<{ file: Buffer; metadata: FileMeta } | null> {
    return await this.fileManager.get(fileId);
  }

  // Utility Methods
  private async loadDynamicEntities(): Promise<void> {
    const tables = await this.tableRepo.find({ relations: ['fields'] });
    
    for (const table of tables) {
      await this.generateDynamicEntity(table.id);
    }
  }

  private async generateDynamicEntity(tableId: string): Promise<void> {
    const table = await this.tableRepo.findOne({
      where: { id: tableId },
      relations: ['fields', 'sourceRelationships', 'targetRelationships']
    });

    if (!table) return;

    const entitySchema = this.entityGenerator.generateEntity(table);
    this.dynamicEntities.set(table.identifier, entitySchema);

    // Add to DataSource if not already added
    if (!this.dataSource.hasMetadata(entitySchema)) {
      this.dataSource.options.entities?.push(entitySchema);
    }
  }

  private generateIdentifier(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private async logChange(
    table: string, 
    recordId: string, 
    operation: OperationType, 
    newData?: any, 
    oldData?: any
  ): Promise<void> {
    if (!this.config.logging?.enableChangeLog) return;

    const changeLog = this.changeLogRepo.create({
      table,
      recordId,
      operation,
      newData,
      oldData,
      diff: this.calculateDiff(oldData, newData)
    });

    await this.changeLogRepo.save(changeLog);

    // Clean up old change logs if needed
    const maxEntries = this.config.logging?.maxChangeLogEntries || 100;
    const oldLogs = await this.changeLogRepo.find({
      where: { table, recordId },
      order: { timestamp: 'DESC' },
      skip: maxEntries
    });

    if (oldLogs.length > 0) {
      await this.changeLogRepo.remove(oldLogs);
    }
  }

  private calculateDiff(oldData: any, newData: any): Record<string, any> {
    if (!oldData || !newData) return {};

    const diff: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (oldData[key] !== newData[key]) {
        diff[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }

    return diff;
  }

  async close(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}