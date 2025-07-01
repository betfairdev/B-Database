import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { AuditableEntity } from './base.entity.js';
import { Tenant } from './tenant.entity.js';
import { DataTable } from './data-table.entity.js';

export enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  WEBHOOK = 'webhook',
  STREAM = 'stream',
}

export enum DataSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing',
}

/**
 * Data source entity representing external data connections
 */
@Entity('data_sources')
@Index(['tenantId', 'name'])
@Index(['type'])
@Index(['status'])
export class DataSource extends AuditableEntity {
  /**
   * Data source name
   */
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  name!: string;

  /**
   * Data source description
   */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Type of data source
   */
  @Column({ type: 'enum', enum: DataSourceType })
  @IsEnum(DataSourceType)
  type!: DataSourceType;

  /**
   * Current status of the data source
   */
  @Column({ type: 'enum', enum: DataSourceStatus, default: DataSourceStatus.INACTIVE })
  @IsEnum(DataSourceStatus)
  status!: DataSourceStatus;

  /**
   * Connection configuration (encrypted)
   */
  @Column({ type: 'jsonb' })
  @IsObject()
  connectionConfig!: Record<string, any>;

  /**
   * Sync configuration
   */
  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  syncConfig!: Record<string, any>;

  /**
   * Whether auto-sync is enabled
   */
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  autoSyncEnabled!: boolean;

  /**
   * Sync interval in minutes
   */
  @Column({ type: 'integer', nullable: true })
  syncIntervalMinutes?: number;

  /**
   * Last sync timestamp
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastSyncAt?: Date;

  /**
   * Last successful sync timestamp
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastSuccessfulSyncAt?: Date;

  /**
   * Last sync error message
   */
  @Column({ type: 'text', nullable: true })
  lastSyncError?: string;

  /**
   * Associated tenant
   */
  @ManyToOne(() => Tenant, tenant => tenant.dataSources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId', referencedColumnName: 'id' })
  tenant!: Tenant;

  /**
   * Data tables from this source
   */
  @OneToMany(() => DataTable, dataTable => dataTable.dataSource)
  tables!: DataTable[];
}