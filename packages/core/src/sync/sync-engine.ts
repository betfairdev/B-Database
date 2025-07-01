import { EventEmitter } from 'events';
import * as Y from 'yjs';

/**
 * Conflict resolution strategy
 */
export enum ConflictResolution {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
}

/**
 * Sync operation types
 */
export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

/**
 * Sync event interface
 */
export interface ISyncEvent {
  id: string;
  operation: SyncOperation;
  entityType: string;
  entityId: string;
  data: any;
  timestamp: Date;
  userId: string;
  tenantId: string;
  version: number;
}

/**
 * Conflict interface
 */
export interface IConflict {
  id: string;
  entityType: string;
  entityId: string;
  clientVersion: any;
  serverVersion: any;
  strategy: ConflictResolution;
  resolved: boolean;
  createdAt: Date;
}

/**
 * Sync state interface
 */
export interface ISyncState {
  lastSyncTimestamp: Date;
  pendingEvents: ISyncEvent[];
  conflicts: IConflict[];
  isOnline: boolean;
  isSyncing: boolean;
}

/**
 * CRDT-based sync engine for real-time collaboration
 */
export class SyncEngine extends EventEmitter {
  private doc: Y.Doc;
  private state: ISyncState;
  private conflictHandlers: Map<string, (conflict: IConflict) => Promise<any>>;

  constructor(private tenantId: string, private userId: string) {
    super();
    this.doc = new Y.Doc();
    this.state = {
      lastSyncTimestamp: new Date(0),
      pendingEvents: [],
      conflicts: [],
      isOnline: navigator.onLine,
      isSyncing: false,
    };
    this.conflictHandlers = new Map();

    // Listen for online/offline events
    window.addEventListener('online', () => this.setOnlineStatus(true));
    window.addEventListener('offline', () => this.setOnlineStatus(false));

    // Set up CRDT document observers
    this.setupDocumentObservers();
  }

  /**
   * Initialize sync engine
   */
  async initialize(): Promise<void> {
    await this.loadState();
    if (this.state.isOnline) {
      await this.performSync();
    }
    this.emit('initialized');
  }

  /**
   * Apply local change
   */
  async applyLocalChange(event: Omit<ISyncEvent, 'id' | 'timestamp'>): Promise<void> {
    const syncEvent: ISyncEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
    };

    // Apply to CRDT document
    this.applyEventToDoc(syncEvent);

    // Add to pending events if offline
    if (!this.state.isOnline) {
      this.state.pendingEvents.push(syncEvent);
      await this.saveState();
    } else {
      // Send to server immediately
      await this.sendToServer([syncEvent]);
    }

