import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { TableMeta } from './TableMeta';

@Entity('database_meta')
export class DatabaseMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  identifier!: string;

  @Column({ type: 'text', nullable: true })
  thumbnail?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  settings?: Record<string, any>;

  @OneToMany(() => TableMeta, table => table.database, { cascade: true })
  tables!: TableMeta[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'varchar', length: 100, default: '1.0.0' })
  version!: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}