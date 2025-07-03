import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { AuthModule } from '../auth/auth.module';
import { ConflictResolverService } from './conflict-resolver.service';

@Module({
  imports: [AuthModule],
  providers: [SyncService, ConflictResolverService],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}