    this.emit('localChange', syncEvent);
  }

  /**
   * Apply remote changes
   */
  async applyRemoteChanges(events: ISyncEvent[]): Promise<void> {
    const conflicts: IConflict[] = [];

    for (const event of events) {
      const conflict = await this.detectConflict(event);
      if (conflict) {
        conflicts.push(conflict);
        this.state.conflicts.push(conflict);
      } else {
        this.applyEventToDoc(event);
      }
    }

    if (conflicts.length > 0) {
      await this.resolveConflicts(conflicts);
    }

    this.state.lastSyncTimestamp = new Date();
    await this.saveState();
    this.emit('remoteChanges', events);
  }

  /**
   * Perform full synchronization
   */
  async performSync(): Promise<void> {
    if (this.state.isSyncing || !this.state.isOnline) {
      return;
    }

    this.state.isSyncing = true;
    this.emit('syncStart');

    try {
      // Send pending events
      if (this.state.pendingEvents.length > 0) {
        await this.sendToServer(this.state.pendingEvents);
        this.state.pendingEvents = [];
      }

      // Receive remote changes
      const remoteEvents = await this.fetchFromServer(this.state.lastSyncTimestamp);
      if (remoteEvents.length > 0) {
        await this.applyRemoteChanges(remoteEvents);
      }

      this.emit('syncSuccess');
    } catch (error) {
      this.emit('syncError', error);
      throw error;
    } finally {
      this.state.isSyncing = false;
      this.emit('syncEnd');
      await this.saveState();
    }
  }

  /**
   * Register conflict handler
   */
  registerConflictHandler(entityType: string, handler: (conflict: IConflict) => Promise<any>): void {
    this.conflictHandlers.set(entityType, handler);
  }

  /**
   * Get current sync state
   */
  getState(): ISyncState {
    return { ...this.state };
  }

  /**
   * Get CRDT document
   */
  getDocument(): Y.Doc {
    return this.doc;
  }

  private setupDocumentObservers(): void {
    this.doc.on('update', (update: Uint8Array) => {
      this.emit('documentUpdate', update);
    });
  }

  private setOnlineStatus(isOnline: boolean): void {
    const wasOffline = !this.state.isOnline;
    this.state.isOnline = isOnline;

    if (isOnline && wasOffline && this.state.pendingEvents.length > 0) {
      // Auto-sync when coming back online
      this.performSync().catch(error => {
        this.emit('syncError', error);
      });
    }

    this.emit('onlineStatusChange', isOnline);
  }

  private async detectConflict(event: ISyncEvent): Promise<IConflict | null> {
    // Get current document state for the entity
    const entityMap = this.doc.getMap(event.entityType);
    const currentData = entityMap.get(event.entityId);

    if (!currentData) {
      return null; // No conflict if entity doesn't exist locally
    }

    // Simple version-based conflict detection
    if (currentData.version !== event.version - 1) {
      return {
        id: this.generateEventId(),
        entityType: event.entityType,
        entityId: event.entityId,
        clientVersion: currentData,
        serverVersion: event.data,
        strategy: ConflictResolution.MERGE, // Default strategy
        resolved: false,
        createdAt: new Date(),
      };
    }

    return null;
  }

  private async resolveConflicts(conflicts: IConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      const handler = this.conflictHandlers.get(conflict.entityType);
      
      if (handler) {
        try {
          const resolved = await handler(conflict);
          conflict.resolved = true;
          
          // Apply resolved data to document
          const entityMap = this.doc.getMap(conflict.entityType);
          entityMap.set(conflict.entityId, resolved);
        } catch (error) {
          this.emit('conflictResolutionError', { conflict, error });
        }
      } else {
        // Use default resolution strategy
        await this.applyDefaultResolution(conflict);
      }
    }
  }

  private async applyDefaultResolution(conflict: IConflict): Promise<void> {
    const entityMap = this.doc.getMap(conflict.entityType);

    switch (conflict.strategy) {
      case ConflictResolution.CLIENT_WINS:
        // Keep client version
        break;
      case ConflictResolution.SERVER_WINS:
        entityMap.set(conflict.entityId, conflict.serverVersion);
        break;
      case ConflictResolution.MERGE:
        const merged = this.mergeVersions(conflict.clientVersion, conflict.serverVersion);
        entityMap.set(conflict.entityId, merged);
        break;
      case ConflictResolution.MANUAL:
        // Emit event for manual resolution
        this.emit('manualConflictResolution', conflict);
        return;
    }

    conflict.resolved = true;
  }

  private mergeVersions(clientVersion: any, serverVersion: any): any {
    // Simple merge strategy - server wins for conflicts, client wins for additions
    return {
      ...clientVersion,
      ...serverVersion,
      mergedAt: new Date(),
    };
  }

  private applyEventToDoc(event: ISyncEvent): void {
    const entityMap = this.doc.getMap(event.entityType);

    switch (event.operation) {
      case SyncOperation.CREATE:
      case SyncOperation.UPDATE:
        entityMap.set(event.entityId, event.data);
        break;
      case SyncOperation.DELETE:
        entityMap.delete(event.entityId);
        break;
    }
  }

  private async sendToServer(events: ISyncEvent[]): Promise<void> {
    // Implementation would send events to sync server
    // This is a placeholder for the actual network implementation
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async fetchFromServer(since: Date): Promise<ISyncEvent[]> {
    // Implementation would fetch events from sync server
    // This is a placeholder for the actual network implementation
    await new Promise(resolve => setTimeout(resolve, 100));
    return [];
  }

  private async loadState(): Promise<void> {
    // Load state from local storage
    const saved = localStorage.getItem(`sync-state-${this.tenantId}-${this.userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.state = {
        ...this.state,
        ...parsed,
        lastSyncTimestamp: new Date(parsed.lastSyncTimestamp),
      };
    }
  }

  private async saveState(): Promise<void> {
    // Save state to local storage
    localStorage.setItem(
      `sync-state-${this.tenantId}-${this.userId}`,
      JSON.stringify(this.state)
    );
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}