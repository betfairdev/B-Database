import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PullSyncDto {
  @ApiProperty()
  @IsString()
  workspaceId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  since?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;
}