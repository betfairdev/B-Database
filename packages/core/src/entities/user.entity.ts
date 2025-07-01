import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { AuditableEntity } from './base.entity.js';
import { Tenant } from './tenant.entity.js';
import { UserRole } from './user-role.entity.js';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

/**
 * User entity representing platform users
 */
@Entity('users')
@Index(['email'])
@Index(['tenantId', 'email'], { unique: true })
@Index(['status'])
export class User extends AuditableEntity {
  /**
   * User's email address (unique within tenant)
   */
  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  email!: string;

  /**
   * User's first name
   */
  @Column({ type: 'varchar', length: 100 })
  @IsString()
  firstName!: string;

  /**
   * User's last name
   */
  @Column({ type: 'varchar', length: 100 })
  @IsString()
  lastName!: string;

  /**
   * User's display name
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  /**
   * User's avatar URL
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  /**
   * User's current status
   */
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  @IsEnum(UserStatus)
  status!: UserStatus;

  /**
   * Whether the user's email is verified
   */
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isEmailVerified!: boolean;

  /**
   * User's timezone
   */
  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  @IsString()
  timezone!: string;

  /**
   * User's locale/language preference
   */
  @Column({ type: 'varchar', length: 10, default: 'en-US' })
  @IsString()
  locale!: string;

  /**
   * User preferences as JSON
   */
  @Column({ type: 'jsonb', default: {} })
  preferences!: Record<string, any>;

  /**
   * Last login timestamp
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  /**
   * Associated tenant
   */
  @ManyToOne(() => Tenant, tenant => tenant.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId', referencedColumnName: 'id' })
  tenant!: Tenant;

  /**
   * User roles
   */
  @OneToMany(() => UserRole, userRole => userRole.user)
  roles!: UserRole[];

  /**
   * Get user's full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Get effective display name
   */
  get effectiveDisplayName(): string {
    return this.displayName || this.fullName;
  }
}