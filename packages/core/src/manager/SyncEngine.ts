import { DataSource } from 'typeorm';
import { DBManagerConfig, SyncReport, SyncOperation, ConflictInfo } from '../types';
import { ConflictService } from '../services/ConflictService';

export class SyncEngine {
  private conflictService: ConflictService;
  private lastSyncTime?: Date;
  private operationQueue: SyncOperation[] = [];

  constructor(
    private config: DBManagerConfig,
    private dataSource: DataSource
  ) {
    this.conflictService = new ConflictService();
  }

  async sync(): Promise<SyncReport> {
    const startTime = new Date();
    const report: SyncReport = {
      startTime,
      endTime: new Date(),
      operations: {
        pulled: 0,
        pushed: 0,
        conflicts: 0,
        errors: 0
      },
      tables: [],
      conflicts: [],
      errors: []
    };

    try {
      if (this.config.mode === 'device') {
        // Device mode: push local changes, then pull remote changes
        const pushResult = await this.pushChanges();
        const pullResult = await this.pullChanges();

        report.operations.pushed = pushResult.pushed;
        report.operations.pulled = pullResult.pulled;
        report.operations.conflicts = pullResult.conflicts.length;
        report.conflicts = pullResult.conflicts;
      } else {
        // Sync-server mode: handle incoming sync requests
        // This would be implemented in a server context
      }

      this.lastSyncTime = new Date();
    } catch (error) {
      report.errors?.push({
        operation: 'sync',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
      report.operations.errors++;
    }

    report.endTime = new Date();
    return report;
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.config.sync?.serverUrl) return false;

    try {
      const response = await fetch(`${this.config.sync.serverUrl}/sync/check-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastSync: this.lastSyncTime?.toISOString()
        })
      });

      const result = await response.json();
      return result.hasUpdates || false;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }

  private async pushChanges(): Promise<{ pushed: number }> {
    if (!this.config.sync?.serverUrl || this.operationQueue.length === 0) {
      return { pushed: 0 };
    }

    try {
      const response = await fetch(`${this.config.sync.serverUrl}/sync/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations: this.operationQueue
        })
      });

      if (response.ok) {
        const pushedCount = this.operationQueue.length;
        this.operationQueue = []; // Clear queue only after successful push
        return { pushed: pushedCount };
      }

      throw new Error(`Push failed: ${response.statusText}`);
    } catch (error) {
      console.error('Failed to push changes:', error);
      return { pushed: 0 };
    }
  }

  private async pullChanges(): Promise<{ pulled: number; conflicts: ConflictInfo[] }> {
    if (!this.config.sync?.serverUrl) {
      return { pulled: 0, conflicts: [] };
    }

    try {
      const url = new URL(`${this.config.sync.serverUrl}/sync/operations`);
      if (this.lastSyncTime) {
        url.searchParams.append('since', this.lastSyncTime.toISOString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      const operations: SyncOperation[] = result.operations || [];
      const conflicts: ConflictInfo[] = [];

      let pulledCount = 0;
      
      for (const operation of operations) {
        try {
          await this.applyOperation(operation);
          pulledCount++;
        } catch (error) {
          if (error instanceof ConflictError) {
            conflicts.push(error.conflict);
          } else {
            console.error('Failed to apply operation:', error);
          }
        }
      }

      // Resolve conflicts
      const resolvedConflicts = await this.conflictService.resolveConflicts(conflicts);
      for (const conflict of resolvedConflicts) {
        if (conflict.resolution !== 'skip') {
          // Apply conflict resolution
          await this.applyConflictResolution(conflict);
        }
      }

      return { pulled: pulledCount, conflicts: resolvedConflicts };
    } catch (error) {
      console.error('Failed to pull changes:', error);
      return { pulled: 0, conflicts: [] };
    }
  }

  private async applyOperation(operation: SyncOperation): Promise<void> {
    const repository = this.dataSource.getRepository(operation.table);
    
    switch (operation.operation) {
      case 'create':
        if (operation.data) {
          await repository.save(operation.data);
        }
        break;

      case 'update':
        const existing = await repository.findOne({ where: { id: operation.recordId } });
        if (existing && operation.data) {
          // Check for conflicts
          if (existing.updatedAt > operation.timestamp) {
            throw new ConflictError({
              table: operation.table,
              recordId: operation.recordId,
              field: 'updatedAt',
              localValue: existing.updatedAt,
              remoteValue: operation.timestamp,
              resolution: 'skip'
            });
          }
          await repository.save({ ...existing, ...operation.data });
        }
        break;

      case 'delete':
        await repository.softDelete({ id: operation.recordId });
        break;
    }
  }

  private async applyConflictResolution(conflict: ConflictInfo): Promise<void> {
    const repository = this.dataSource.getRepository(conflict.table);
    const record = await repository.findOne({ where: { id: conflict.recordId } });
    
    if (!record) return;

    switch (conflict.resolution) {
      case 'local':
        // Keep local value, no action needed
        break;
      
      case 'remote':
        record[conflict.field] = conflict.remoteValue;
        await repository.save(record);
        break;
      
      case 'merge':
        const mergedValue = this.conflictService.mergeValues(
          conflict.localValue,
          conflict.remoteValue,
          conflict.field
        );
        record[conflict.field] = mergedValue;
        await repository.save(record);
        break;
    }
  }

  queueOperation(operation: SyncOperation): void {
    this.operationQueue.push(operation);
  }

  getQueuedOperations(): SyncOperation[] {
    return [...this.operationQueue];
  }

  clearQueue(): void {
    this.operationQueue = [];
  }
}

class ConflictError extends Error {
  constructor(public conflict: ConflictInfo) {
    super(`Conflict detected in ${conflict.table}.${conflict.field}`);
  }
}