import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncLog } from '../../entities/sync-log.entity';
import { DataRow } from '../../entities/data-row.entity';
import { DataHistory } from '../../entities/data-history.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { AuthModule } from '../auth/auth.module';
import { ConflictResolverService } from './conflict-resolver.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncLog, DataRow, DataHistory, WorkspaceUserRole]),
    AuthModule,
  ],
  providers: [SyncService, ConflictResolverService],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}