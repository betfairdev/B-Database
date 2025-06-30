import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Table } from './Table';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  type!: string;

  @Column('boolean', { default: false })
  isRequired!: boolean;

  @Column('boolean', { default: false })
  isPrimary!: boolean;

  @Column('boolean', { default: false })
  isUnique!: boolean;

  @Column('text', { nullable: true })
  defaultValue?: string;

  @Column('text', { nullable: true })
  validation?: string;

  @Column('text', { nullable: true })
  options?: string;

  @Column('integer', { default: 1 })
  position!: number;

  @Column('text')
  tableId!: string;

  @ManyToOne(() => Table, table => table.fields, { onDelete: 'CASCADE' })
  table!: Table;
}