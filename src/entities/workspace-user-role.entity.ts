import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';
import { Role } from '../common/enums/role.enum';

@Entity('workspace_user_roles')
@Unique(['userId', 'workspaceId'])
export class WorkspaceUserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  workspaceId: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.VIEWER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.workspaceRoles)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.userRoles)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}