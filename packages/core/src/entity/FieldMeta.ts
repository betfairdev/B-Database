import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { TableMeta } from './TableMeta';

@Entity('field_meta')
export class FieldMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tableId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  identifier!: string;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column({ type: 'text', nullable: true })
  defaultValue?: string;

  @Column({ type: 'boolean', default: false })
  required!: boolean;

  @Column({ type: 'boolean', default: false })
  unique!: boolean;

  @Column({ type: 'boolean', default: false })
  indexed!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  validations?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  options?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  helpText?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => TableMeta, table => table.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tableId' })
  table!: TableMeta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}