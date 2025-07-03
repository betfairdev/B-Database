import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { TableSchemaModule } from './modules/table-schema/table-schema.module';
import { FieldSchemaModule } from './modules/field-schema/field-schema.module';
import { RelationshipModule } from './modules/relationship/relationship.module';
import { DataRowModule } from './modules/data-row/data-row.module';
import { SyncModule } from './modules/sync/sync.module';
import { FileModule } from './modules/file/file.module';
import { MinioModule } from './modules/minio/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    FirebaseModule,
    AuthModule,
    WorkspaceModule,
    TableSchemaModule,
    FieldSchemaModule,
    RelationshipModule,
    DataRowModule,
    SyncModule,
    FileModule,
    MinioModule,
  ],
})
export class AppModule {}