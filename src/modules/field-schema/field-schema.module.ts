import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldSchema } from '../../entities/field-schema.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { FieldSchemaService } from './field-schema.service';
import { FieldSchemaController } from './field-schema.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldSchema, WorkspaceUserRole]),
    AuthModule,
  ],
  providers: [FieldSchemaService],
  controllers: [FieldSchemaController],
  exports: [FieldSchemaService],
})
export class FieldSchemaModule {}