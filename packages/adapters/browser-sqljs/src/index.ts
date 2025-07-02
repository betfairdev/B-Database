import { DataSourceOptions } from 'typeorm';
import { DBManagerConfig } from '@dbmanager/core';

export function createSQLJSConfig(): Partial<DBManagerConfig> {
  return {
    connection: {
      type: 'sqljs',
      location: 'database.sqlite',
      autoSave: true,
      autoSaveInterval: 1000,
      synchronize: true,
      logging: false
    } as DataSourceOptions
  };
}

export function createSQLJSInMemoryConfig(): Partial<DBManagerConfig> {
  return {
    connection: {
      type: 'sqljs',
      synchronize: true,
      logging: false
    } as DataSourceOptions
  };
}