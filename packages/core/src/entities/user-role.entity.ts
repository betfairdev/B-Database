import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsUUID } from 'class-validator';
import { AuditableEntity } from './base.entity.js';
import { User } from './user.entity.js';

/**
 * User role entity for role-based access control
 */
@Entity('user_roles')
@Index(['userId', 'role'])
@Index(['tenantId', 'role'])
export class UserRole extends AuditableEntity {
  /**
   * Role name
   */
  @Column({ type: 'varchar', length: 100 })
  @IsString()
  role!: string;

  /**
   * Resource or scope the role applies to
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsString()
  resource?: string;

  /**
   * User reference
   */
  @Column({ type: 'uuid' })
  @IsUUID()
  userId!: string;

  /**
   * Associated user
   */
  @ManyToOne(() => User, user => user.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user!: User;
}