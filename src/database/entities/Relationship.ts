import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Table } from './Table';

@Entity('relationships')
export class Relationship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  type!: string;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text')
  sourceTableId!: string;

  @Column('text')
  targetTableId!: string;

  @Column('text')
  sourceFieldId!: string;

  @Column('text')
  targetFieldId!: string;

  @Column('text', { nullable: true })
  junctionTableId?: string;

  @Column('boolean', { default: false })
  isRequired!: boolean;

  @Column('text', { default: 'CASCADE' })
  onDelete!: string;

  @Column('text', { default: 'CASCADE' })
  onUpdate!: string;

  @ManyToOne(() => Table, { onDelete: 'CASCADE' })
  sourceTable!: Table;

  @ManyToOne(() => Table, { onDelete: 'CASCADE' })
  targetTable!: Table;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}