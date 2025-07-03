import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TableSchema } from './table-schema.entity';
import { User } from './user.entity';
import { DataHistory } from './data-history.entity';

@Entity('data_rows')
export class DataRow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tableId: string;

  @Column('json')
  payload: Record<string, any>;

  @Column('uuid')
  ownerId: string;

  @Column('json', { nullable: true })
  versionVector: Record<string, number>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => TableSchema, (table) => table.dataRows)
  @JoinColumn({ name: 'tableId' })
  table: TableSchema;

  @ManyToOne(() => User, (user) => user.dataRows)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => DataHistory, (history) => history.dataRow)
  history: DataHistory[];
}