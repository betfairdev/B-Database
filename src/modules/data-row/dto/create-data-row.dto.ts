import { IsObject, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDataRowDto {
  @ApiProperty()
  @IsObject()
  payload: Record<string, any>;

  @IsOptional()
  @IsUUID()
  tableId?: string;
}