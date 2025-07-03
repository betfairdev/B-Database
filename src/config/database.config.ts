import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbType = this.configService.get<string>('DB_TYPE', 'postgres');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    const baseOptions: Partial<TypeOrmModuleOptions> = {
      synchronize: nodeEnv === 'development',
      logging: nodeEnv === 'development',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      subscribers: [__dirname + '/../**/*.subscriber{.ts,.js}'],
    };

    switch (dbType) {
      case 'postgres':
        return {
          ...baseOptions,
          type: 'postgres',
          host: this.configService.get<string>('DB_HOST'),
          port: this.configService.get<number>('DB_PORT'),
          username: this.configService.get<string>('DB_USER'),
          password: this.configService.get<string>('DB_PASS'),
          database: this.configService.get<string>('DB_NAME'),
        };

      case 'mysql':
        return {
          ...baseOptions,
          type: 'mysql',
          host: this.configService.get<string>('DB_HOST'),
          port: this.configService.get<number>('DB_PORT'),
          username: this.configService.get<string>('DB_USER'),
          password: this.configService.get<string>('DB_PASS'),
          database: this.configService.get<string>('DB_NAME'),
        };

      case 'mariadb':
        return {
          ...baseOptions,
          type: 'mariadb',
          host: this.configService.get<string>('DB_HOST'),
          port: this.configService.get<number>('DB_PORT'),
          username: this.configService.get<string>('DB_USER'),
          password: this.configService.get<string>('DB_PASS'),
          database: this.configService.get<string>('DB_NAME'),
        };

      case 'mssql':
        return {
          ...baseOptions,
          type: 'mssql',
          host: this.configService.get<string>('DB_HOST'),
          port: this.configService.get<number>('DB_PORT'),
          username: this.configService.get<string>('DB_USER'),
          password: this.configService.get<string>('DB_PASS'),
          database: this.configService.get<string>('DB_NAME'),
          options: {
            encrypt: false,
          },
        };

      case 'oracle':
        return {
          ...baseOptions,
          type: 'oracle',
          host: this.configService.get<string>('DB_HOST'),
          port: this.configService.get<number>('DB_PORT'),
          username: this.configService.get<string>('DB_USER'),
          password: this.configService.get<string>('DB_PASS'),
          sid: this.configService.get<string>('DB_NAME'),
        };

      case 'cockroachdb':
        return {
          ...baseOptions,
          type: 'cockroachdb',
          host: this.configService.get<string>('DB_HOST'),
          port: this.configService.get<number>('DB_PORT'),
          username: this.configService.get<string>('DB_USER'),
          password: this.configService.get<string>('DB_PASS'),
          database: this.configService.get<string>('DB_NAME'),
        };

      case 'sqlite':
        return {
          ...baseOptions,
          type: 'sqlite',
          database: this.configService.get<string>('DB_PATH', './database.sqlite'),
        };

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}

// Export DataSource for migrations
export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any || 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
} as DataSourceOptions);