import { Module } from '@nestjs/common';
import { TableSchemaService } from './table-schema.service';
import { TableSchemaController } from './table-schema.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TableSchemaService],
  controllers: [TableSchemaController],
  exports: [TableSchemaService],
})
export class TableSchemaModule {}