import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { SyncGateway } from './sync.gateway.js';
import { SyncEvent } from './entities/sync-event.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncEvent]),
    AuthModule,
    RedisModule,
  ],
  controllers: [SyncController],
  providers: [SyncService, SyncGateway],
  exports: [SyncService],
})
export class SyncModule {}