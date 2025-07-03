import { IsString, IsArray, IsObject, IsEnum, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncOperation } from '../../../common/enums/sync-operation.enum';

export class SyncChangeDto {
  @ApiProperty()
  @IsString()
  tableId: string;

  @ApiProperty()
  @IsString()
  rowId: string;

  @ApiProperty({ enum: SyncOperation })
  @IsEnum(SyncOperation)
  operation: SyncOperation;

  @ApiProperty()
  @IsObject()
  payload: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  versionVector?: Record<string, number>;
}

export class PushSyncDto {
  @ApiProperty()
  @IsString()
  workspaceId: string;

  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastSyncAt?: string;

  @ApiProperty({ type: [SyncChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncChangeDto)
  changes: SyncChangeDto[];
}