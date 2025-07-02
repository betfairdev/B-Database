import { DataSourceOptions } from 'typeorm';
import { DBManagerConfig } from '@dbmanager/core';

export interface PostgreSQLConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export function createPostgreSQLConfig(config: PostgreSQLConfig): Partial<DBManagerConfig> {
  return {
    connection: {
      type: 'postgres',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl,
      synchronize: true,
      logging: false
    } as DataSourceOptions
  };
}