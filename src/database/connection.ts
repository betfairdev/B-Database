/* eslint-disable @typescript-eslint/no-explicit-any */
// src/database/connection.ts

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { DataSource, type DataSourceOptions } from 'typeorm';
import initSqlJs from 'sql.js';

// ——— Your Entities ———
import { Database } from './entities/Database';
import { Table } from './entities/Table';
import { Field } from './entities/Field';
import { Record } from './entities/Record';
import { User } from './entities/User';
import { Relationship } from './entities/Relationship';

export const ENTITIES = [
  Database,
  Table,
  Field,
  Record,
  User,
  Relationship,
];

const DATABASE_NAME = 'app.db';

let sqliteConnection: SQLiteConnection | null = null;
export let AppDataSource: DataSource | null = null;

/**
 * Build DataSourceOptions for web via TypeORM `sqljs` driver.
 * Uses `location` + `autoSave` so SQL.js persists to IndexedDB.
 */
async function buildWebDataSourceOptions(): Promise<DataSourceOptions> {
  // Ensure the SQL.js WASM file is located (copy sql-wasm.wasm into public/)
  (window as any).SQLITE_WASM_PATH = '/node_modules/sql.js/dist/sql-wasm.wasm';

  // Initialize SQL.js
  const SQL = await initSqlJs({
    locateFile: () => (window as any).SQLITE_WASM_PATH,
  });

  return {
    type: 'sqljs',
    driver: SQL,
    // no manual `database:` entry here—TypeORM will open/create
    location: DATABASE_NAME,   // key in IndexedDB
    autoSave: true,            // persist on each transaction
    entities: ENTITIES,
    synchronize: true,
    logging: ['error', 'warn'],
  };
}

/**
 * Build DataSourceOptions for native via Capacitor SQLite plugin.
 */
async function buildNativeDataSourceOptions(): Promise<DataSourceOptions> {
  if (!sqliteConnection) {
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }
  return {
    type: 'capacitor',
    driver: sqliteConnection!,
    database: DATABASE_NAME,
    entities: ENTITIES,
    synchronize: true,
    logging: ['error', 'warn'],
  };
}

/**
 * Initialize and return the DataSource, choosing driver by platform.
 */
export async function initializeDatabase(): Promise<DataSource> {
  if (AppDataSource?.isInitialized) {
    return AppDataSource;
  }

  const platform = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
  let options: DataSourceOptions;

  if (platform === 'web') {
    options = await buildWebDataSourceOptions();
  } else {
    options = await buildNativeDataSourceOptions();

    // On native, open or create the SQLite database before TypeORM init
    try {
      await sqliteConnection!.createConnection(
        DATABASE_NAME,
        false,           // encrypted?
        'no-encryption', // encryption mode
        1,               // version
        false            // readonly
      );
    } catch {
      // ignore if it already exists
    }
  }

  AppDataSource = new DataSource(options);
  await AppDataSource.initialize();
  console.log(`✅ Database initialized on ${platform} using ${options.type}`);
  return AppDataSource;
}

/**
 * Get the initialized DataSource; throws if not yet initialized.
 */
export function getDataSource(): DataSource {
  if (!AppDataSource || !AppDataSource.isInitialized) {
    throw new Error('DataSource not initialized; call initializeDatabase() first.');
  }
  return AppDataSource;
}

/**
 * Export the entire DB schema + data as SQL.
 */
export async function exportDatabaseSQL(): Promise<string> {
  const ds = getDataSource();
  const sqliteDb = (ds.driver as any).database as any;

  const tables = ['databases', 'tables', 'fields', 'records', 'users', 'relationships'];
  let sql = '';

  for (const table of tables) {
    const schema = sqliteDb.exec(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`
    );
    if (schema[0]?.values?.[0]?.[0]) {
      sql += schema[0].values[0][0] + ';\n\n';
    }
    const rows = sqliteDb.exec(`SELECT * FROM ${table}`);
    if (rows[0]?.values?.length) {
      const cols = rows[0].columns;
      for (const row of rows[0].values) {
        const vals = row
          .map((v: any) =>
            v === null
              ? 'NULL'
              : typeof v === 'string'
              ? `'${v.replace(/'/g, "''")}'`
              : v
          )
          .join(', ');
        sql += `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals});\n`;
      }
      sql += '\n';
    }
  }

  return sql;
}

/**
 * Import SQL text into the DB—TypeORM/SQL.js will autoSave on web.
 */
export async function importDatabaseSQL(sqlContent: string): Promise<void> {
  const ds = getDataSource();
  const sqliteDb = (ds.driver as any).database as any;
  sqliteDb.exec(sqlContent);
  // No manual save needed on web (autoSave) or native (plugin handles it)
}
