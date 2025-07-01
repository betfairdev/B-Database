import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@metadata-platform/core';

export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity('sync_events')
@Index(['tenantId', 'createdAt'])
@Index(['entityType', 'entityId'])
export class SyncEvent extends BaseEntity {
  @Column({ type: 'enum', enum: SyncOperation })
  @ApiProperty({ enum: SyncOperation, description: 'Type of sync operation' })
  operation!: SyncOperation;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'Type of entity being synced' })
  entityType!: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'ID of the entity being synced' })
  entityId!: string;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: 'Entity data' })
  data!: any;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'User who performed the operation' })
  userId!: string;

  @Column({ type: 'integer', default: 1 })
  @ApiProperty({ description: 'Entity version' })
  version!: number;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: any;
}