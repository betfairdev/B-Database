import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorkspaceUserRole } from './workspace-user-role.entity';
import { TableSchema } from './table-schema.entity';
import { SyncLog } from './sync-log.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column('uuid')
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.ownedWorkspaces)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => WorkspaceUserRole, (role) => role.workspace)
  userRoles: WorkspaceUserRole[];

  @OneToMany(() => TableSchema, (table) => table.workspace)
  tables: TableSchema[];

  @OneToMany(() => SyncLog, (syncLog) => syncLog.workspace)
  syncLogs: SyncLog[];
}