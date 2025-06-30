import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Table } from './Table';

@Entity('records')
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  data!: string;

  @Column('integer', { default: 1 })
  version!: number;

  @Column('text')
  tableId!: string;

  @ManyToOne(() => Table, table => table.records, { onDelete: 'CASCADE' })
  table!: Table;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}