// src/dbconfig.ts
import "reflect-metadata";
import { DataSource, DataSourceOptions, Repository, ObjectLiteral } from "typeorm";
import { join } from "path";

// Read common env vars
const DB_TYPE = (process.env.DB_TYPE as DataSourceOptions["type"]) || "postgres";
const SYNC = process.env.TYPEORM_SYNC === "true";
const LOGGING = process.env.TYPEORM_LOGGING === "true";
const ENV = process.env.NODE_ENV || "development";

// Assemble driver‑specific options
let driverOptions: Partial<DataSourceOptions> = {};

switch (DB_TYPE) {
  case "sqlite":
  case "better-sqlite3":
    {
      const dbPath = process.env.DB_PATH || join(__dirname, "../database.sqlite");
      driverOptions = {
        type: DB_TYPE,
        database: dbPath,
      } as Partial<DataSourceOptions>;
    }
    break;
  case "mysql":
  case "mariadb":
  case "postgres":
  case "cockroachdb":
  case "mssql":
  case "oracle":
    driverOptions = {
      type: DB_TYPE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : undefined,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    } as Partial<DataSourceOptions>;
    break;
  case "sqljs":
    driverOptions = {
      type: "sqljs",
      location: process.env.DB_PATH || "database.sqlite",
      autoSave: true,
      autoSaveInterval: 1000,
    } as Partial<DataSourceOptions>;
    break;
  default:
    throw new Error(`Unsupported DB_TYPE: ${DB_TYPE}`);
}

// Common TypeORM options
const commonOptions: Partial<DataSourceOptions> = {
  synchronize: SYNC,
  logging: LOGGING,
  entities: [
    join(__dirname,
      ENV === "production"
        ? "entities/*.js"
        : "entities/*.ts"
    ),
  ],
  migrations: [
    join(__dirname,
      ENV === "production"
        ? "migrations/*.js"
        : "migrations/*.ts"
    ),
  ],
  subscribers: [
    join(__dirname,
      ENV === "production"
        ? "subscribers/*.js"
        : "subscribers/*.ts"
    ),
  ],
};

// Merge into full DataSourceOptions
const dataSourceOptions = {
  ...driverOptions,
  ...commonOptions,
} as DataSourceOptions;

// Export the DataSource
export const AppDataSource = new DataSource(dataSourceOptions);

// Initialization guard
let initialized = false;
export async function initializeDatabase(): Promise<void> {
  if (initialized) return;
  try {
    await AppDataSource.initialize();
    initialized = true;
    console.log(`✅ Database connected (${DB_TYPE})`);
  } catch (err) {
    console.error("🚨 Database initialization error:", err);
    throw err;
  }
}

// Generic repository accessor
export function getRepository<T extends ObjectLiteral>(entity: { new (): T }): Repository<T> {
  if (!initialized) {
    throw new Error("DataSource not initialized. Call initializeDatabase() first.");
  }
  return AppDataSource.getRepository(entity);
}

// Close connection
export async function closeDatabase(): Promise<void> {
  if (!initialized) return;
  await AppDataSource.destroy();
  initialized = false;
  console.log("🔒 Database connection closed");
}