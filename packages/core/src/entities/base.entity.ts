import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Column,
  Index,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';
import { IsString, IsDate, IsNumber, IsUUID } from 'class-validator';
import { IPlatformEntity, IAuditInfo } from '../types/common.js';

/**
 * Base entity class that all platform entities extend
 * Provides common fields for tracking, versioning, and multi-tenancy
 */
export abstract class BaseEntity extends TypeOrmBaseEntity implements IPlatformEntity {
  /**
   * Primary identifier for the entity
   */
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id!: string;

  /**
   * Timestamp when the entity was created
   */
  @CreateDateColumn({ type: 'timestamptz' })
  @IsDate()
  createdAt!: Date;

  /**
   * Timestamp when the entity was last updated
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  @IsDate()
  updatedAt!: Date;

  /**
   * Version number for optimistic locking
   */
  @VersionColumn()
  @IsNumber()
  version!: number;

  /**
   * Tenant identifier for multi-tenancy support
   */
  @Column({ type: 'uuid' })
  @Index()
  @IsUUID()
  tenantId!: string;
}

/**
 * Base auditable entity that includes user tracking
 */
export abstract class AuditableEntity extends BaseEntity implements IAuditInfo {
  /**
   * User who created this entity
   */
  @Column({ type: 'uuid' })
  @IsUUID()
  createdBy!: string;

  /**
   * User who last updated this entity
   */
  @Column({ type: 'uuid' })
  @IsUUID()
  updatedBy!: string;

  /**
   * User who deleted this entity (soft delete)
   */
  @Column({ type: 'uuid', nullable: true })
  @IsUUID()
  deletedBy?: string;

  /**
   * Timestamp when the entity was soft deleted
   */
  @Column({ type: 'timestamptz', nullable: true })
  @IsDate()
  deletedAt?: Date;

  /**
   * Whether the entity is deleted (soft delete flag)
   */
  @Column({ type: 'boolean', default: false })
  @Index()
  isDeleted!: boolean;
}