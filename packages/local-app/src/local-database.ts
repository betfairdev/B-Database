import { DataSource, DataSourceOptions } from 'typeorm';
import { Database } from 'better-sqlite3';
import * as path from 'path';
import { Logger } from './utils/logger.js';
import {
  Tenant,
  User,
  DataSource as DataSourceEntity,
  DataTable,
  DataField,
} from '@metadata-platform/core';

export class LocalDatabase {
  private dataSource: DataSource | null = null;
  private sqlite: Database | null = null;
  private readonly logger = new Logger('LocalDatabase');

  constructor(private dbPath: string) {
    this.ensureDbDirectory();
  }

  async initialize(): Promise<void> {
    try {
      const options: DataSourceOptions = {
        type: 'better-sqlite3',
        database: this.dbPath,
        entities: [
          Tenant,
          User,
          DataSourceEntity,
          DataTable,
          DataField,
        ],
        synchronize: true,
        logging: false,
        migrations: [],
      };

      this.dataSource = new DataSource(options);
      await this.dataSource.initialize();

      this.logger.info(`Local database initialized at ${this.dbPath}`);
      
      // Run initial setup
      await this.setupDatabase();
      
    } catch (error) {
      this.logger.error('Failed to initialize local database:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
    }
    
    if (this.sqlite) {
      this.sqlite.close();
      this.sqlite = null;
    }
    
    this.logger.info('Local database closed');
  }

  getDataSource(): DataSource {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.dataSource;
  }

  async vacuum(): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      await this.dataSource.query('VACUUM');
      this.logger.info('Database vacuum completed');
    } catch (error) {
      this.logger.error('Database vacuum failed:', error);
      throw error;
    }
  }

  async getSize(): Promise<number> {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(this.dbPath);
      return stats.size;
    } catch (error) {
      this.logger.error('Failed to get database size:', error);
      return 0;
    }
  }

  async backup(backupPath: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.copyFile(this.dbPath, backupPath);
      this.logger.info(`Database backed up to ${backupPath}`);
    } catch (error) {
      this.logger.error('Database backup failed:', error);
      throw error;
    }
  }

  async restore(backupPath: string): Promise<void> {
    try {
      await this.close();
      
      const fs = await import('fs/promises');
      await fs.copyFile(backupPath, this.dbPath);
      
      await this.initialize();
      this.logger.info(`Database restored from ${backupPath}`);
    } catch (error) {
      this.logger.error('Database restore failed:', error);
      throw error;
    }
  }

  async executeRawQuery(query: string, parameters?: any[]): Promise<any> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      return await this.dataSource.query(query, parameters);
    } catch (error) {
      this.logger.error('Raw query execution failed:', error);
      throw error;
    }
  }

  async getTableInfo(tableName: string): Promise<any[]> {
    return this.executeRawQuery(`PRAGMA table_info(${tableName})`);
  }

  async getAllTables(): Promise<string[]> {
    const result = await this.executeRawQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    return result.map((row: any) => row.name);
  }

  private ensureDbDirectory(): void {
    try {
      const fs = require('fs');
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (error) {
      this.logger.error('Failed to create database directory:', error);
      throw error;
    }
  }

  private async setupDatabase(): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      return;
    }

    try {
      // Enable foreign keys
      await this.dataSource.query('PRAGMA foreign_keys = ON');
      
      // Set WAL mode for better concurrency
      await this.dataSource.query('PRAGMA journal_mode = WAL');
      
      // Optimize performance
      await this.dataSource.query('PRAGMA synchronous = NORMAL');
      await this.dataSource.query('PRAGMA cache_size = 10000');
      await this.dataSource.query('PRAGMA temp_store = MEMORY');
      
      this.logger.info('Database setup completed');
    } catch (error) {
      this.logger.error('Database setup failed:', error);
      throw error;
    }
  }
}