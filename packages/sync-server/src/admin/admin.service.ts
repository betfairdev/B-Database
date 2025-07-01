import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan } from 'typeorm';
import { Tenant, User, TenantStatus, UserStatus } from '@metadata-platform/core';
import { SyncEvent } from '../sync/entities/sync-event.entity.js';
import {
  UpdateTenantStatusDto,
  UpdateTenantTierDto,
  CreateUserDto,
  UpdateUserStatusDto,
  AdminStatsDto,
  TenantListQueryDto,
  UserListQueryDto,
} from './dto/admin.dto.js';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SyncEvent)
    private syncEventRepository: Repository<SyncEvent>,
  ) {}

  async getStats(): Promise<AdminStatsDto> {
    const [
      totalTenants,
      totalUsers,
      activeTenants,
      activeUsers,
      totalSyncEvents,
      syncEventsLast24h,
    ] = await Promise.all([
      this.tenantRepository.count(),
      this.userRepository.count(),
      this.tenantRepository.count({ where: { status: TenantStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.syncEventRepository.count(),
      this.syncEventRepository.count({
        where: {
          createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        },
      }),
    ]);

    return {
      totalTenants,
      totalUsers,
      activeTenants,
      activeUsers,
      totalSyncEvents,
      syncEventsLast24h,
    };
  }

  async getTenants(query: TenantListQueryDto) {
    const { status, tier, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    if (status) whereCondition.status = status;
    if (tier) whereCondition.tier = tier;
    if (search) {
      whereCondition.name = Like(`%${search}%`);
    }

    const [tenants, total] = await this.tenantRepository.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['users'],
    });

    return {
      data: tenants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTenantById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['users', 'dataSources'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async updateTenantStatus(id: string, dto: UpdateTenantStatusDto): Promise<Tenant> {
    const tenant = await this.getTenantById(id);
    
    tenant.status = dto.status;
    await this.tenantRepository.save(tenant);

    this.logger.log(`Tenant ${id} status updated to ${dto.status}. Reason: ${dto.reason || 'N/A'}`);
    
    return tenant;
  }

  async updateTenantTier(id: string, dto: UpdateTenantTierDto): Promise<Tenant> {
    const tenant = await this.getTenantById(id);
    
    tenant.tier = dto.tier;
    if (dto.maxUsers !== undefined) tenant.maxUsers = dto.maxUsers;
    if (dto.maxStorage !== undefined) tenant.maxStorage = dto.maxStorage;
    
    await this.tenantRepository.save(tenant);

    this.logger.log(`Tenant ${id} tier updated to ${dto.tier}`);
    
    return tenant;
  }

  async getUsers(query: UserListQueryDto) {
    const { tenantId, status, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    if (tenantId) whereCondition.tenantId = tenantId;
    if (status) whereCondition.status = status;
    if (search) {
      whereCondition.email = Like(`%${search}%`);
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['tenant', 'roles'],
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tenant', 'roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findOne({
      where: { id: dto.tenantId },
    });

    if (!tenant) {
      throw new BadRequestException(`Tenant with ID ${dto.tenantId} not found`);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existingUser) {
      throw new BadRequestException(`User with email ${dto.email} already exists in this tenant`);
    }

    const user = this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tenantId: dto.tenantId,
      status: dto.status || UserStatus.PENDING,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);

    this.logger.log(`User ${dto.email} created for tenant ${dto.tenantId}`);
    
    return user;
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<User> {
    const user = await this.getUserById(id);
    
    user.status = dto.status;
    await this.userRepository.save(user);

    this.logger.log(`User ${id} status updated to ${dto.status}. Reason: ${dto.reason || 'N/A'}`);
    
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    
    // Soft delete
    user.isDeleted = true;
    user.deletedAt = new Date();
    await this.userRepository.save(user);

    this.logger.log(`User ${id} soft deleted`);
  }

  async getTenantSyncStats(tenantId: string) {
    const tenant = await this.getTenantById(tenantId);
    
    const [totalEvents, eventsLast24h, eventsLast7d] = await Promise.all([
      this.syncEventRepository.count({ where: { tenantId } }),
      this.syncEventRepository.count({
        where: {
          tenantId,
          createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        },
      }),
      this.syncEventRepository.count({
        where: {
          tenantId,
          createdAt: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        },
      }),
    ]);

    const eventsByOperation = await this.syncEventRepository
      .createQueryBuilder('event')
      .select('event.operation', 'operation')
      .addSelect('COUNT(*)', 'count')
      .where('event.tenantId = :tenantId', { tenantId })
      .groupBy('event.operation')
      .getRawMany();

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
        tier: tenant.tier,
      },
      syncStats: {
        totalEvents,
        eventsLast24h,
        eventsLast7d,
        eventsByOperation: eventsByOperation.reduce((acc, item) => {
          acc[item.operation] = parseInt(item.count, 10);
          return acc;
        }, {}),
      },
    };
  }

  async suspendTenant(id: string, reason?: string): Promise<Tenant> {
    return this.updateTenantStatus(id, { 
      status: TenantStatus.SUSPENDED, 
      reason 
    });
  }

  async activateTenant(id: string, reason?: string): Promise<Tenant> {
    return this.updateTenantStatus(id, { 
      status: TenantStatus.ACTIVE, 
      reason 
    });
  }
}