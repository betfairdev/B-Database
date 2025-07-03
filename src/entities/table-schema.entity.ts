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
import { Workspace } from './workspace.entity';
import { FieldSchema } from './field-schema.entity';
import { DataRow } from './data-row.entity';
import { Relationship } from './relationship.entity';

@Entity('table_schemas')
export class TableSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column('uuid')
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.tables)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @OneToMany(() => FieldSchema, (field) => field.table)
  fields: FieldSchema[];

  @OneToMany(() => DataRow, (dataRow) => dataRow.table)
  dataRows: DataRow[];

  @OneToMany(() => Relationship, (relationship) => relationship.sourceTable)
  sourceRelationships: Relationship[];

  @OneToMany(() => Relationship, (relationship) => relationship.destinationTable)
  destinationRelationships: Relationship[];
}