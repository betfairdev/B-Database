import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableSchema } from '../../entities/table-schema.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { TableSchemaService } from './table-schema.service';
import { TableSchemaController } from './table-schema.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableSchema, WorkspaceUserRole]),
    AuthModule,
  ],
  providers: [TableSchemaService],
  controllers: [TableSchemaController],
  exports: [TableSchemaService],
})
export class TableSchemaModule {}