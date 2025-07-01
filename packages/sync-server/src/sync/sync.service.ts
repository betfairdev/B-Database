import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SyncEvent } from './entities/sync-event.entity.js';
import { SyncGateway } from './sync.gateway.js';
import { RedisService } from '../redis/redis.service.js';
import { CreateSyncEventDto } from './dto/sync.dto.js';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(SyncEvent)
    private syncEventRepository: Repository<SyncEvent>,
    private syncGateway: SyncGateway,
    private redisService: RedisService,
  ) {}

  async submitEvents(events: CreateSyncEventDto[], user: any): Promise<void> {
    this.logger.log(`Processing ${events.length} sync events for tenant ${user.tenantId}`);

    const syncEvents = events.map(event => {
      const syncEvent = new SyncEvent();
      syncEvent.operation = event.operation;
      syncEvent.entityType = event.entityType;
      syncEvent.entityId = event.entityId;
      syncEvent.data = event.data;
      syncEvent.userId = user.id;
      syncEvent.tenantId = user.tenantId;
      syncEvent.version = event.version || 1;
      syncEvent.metadata = event.metadata;
      return syncEvent;
    });

    // Save events to database
    await this.syncEventRepository.save(syncEvents);

    // Broadcast to connected clients
    await this.broadcastEvents(syncEvents, user.tenantId);

    // Update sync status in Redis
    await this.updateSyncStatus(user.tenantId);
  }

  async getEventsSince(since: Date | undefined, tenantId: string, limit = 100): Promise<SyncEvent[]> {
    const whereCondition: any = { tenantId };
    
    if (since) {
      whereCondition.createdAt = MoreThan(since);
    }

    return this.syncEventRepository.find({
      where: whereCondition,
      order: {
        createdAt: 'ASC',
      },
      take: limit,
    });
  }

  async getSyncStatus(tenantId: string): Promise<any> {
    const statusKey = `sync:status:${tenantId}`;
    const status = await this.redisService.get(statusKey);
    
    if (!status) {
      const lastEvent = await this.syncEventRepository.findOne({
        where: { tenantId },
        order: { createdAt: 'DESC' },
      });

      const defaultStatus = {
        lastSyncTimestamp: lastEvent?.createdAt || new Date(0),
        totalEvents: await this.syncEventRepository.count({ where: { tenantId } }),
        connectedClients: this.syncGateway.getConnectedClients(tenantId),
      };

      await this.redisService.set(statusKey, JSON.stringify(defaultStatus), 300); // 5 minutes TTL
      return defaultStatus;
    }

    return JSON.parse(status);
  }

  async resolveConflict(conflictData: any, user: any): Promise<void> {
    this.logger.log(`Resolving conflict for entity ${conflictData.entityId}`);

    // Create resolution event
    const resolutionEvent = new SyncEvent();
    resolutionEvent.operation = 'update';
    resolutionEvent.entityType = conflictData.entityType;
    resolutionEvent.entityId = conflictData.entityId;
    resolutionEvent.data = conflictData.resolvedData;
    resolutionEvent.userId = user.id;
    resolutionEvent.tenantId = user.tenantId;
    resolutionEvent.version = conflictData.version + 1;

    await this.syncEventRepository.save(resolutionEvent);
    await this.broadcastEvents([resolutionEvent], user.tenantId);
  }

  async getEventsByEntity(entityType: string, entityId: string, tenantId: string): Promise<SyncEvent[]> {
    return this.syncEventRepository.find({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async getEventStats(tenantId: string): Promise<any> {
    const stats = await this.syncEventRepository
      .createQueryBuilder('event')
      .select('event.operation', 'operation')
      .addSelect('COUNT(*)', 'count')
      .where('event.tenantId = :tenantId', { tenantId })
      .groupBy('event.operation')
      .getRawMany();

    return stats.reduce((acc, stat) => {
      acc[stat.operation] = parseInt(stat.count, 10);
      return acc;
    }, {});
  }

  private async broadcastEvents(events: SyncEvent[], tenantId: string): Promise<void> {
    try {
      this.syncGateway.broadcastToTenant(tenantId, 'sync-events', events);
    } catch (error) {
      this.logger.error(`Failed to broadcast events: ${error.message}`);
    }
  }

  private async updateSyncStatus(tenantId: string): Promise<void> {
    const statusKey = `sync:status:${tenantId}`;
    const status = {
      lastSyncTimestamp: new Date(),
      totalEvents: await this.syncEventRepository.count({ where: { tenantId } }),
      connectedClients: this.syncGateway.getConnectedClients(tenantId),
    };

    await this.redisService.set(statusKey, JSON.stringify(status), 300); // 5 minutes TTL
  }
}