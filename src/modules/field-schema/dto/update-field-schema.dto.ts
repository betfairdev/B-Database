import { PartialType } from '@nestjs/swagger';
import { CreateFieldSchemaDto } from './create-field-schema.dto';

export class UpdateFieldSchemaDto extends PartialType(CreateFieldSchemaDto) {}