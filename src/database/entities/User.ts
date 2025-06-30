import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', { unique: true })
  deviceId!: string;

  @Column('text', { nullable: true })
  pinHash?: string;

  @Column('boolean', { default: false })
  biometricEnabled!: boolean;

  @Column('text', { default: 'free' })
  subscriptionPlan!: string;

  @Column('text', { nullable: true })
  settings?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}