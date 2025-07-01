import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsBoolean, IsObject, IsNumber, IsEnum } from 'class-validator';
import { AuditableEntity } from './base.entity.js';
import { DataTable } from './data-table.entity.js';

export enum FieldDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  JSON = 'json',
  ARRAY = 'array',
  UUID = 'uuid',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  TEXT = 'text',
  ENCRYPTED = 'encrypted',
}

/**
 * Data field entity representing table columns/fields
 */
@Entity('data_fields')
@Index(['dataTableId', 'name'])
@Index(['tenantId'])
@Index(['dataType'])
export class DataField extends AuditableEntity {
  /**
   * Field name
   */
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  name!: string;

  /**
   * Display name for the field
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  /**
   * Field description
   */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Data type of the field
   */
  @Column({ type: 'enum', enum: FieldDataType })
  @IsEnum(FieldDataType)
  dataType!: FieldDataType;

  /**
   * Whether the field is required
   */
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isRequired!: boolean;

  /**
   * Whether the field is unique
   */
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isUnique!: boolean;

  /**
   * Whether the field is indexed
   */
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isIndexed!: boolean;

  /**
   * Whether the field is a primary key
   */
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrimaryKey!: boolean;

  /**
   * Default value for the field
   */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  /**
   * Field constraints and validation rules
   */
  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  constraints!: Record<string, any>;

  /**
   * Field metadata and settings
   */
  @Column({ type: 'jsonb', default: {} })
  @IsObject()
  metadata!: Record<string, any>;

  /**
   * Field order within the table
   */
  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  sortOrder!: number;

  /**
   * Data table reference
   */
  @Column({ type: 'uuid' })
  dataTableId!: string;

  /**
   * Associated data table
   */
  @ManyToOne(() => DataTable, dataTable => dataTable.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dataTableId', referencedColumnName: 'id' })
  dataTable!: DataTable;
}