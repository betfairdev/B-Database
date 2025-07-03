import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { SyncOperation } from '../common/enums/sync-operation.enum';

@Entity('sync_logs')
export class SyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  workspaceId: string;

  @Column('uuid')
  tableId: string;

  @Column('uuid')
  rowId: string;

  @Column({
    type: 'enum',
    enum: SyncOperation,
  })
  operation: SyncOperation;

  @Column('json')
  payload: Record<string, any>;

  @Column()
  clientId: string;

  @Column('json', { nullable: true })
  versionVector: Record<string, number>;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.syncLogs)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}