import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DataRow } from './data-row.entity';

@Entity('data_history')
export class DataHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  dataRowId: string;

  @Column('json')
  payload: Record<string, any>;

  @Column('json', { nullable: true })
  versionVector: Record<string, number>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => DataRow, (dataRow) => dataRow.history)
  @JoinColumn({ name: 'dataRowId' })
  dataRow: DataRow;
}