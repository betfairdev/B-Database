import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Database } from './Database';
import { Field } from './Field';
import { Record } from './Record';
import { Relationship } from './Relationship';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  thumbnail?: string;

  @Column('text')
  databaseId!: string;

  @ManyToOne(() => Database, database => database.tables, { onDelete: 'CASCADE' })
  database!: Database;

  @OneToMany(() => Field, field => field.table, { cascade: true })
  fields!: Field[];

  @OneToMany(() => Record, record => record.table, { cascade: true })
  records!: Record[];

  @OneToMany(() => Relationship, relationship => relationship.sourceTable, { cascade: true })
  sourceRelationships!: Relationship[];

  @OneToMany(() => Relationship, relationship => relationship.targetTable, { cascade: true })
  targetRelationships!: Relationship[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}