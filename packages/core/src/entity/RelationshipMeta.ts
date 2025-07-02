import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { TableMeta } from './TableMeta';

export enum RelationshipType {
  ONE_TO_ONE = 'one-to-one',
  ONE_TO_MANY = 'one-to-many',
  MANY_TO_ONE = 'many-to-one',
  MANY_TO_MANY = 'many-to-many'
}

@Entity('relationship_meta')
export class RelationshipMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sourceTableId!: string;

  @Column({ type: 'uuid' })
  targetTableId!: string;

  @Column({ type: 'enum', enum: RelationshipType })
  type!: RelationshipType;

  @Column({ type: 'varchar', length: 255 })
  sourceField!: string;

  @Column({ type: 'varchar', length: 255 })
  targetField!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  options?: Record<string, any>;

  @ManyToOne(() => TableMeta, table => table.sourceRelationships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceTableId' })
  sourceTable!: TableMeta;

  @ManyToOne(() => TableMeta, table => table.targetRelationships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetTableId' })
  targetTable!: TableMeta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}