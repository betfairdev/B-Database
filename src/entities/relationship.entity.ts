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
import { FieldSchema } from './field-schema.entity';
import { RelationshipType } from '../common/enums/relationship-type.enum';

@Entity('relationships')
export class Relationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sourceTableId: string;

  @Column('uuid')
  sourceFieldId: string;

  @Column('uuid')
  destinationTableId: string;

  @Column({
    type: 'simple-enum',
    enum: RelationshipType,
  })
  type: RelationshipType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TableSchema, (table) => table.sourceRelationships)
  @JoinColumn({ name: 'sourceTableId' })
  sourceTable: TableSchema;

  @ManyToOne(() => FieldSchema)
  @JoinColumn({ name: 'sourceFieldId' })
  sourceField: FieldSchema;

  @ManyToOne(() => TableSchema, (table) => table.destinationRelationships)
  @JoinColumn({ name: 'destinationTableId' })
  destinationTable: TableSchema;
}