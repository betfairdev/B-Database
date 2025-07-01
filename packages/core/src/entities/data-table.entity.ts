import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsObject, IsNumber } from 'class-validator';
import { AuditableEntity } from './base.entity.js';
import { DataSource } from './data-source.entity.js';
import { DataField } from './data-field.entity.js';

/**
 * Data table entity representing logical tables/collections
 */
@Entity('data_tables')
@Index(['dataSourceId', 'name'])
@Index(['tenantId'])
export class DataTable extends AuditableEntity {
  /**
   * Table name
   */
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  name!: string;

  /**
   * Display name for the table
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  /**
   * Table description
   */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Table schema information
   */
  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  schema!: Record<string, any>;

  /**
   * Table configuration and settings
   */
  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  config!: Record<string, any>;

  /**
   * Whether the table is active
   */
  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive!: boolean;

  /**
   * Estimated row count
   */
  @Column({ type: 'bigint', default: 0 })
  @IsNumber()
  rowCount!: number;

  /**
   * Data source reference
   */
  @Column({ type: 'uuid' })
  dataSourceId!: string;

  /**
   * Associated data source
   */
  @ManyToOne(() => DataSource, dataSource => dataSource.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dataSourceId', referencedColumnName: 'id' })
  dataSource!: DataSource;

  /**
   * Fields in this table
   */
  @OneToMany(() => DataField, dataField => dataField.dataTable)
  fields!: DataField[];
}