import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Table } from './Table';

@Entity('databases')
export class Database {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  thumbnail?: string;

  @Column('boolean', { default: false })
  isEncrypted!: boolean;

  @Column('text', { nullable: true })
  encryptionKey?: string;

  @OneToMany(() => Table, table => table.database, { cascade: true })
  tables!: Table[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
