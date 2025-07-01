import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import {
  UpdateTenantStatusDto,
  UpdateTenantTierDto,
  CreateUserDto,
  UpdateUserStatusDto,
  TenantListQueryDto,
  UserListQueryDto,
} from './dto/admin.dto.js';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Platform statistics retrieved successfully' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Get all tenants with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully' })
  async getTenants(@Query() query: TenantListQueryDto) {
    return this.adminService.getTenants(query);
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantById(@Param('id') id: string) {
    return this.adminService.getTenantById(id);
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: 'Update tenant status' })
  @ApiResponse({ status: 200, description: 'Tenant status updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto
  ) {
    return this.adminService.updateTenantStatus(id, dto);
  }

  @Patch('tenants/:id/tier')
  @ApiOperation({ summary: 'Update tenant tier and limits' })
  @ApiResponse({ status: 200, description: 'Tenant tier updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateTenantTier(
    @Param('id') id: string,
    @Body() dto: UpdateTenantTierDto
  ) {
    return this.adminService.updateTenantTier(id, dto);
  }

  @Post('tenants/:id/suspend')
  @ApiOperation({ summary: 'Suspend tenant' })
  @ApiResponse({ status: 200, description: 'Tenant suspended successfully' })
  @HttpCode(HttpStatus.OK)
  async suspendTenant(
    @Param('id') id: string,
    @Body() body: { reason?: string }
  ) {
    return this.adminService.suspendTenant(id, body.reason);
  }

  @Post('tenants/:id/activate')
  @ApiOperation({ summary: 'Activate tenant' })
  @ApiResponse({ status: 200, description: 'Tenant activated successfully' })
  @HttpCode(HttpStatus.OK)
  async activateTenant(
    @Param('id') id: string,
    @Body() body: { reason?: string }
  ) {
    return this.adminService.activateTenant(id, body.reason);
  }

  @Get('tenants/:id/sync-stats')
  @ApiOperation({ summary: 'Get tenant sync statistics' })
  @ApiResponse({ status: 200, description: 'Tenant sync stats retrieved successfully' })
  async getTenantSyncStats(@Param('id') id: string) {
    return this.adminService.getTenantSyncStats(id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Query() query: UserListQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
  }
}