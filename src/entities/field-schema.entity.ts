import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TableSchema } from './table-schema.entity';
import { FieldType } from '../common/enums/field-type.enum';

@Entity('field_schemas')
export class FieldSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column({
    type: 'simple-enum',
    enum: FieldType,
  })
  type: FieldType;

  @Column('json', { nullable: true })
  options: Record<string, any>;

  @Column('json', { nullable: true })
  validation: Record<string, any>;

  @Column({ default: 0 })
  order: number;

  @Column('uuid')
  tableId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TableSchema, (table) => table.fields)
  @JoinColumn({ name: 'tableId' })
  table: TableSchema;
}