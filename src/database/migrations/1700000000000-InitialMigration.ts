import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firebaseUid" character varying NOT NULL,
        "email" character varying NOT NULL,
        "displayName" character varying,
        "photoURL" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_firebaseUid" UNIQUE ("firebaseUid"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Workspaces table
    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "thumbnailUrl" character varying,
        "ownerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_workspaces_id" PRIMARY KEY ("id")
      )
    `);

    // Workspace user roles table
    await queryRunner.query(`
      CREATE TYPE "workspace_user_roles_role_enum" AS ENUM('owner', 'editor', 'viewer');
      CREATE TABLE "workspace_user_roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "workspaceId" uuid NOT NULL,
        "role" "workspace_user_roles_role_enum" NOT NULL DEFAULT 'viewer',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_workspace_user_roles_userId_workspaceId" UNIQUE ("userId", "workspaceId"),
        CONSTRAINT "PK_workspace_user_roles_id" PRIMARY KEY ("id")
      )
    `);

    // Table schemas table
    await queryRunner.query(`
      CREATE TABLE "table_schemas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "thumbnailUrl" character varying,
        "workspaceId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_table_schemas_id" PRIMARY KEY ("id")
      )
    `);

    // Field schemas table
    await queryRunner.query(`
      CREATE TYPE "field_schemas_type_enum" AS ENUM('string', 'number', 'boolean', 'date', 'json', 'file', 'lookup', 'computed');
      CREATE TABLE "field_schemas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "type" "field_schemas_type_enum" NOT NULL,
        "options" json,
        "validation" json,
        "order" integer NOT NULL DEFAULT 0,
        "tableId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_field_schemas_id" PRIMARY KEY ("id")
      )
    `);

    // Relationships table
    await queryRunner.query(`
      CREATE TYPE "relationships_type_enum" AS ENUM('oneToOne', 'oneToMany', 'manyToOne', 'manyToMany');
      CREATE TABLE "relationships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sourceTableId" uuid NOT NULL,
        "sourceFieldId" uuid NOT NULL,
        "destinationTableId" uuid NOT NULL,
        "type" "relationships_type_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_relationships_id" PRIMARY KEY ("id")
      )
    `);

    // Data rows table
    await queryRunner.query(`
      CREATE TABLE "data_rows" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tableId" uuid NOT NULL,
        "payload" json NOT NULL,
        "ownerId" uuid NOT NULL,
        "versionVector" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_data_rows_id" PRIMARY KEY ("id")
      )
    `);

    // Data history table
    await queryRunner.query(`
      CREATE TABLE "data_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "dataRowId" uuid NOT NULL,
        "payload" json NOT NULL,
        "versionVector" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_data_history_id" PRIMARY KEY ("id")
      )
    `);

    // Sync logs table
    await queryRunner.query(`
      CREATE TYPE "sync_logs_operation_enum" AS ENUM('insert', 'update', 'softDelete', 'hardDelete');
      CREATE TABLE "sync_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "tableId" uuid NOT NULL,
        "rowId" uuid NOT NULL,
        "operation" "sync_logs_operation_enum" NOT NULL,
        "payload" json NOT NULL,
        "clientId" character varying NOT NULL,
        "versionVector" json,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sync_logs_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "workspaces" ADD CONSTRAINT "FK_workspaces_ownerId" 
      FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "workspace_user_roles" ADD CONSTRAINT "FK_workspace_user_roles_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "workspace_user_roles" ADD CONSTRAINT "FK_workspace_user_roles_workspaceId" 
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "table_schemas" ADD CONSTRAINT "FK_table_schemas_workspaceId" 
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "field_schemas" ADD CONSTRAINT "FK_field_schemas_tableId" 
      FOREIGN KEY ("tableId") REFERENCES "table_schemas"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "relationships" ADD CONSTRAINT "FK_relationships_sourceTableId" 
      FOREIGN KEY ("sourceTableId") REFERENCES "table_schemas"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "relationships" ADD CONSTRAINT "FK_relationships_sourceFieldId" 
      FOREIGN KEY ("sourceFieldId") REFERENCES "field_schemas"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "relationships" ADD CONSTRAINT "FK_relationships_destinationTableId" 
      FOREIGN KEY ("destinationTableId") REFERENCES "table_schemas"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "data_rows" ADD CONSTRAINT "FK_data_rows_tableId" 
      FOREIGN KEY ("tableId") REFERENCES "table_schemas"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "data_rows" ADD CONSTRAINT "FK_data_rows_ownerId" 
      FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "data_history" ADD CONSTRAINT "FK_data_history_dataRowId" 
      FOREIGN KEY ("dataRowId") REFERENCES "data_rows"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "sync_logs" ADD CONSTRAINT "FK_sync_logs_workspaceId" 
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_users_firebaseUid" ON "users" ("firebaseUid")`);
    await queryRunner.query(`CREATE INDEX "IDX_workspace_user_roles_userId" ON "workspace_user_roles" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_workspace_user_roles_workspaceId" ON "workspace_user_roles" ("workspaceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_table_schemas_workspaceId" ON "table_schemas" ("workspaceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_field_schemas_tableId" ON "field_schemas" ("tableId")`);
    await queryRunner.query(`CREATE INDEX "IDX_field_schemas_order" ON "field_schemas" ("tableId", "order")`);
    await queryRunner.query(`CREATE INDEX "IDX_data_rows_tableId" ON "data_rows" ("tableId")`);
    await queryRunner.query(`CREATE INDEX "IDX_data_rows_ownerId" ON "data_rows" ("ownerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_data_rows_deletedAt" ON "data_rows" ("deletedAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_data_history_dataRowId" ON "data_history" ("dataRowId")`);
    await queryRunner.query(`CREATE INDEX "IDX_sync_logs_workspaceId" ON "sync_logs" ("workspaceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_sync_logs_timestamp" ON "sync_logs" ("timestamp")`);
    await queryRunner.query(`CREATE INDEX "IDX_sync_logs_clientId" ON "sync_logs" ("clientId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "sync_logs"`);
    await queryRunner.query(`DROP TABLE "data_history"`);
    await queryRunner.query(`DROP TABLE "data_rows"`);
    await queryRunner.query(`DROP TABLE "relationships"`);
    await queryRunner.query(`DROP TABLE "field_schemas"`);
    await queryRunner.query(`DROP TABLE "table_schemas"`);
    await queryRunner.query(`DROP TABLE "workspace_user_roles"`);
    await queryRunner.query(`DROP TABLE "workspaces"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "sync_logs_operation_enum"`);
    await queryRunner.query(`DROP TYPE "relationships_type_enum"`);
    await queryRunner.query(`DROP TYPE "field_schemas_type_enum"`);
    await queryRunner.query(`DROP TYPE "workspace_user_roles_role_enum"`);
  }
}