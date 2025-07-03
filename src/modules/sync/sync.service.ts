import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SyncLog } from '../../entities/sync-log.entity';
import { DataRow } from '../../entities/data-row.entity';
import { DataHistory } from '../../entities/data-history.entity';
import { User } from '../../entities/user.entity';
import { SyncOperation } from '../../common/enums/sync-operation.enum';
import { PushSyncDto, SyncChangeDto } from './dto/push-sync.dto';
import { PullSyncDto } from './dto/pull-sync.dto';
import { ConflictResolverService } from './conflict-resolver.service';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncLog)
    private syncLogRepository: Repository<SyncLog>,
    @InjectRepository(DataRow)
    private dataRowRepository: Repository<DataRow>,
    @InjectRepository(DataHistory)
    private dataHistoryRepository: Repository<DataHistory>,
    private dataSource: DataSource,
    private conflictResolver: ConflictResolverService,
  ) {}

  async pushChanges(pushSyncDto: PushSyncDto, user: User) {
    const { workspaceId, clientId, changes } = pushSyncDto;
    const results = [];
    const serverTime = new Date();

    await this.dataSource.transaction(async (manager) => {
      for (const change of changes) {
        try {
          const result = await this.processChange(
            change,
            workspaceId,
            clientId,
            user,
            manager,
          );
          results.push(result);
        } catch (error) {
          results.push({
            rowId: change.rowId,
            error: error.message,
          });
        }
      }
    });

    return {
      serverTime,
      results,
    };
  }

  async pullChanges(pullSyncDto: PullSyncDto) {
    const { workspaceId, since, clientId } = pullSyncDto;
    const serverTime = new Date();

    const queryBuilder = this.syncLogRepository
      .createQueryBuilder('syncLog')
      .where('syncLog.workspaceId = :workspaceId', { workspaceId });

    if (since) {
      queryBuilder.andWhere('syncLog.timestamp > :since', { since });
    }

    if (clientId) {
      queryBuilder.andWhere('syncLog.clientId != :clientId', { clientId });
    }

    const changes = await queryBuilder
      .orderBy('syncLog.timestamp', 'ASC')
      .getMany();

    return {
      serverTime,
      changes,
    };
  }

  private async processChange(
    change: SyncChangeDto,
    workspaceId: string,
    clientId: string,
    user: User,
    manager: any,
  ) {
    const { tableId, rowId, operation, payload, versionVector } = change;

    // Find existing data row
    const existingRow = await manager.findOne(DataRow, {
      where: { id: rowId, tableId },
      withDeleted: true,
    });

    let mergedPayload = payload;
    let conflict = false;

    if (existingRow && operation !== SyncOperation.INSERT) {
      // Check for conflicts
      const hasConflict = this.conflictResolver.hasConflict(
        existingRow.versionVector,
        versionVector,
      );

      if (hasConflict) {
        conflict = true;
        mergedPayload = await this.conflictResolver.resolveConflict(
          existingRow,
          { payload, versionVector },
          tableId,
        );
      }
    }

    // Apply the operation
    let dataRow: DataRow;
    switch (operation) {
      case SyncOperation.INSERT:
        dataRow = manager.create(DataRow, {
          id: rowId,
          tableId,
          payload: mergedPayload,
          ownerId: user.id,
          versionVector,
        });
        break;

      case SyncOperation.UPDATE:
        if (existingRow) {
          existingRow.payload = mergedPayload;
          existingRow.versionVector = this.mergeVersionVectors(
            existingRow.versionVector,
            versionVector,
          );
          dataRow = existingRow;
        } else {
          // Create if doesn't exist
          dataRow = manager.create(DataRow, {
            id: rowId,
            tableId,
            payload: mergedPayload,
            ownerId: user.id,
            versionVector,
          });
        }
        break;

      case SyncOperation.SOFT_DELETE:
        if (existingRow) {
          existingRow.deletedAt = new Date();
          existingRow.versionVector = this.mergeVersionVectors(
            existingRow.versionVector,
            versionVector,
          );
          dataRow = existingRow;
        }
        break;

      case SyncOperation.HARD_DELETE:
        if (existingRow) {
          await manager.delete(DataHistory, { dataRowId: rowId });
          await manager.delete(DataRow, { id: rowId });
        }
        break;
    }

    if (dataRow && operation !== SyncOperation.HARD_DELETE) {
      await manager.save(DataRow, dataRow);
      
      // Create history entry
      const historyEntry = manager.create(DataHistory, {
        dataRowId: dataRow.id,
        payload: dataRow.payload,
        versionVector: dataRow.versionVector,
      });
      await manager.save(DataHistory, historyEntry);
    }

    // Create sync log entry
    const syncLogEntry = manager.create(SyncLog, {
      workspaceId,
      tableId,
      rowId,
      operation,
      payload: mergedPayload,
      clientId,
      versionVector: dataRow?.versionVector || versionVector,
    });
    await manager.save(SyncLog, syncLogEntry);

    return {
      rowId,
      mergedPayload: conflict ? mergedPayload : undefined,
      conflict,
    };
  }

  private mergeVersionVectors(
    existing: Record<string, number>,
    incoming: Record<string, number>,
  ): Record<string, number> {
    const merged = { ...existing };
    
    for (const [clientId, version] of Object.entries(incoming)) {
      merged[clientId] = Math.max(merged[clientId] || 0, version);
    }
    
    return merged;
  }
}