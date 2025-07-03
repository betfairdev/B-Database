import { Module } from '@nestjs/common';
import { FieldSchemaService } from './field-schema.service';
import { FieldSchemaController } from './field-schema.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FieldSchemaService],
  controllers: [FieldSchemaController],
  exports: [FieldSchemaService],
})
export class FieldSchemaModule {}