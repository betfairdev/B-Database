import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore'
}

@Entity('change_log')
@Index(['table', 'recordId'])
@Index(['timestamp'])
export class ChangeLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  table!: string;

  @Column({ type: 'varchar', length: 255 })
  recordId!: string;

  @Column({ type: 'enum', enum: OperationType })
  operation!: OperationType;

  @Column({ type: 'simple-json', nullable: true })
  diff?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  oldData?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  newData?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}