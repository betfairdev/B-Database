import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1700000000001 implements MigrationInterface {
  name = 'AddIndexes1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add performance indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_data_rows_payload_gin" ON "data_rows" USING gin ("payload")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sync_logs_workspace_timestamp" ON "sync_logs" ("workspaceId", "timestamp")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sync_logs_client_timestamp" ON "sync_logs" ("clientId", "timestamp")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_data_rows_table_updated" ON "data_rows" ("tableId", "updatedAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_field_schemas_table_order" ON "field_schemas" ("tableId", "order")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_data_rows_payload_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sync_logs_workspace_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sync_logs_client_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_data_rows_table_updated"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_field_schemas_table_order"`);
  }
}