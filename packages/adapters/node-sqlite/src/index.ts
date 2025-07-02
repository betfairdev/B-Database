import { DataSourceOptions } from 'typeorm';
import { DBManagerConfig } from '@dbmanager/core';

export function createSQLiteConfig(databasePath: string): Partial<DBManagerConfig> {
  return {
    connection: {
      type: 'sqlite',
      database: databasePath,
      synchronize: true,
      logging: false,
      entities: []
    } as DataSourceOptions
  };
}

export function createInMemorySQLiteConfig(): Partial<DBManagerConfig> {
  return {
    connection: {
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: []
    } as DataSourceOptions
  };
}