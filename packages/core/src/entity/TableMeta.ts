import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { DatabaseMeta } from './DatabaseMeta';
import { FieldMeta } from './FieldMeta';
import { RelationshipMeta } from './RelationshipMeta';

@Entity('table_meta')
export class TableMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  dbId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  identifier!: string;

  @Column({ type: 'text', nullable: true })
  thumbnail?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  settings?: Record<string, any>;

  @ManyToOne(() => DatabaseMeta, database => database.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dbId' })
  database!: DatabaseMeta;

  @OneToMany(() => FieldMeta, field => field.table, { cascade: true })
  fields!: FieldMeta[];

  @OneToMany(() => RelationshipMeta, relationship => relationship.sourceTable)
  sourceRelationships!: RelationshipMeta[];

  @OneToMany(() => RelationshipMeta, relationship => relationship.targetTable)
  targetRelationships!: RelationshipMeta[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'simple-json', nullable: true })
  indexes?: Array<{ name: string; fields: string[]; unique?: boolean }>;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}