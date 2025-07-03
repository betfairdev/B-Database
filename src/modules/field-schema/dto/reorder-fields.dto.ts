import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class FieldOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;
}

export class ReorderFieldsDto {
  @ApiProperty({ type: [FieldOrderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOrderDto)
  fields: FieldOrderDto[];
}