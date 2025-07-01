import { Entity, Column, Index, OneToMany } from 'typeorm';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { AuditableEntity } from './base.entity.js';
import { User } from './user.entity.js';
import { DataSource } from './data-source.entity.js';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
}

export enum TenantTier {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

/**
 * Tenant entity representing an organization or workspace
 */
@Entity('tenants')
@Index(['name'])
@Index(['status'])
@Index(['tier'])
export class Tenant extends AuditableEntity {
  /**
   * Tenant name (organization name)
   */
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  name!: string;

  /**
   * Tenant slug for URL-friendly identification
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index({ unique: true })
  @IsString()
  slug!: string;

  /**
   * Primary contact email for the tenant
   */
  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  contactEmail!: string;

  /**
   * Tenant description
   */
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Current status of the tenant
   */
  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL })
  @IsEnum(TenantStatus)
  status!: TenantStatus;

  /**
   * Subscription tier
   */
  @Column({ type: 'enum', enum: TenantTier, default: TenantTier.FREE })
  @IsEnum(TenantTier)
  tier!: TenantTier;

  /**
   * Maximum number of users allowed
   */
  @Column({ type: 'integer', default: 5 })
  maxUsers!: number;

  /**
   * Maximum storage in bytes
   */
  @Column({ type: 'bigint', default: 1073741824 }) // 1GB default
  maxStorage!: number;

  /**
   * Custom domain for the tenant
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  customDomain?: string;

  /**
   * Tenant settings as JSON
   */
  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, any>;

  /**
   * Whether the tenant is enabled
   */
  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isEnabled!: boolean;

  /**
   * Trial expiration date
   */
  @Column({ type: 'timestamptz', nullable: true })
  trialExpiresAt?: Date;

  /**
   * Users belonging to this tenant
   */
  @OneToMany(() => User, user => user.tenant)
  users!: User[];

  /**
   * Data sources belonging to this tenant
   */
  @OneToMany(() => DataSource, dataSource => dataSource.tenant)
  dataSources!: DataSource[];
}