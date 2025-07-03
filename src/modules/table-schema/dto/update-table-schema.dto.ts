import { PartialType } from '@nestjs/swagger';
import { CreateTableSchemaDto } from './create-table-schema.dto';

export class UpdateTableSchemaDto extends PartialType(CreateTableSchemaDto) {}