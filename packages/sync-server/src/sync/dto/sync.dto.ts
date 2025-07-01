import { IsString, IsUUID, IsEnum, IsOptional, IsObject, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { SyncOperation } from '../entities/sync-event.entity.js';

export class CreateSyncEventDto {
  @IsEnum(SyncOperation)
  @ApiProperty({ enum: SyncOperation, description: 'Type of sync operation' })
  operation!: SyncOperation;

  @IsString()
  @ApiProperty({ description: 'Type of entity being synced' })
  entityType!: string;

  @IsUUID()
  @ApiProperty({ description: 'ID of the entity being synced' })
  entityId!: string;

  @IsObject()
  @ApiProperty({ description: 'Entity data' })
  data!: any;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Entity version', required: false })
  version?: number;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: any;
}

export class GetSyncEventsDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @Type(() => Date)
  @ApiProperty({ description: 'Get events since this timestamp', required: false })
  since?: Date;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiProperty({ description: 'Maximum number of events to return', required: false, default: 100 })
  limit?: number = 100;
}