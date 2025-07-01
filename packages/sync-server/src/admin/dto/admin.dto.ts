import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsNumber, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantStatus, TenantTier, UserStatus } from '@metadata-platform/core';

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatus)
  @ApiProperty({ enum: TenantStatus, description: 'New tenant status' })
  status!: TenantStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Reason for status change', required: false })
  reason?: string;
}

export class UpdateTenantTierDto {
  @IsEnum(TenantTier)
  @ApiProperty({ enum: TenantTier, description: 'New tenant tier' })
  tier!: TenantTier;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Maximum number of users', required: false })
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Maximum storage in bytes', required: false })
  maxStorage?: number;
}

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ description: 'User email address' })
  email!: string;

  @IsString()
  @ApiProperty({ description: 'User first name' })
  firstName!: string;

  @IsString()
  @ApiProperty({ description: 'User last name' })
  lastName!: string;

  @IsUUID()
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'User roles', required: false })
  roles?: string[];

  @IsOptional()
  @IsEnum(UserStatus)
  @ApiProperty({ enum: UserStatus, description: 'User status', required: false })
  status?: UserStatus;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  @ApiProperty({ enum: UserStatus, description: 'New user status' })
  status!: UserStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Reason for status change', required: false })
  reason?: string;
}

export class AdminStatsDto {
  @ApiProperty({ description: 'Total number of tenants' })
  totalTenants!: number;

  @ApiProperty({ description: 'Total number of users' })
  totalUsers!: number;

  @ApiProperty({ description: 'Active tenants count' })
  activeTenants!: number;

  @ApiProperty({ description: 'Active users count' })
  activeUsers!: number;

  @ApiProperty({ description: 'Total sync events' })
  totalSyncEvents!: number;

  @ApiProperty({ description: 'Sync events in last 24 hours' })
  syncEventsLast24h!: number;
}

export class TenantListQueryDto {
  @IsOptional()
  @IsEnum(TenantStatus)
  @ApiProperty({ enum: TenantStatus, description: 'Filter by tenant status', required: false })
  status?: TenantStatus;

  @IsOptional()
  @IsEnum(TenantTier)
  @ApiProperty({ enum: TenantTier, description: 'Filter by tenant tier', required: false })
  tier?: TenantTier;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Items per page', required: false, default: 20 })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search term', required: false })
  search?: string;
}

export class UserListQueryDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({ description: 'Filter by tenant ID', required: false })
  tenantId?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  @ApiProperty({ enum: UserStatus, description: 'Filter by user status', required: false })
  status?: UserStatus;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Items per page', required: false, default: 20 })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search term', required: false })
  search?: string;
}